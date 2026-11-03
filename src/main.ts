import "./style.css";
import {
  ARCS, CHARACTERS, EMPERORS, FACTIONS, ISLANDS, LATEST_CHAPTER, ROUTE, SAGAS,
  type Arc, type Character, type Island,
} from "./data/world";
import { ChartMap, controlAt, seaOf } from "./map";

// ── Small helpers ───────────────────────────────────────────────
const $ = <T extends HTMLElement = HTMLElement>(s: string) => document.querySelector(s) as T;
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
const store = {
  get(k: string) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k: string, v: string) { try { localStorage.setItem(k, v); } catch { /* private mode */ } },
};
const berries = (n: number) => n.toLocaleString("en-US");
const short = (n: number) => n >= 1e9 ? `${+(n / 1e9).toFixed(3)}B` : n >= 1e6 ? `${+(n / 1e6).toFixed(1)}M` : n.toLocaleString("en-US");

const arcAt = (ch: number): Arc => ARCS.find((a) => ch >= a.ch[0] && ch <= a.ch[1]) ?? ARCS[ARCS.length - 1];

/** Anime episode → manga chapter, by linear interpolation inside each arc. */
function epToCh(ep: number): number {
  let best = 1;
  for (const a of ARCS) {
    if (!a.ep) continue;
    const [e0, e1] = a.ep;
    if (ep >= e0 && ep <= e1) return Math.round(a.ch[0] + ((ep - e0) / Math.max(1, e1 - e0)) * (a.ch[1] - a.ch[0]));
    if (ep > e1) best = a.ch[1];
  }
  return best;
}
function chToEp(ch: number): number | null {
  const a = arcAt(ch);
  if (!a.ep) return null;
  return Math.round(a.ep[0] + ((ch - a.ch[0]) / Math.max(1, a.ch[1] - a.ch[0])) * (a.ep[1] - a.ep[0]));
}
const bountyAt = (c: Character, ch: number) => {
  let b: number | null = null;
  for (const [at, v] of c.bounty) if (at <= ch) b = v;
  return b;
};
const crewAt = (c: Character, ch: number) => {
  let crew = "";
  for (const [at, v] of c.crew) if (at <= ch) crew = v;
  return crew;
};

// ── State ───────────────────────────────────────────────────────
type Tab = "explore" | "bounties" | "powers" | "arcs";
const state = {
  shield: Number(store.get("gla-shield")) || 0, // 0 = not chosen yet
  ch: 1,
  selected: null as string | null,
  tab: "explore" as Tab,
  bountyFilter: "all" as "all" | "straw",
};

const map = new ChartMap($("#map"), { onSelect: (id) => select(id) });

// ── URL ─────────────────────────────────────────────────────────
function readHash() {
  const p = new URLSearchParams(location.hash.slice(1));
  return { ch: Number(p.get("c")) || 0, island: p.get("i"), tab: p.get("t") as Tab | null };
}
let hashTimer = 0;
function writeHash() {
  clearTimeout(hashTimer);
  hashTimer = window.setTimeout(() => {
    const p = new URLSearchParams();
    p.set("c", String(state.ch));
    if (state.selected) p.set("i", state.selected);
    if (state.tab !== "explore") p.set("t", state.tab);
    history.replaceState(null, "", "#" + p.toString());
  }, 150);
}

// ── Chapter & selection ─────────────────────────────────────────
function setChapter(ch: number, opts: { fromSlider?: boolean } = {}) {
  ch = Math.max(1, Math.min(Math.round(ch), state.shield || 1));
  state.ch = ch;
  map.focus = arcAt(ch).island;
  map.setChapter(ch);
  if (state.selected && !ISLANDS.some((i) => i.id === state.selected && i.first <= ch)) state.selected = null;
  renderTimeline(opts.fromSlider);
  renderPanel();
  writeHash();
}

function select(id: string | null) {
  state.selected = id;
  if (id) state.tab = "explore";
  map.select(id);
  renderPanel();
  writeHash();
  if (id) openSheet();
}

// ── Timeline ────────────────────────────────────────────────────
const slider = $<HTMLInputElement>("#chapter");
function buildTrack() {
  const track = $("#arc-track");
  track.replaceChildren();
  for (const a of ARCS) {
    const seg = document.createElement("div");
    seg.className = "seg";
    seg.style.flexGrow = String(a.ch[1] - a.ch[0] + 1);
    seg.style.setProperty("--hue", SAGAS[a.saga].hue);
    seg.dataset.arc = a.id;
    track.appendChild(seg);
  }
  slider.max = String(LATEST_CHAPTER);
}
function renderTimeline(fromSlider = false) {
  const a = arcAt(state.ch), ep = chToEp(state.ch);
  if (!fromSlider) slider.value = String(state.ch);
  slider.setAttribute("aria-valuetext", `Chapter ${state.ch}, ${a.name} arc`);
  $("#readout-ch").textContent = `Ch. ${state.ch}`;
  $("#readout-arc").textContent = `${a.name}`;
  $("#readout-arc").style.setProperty("--hue", SAGAS[a.saga].hue);
  $("#readout-ep").textContent = ep ? `≈ Ep. ${ep}` : "Anime not there yet";
  $("#readout-saga").textContent = `${SAGAS[a.saga].name} Saga`;
  const pct = (state.shield / LATEST_CHAPTER) * 100;
  $("#locked").style.left = `${pct}%`;
  $("#locked").hidden = state.shield >= LATEST_CHAPTER;
  document.querySelectorAll<HTMLElement>("#arc-track .seg").forEach((s) => {
    const arc = ARCS.find((x) => x.id === s.dataset.arc)!;
    s.classList.toggle("current", arc === a);
    s.classList.toggle("future", arc.ch[0] > state.shield);
    s.title = arc.ch[0] > state.shield ? "Locked by your spoiler shield" : `${arc.name} · ch. ${arc.ch[0]}–${arc.ch[1]}`;
  });
  $("#shield-label").innerHTML = !state.shield ? "Spoiler shield" : state.shield >= LATEST_CHAPTER ? "Caught up" : `<span class="long">Up to </span>ch. ${state.shield}`;
}
slider.addEventListener("input", () => {
  const v = Number(slider.value);
  if (v > state.shield) { slider.value = String(state.shield); toast("That's past your spoiler shield. Raise it from the lock button."); }
  setChapter(Math.min(v, state.shield), { fromSlider: true });
});
$("#prev-arc").addEventListener("click", () => {
  const i = ARCS.indexOf(arcAt(state.ch));
  const a = state.ch > arcAt(state.ch).ch[0] ? ARCS[i] : ARCS[Math.max(0, i - 1)];
  jumpArc(a);
});
$("#next-arc").addEventListener("click", () => {
  const a = ARCS[ARCS.indexOf(arcAt(state.ch)) + 1];
  if (!a) return;
  if (a.ch[0] > state.shield) return toast("The next arc is past your spoiler shield.");
  jumpArc(a);
});
function jumpArc(a: Arc) {
  setChapter(a.ch[0]);
  const isl = ISLANDS.find((i) => i.id === a.island);
  if (isl && isl.first <= state.ch) select(isl.id);
}

// ── Panel ───────────────────────────────────────────────────────
function renderPanel() {
  document.querySelectorAll<HTMLButtonElement>(".tabs button").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.tab === state.tab)));
  const body = $("#panel-body");
  body.innerHTML = state.tab === "explore" ? (state.selected ? islandView(state.selected) : overview())
    : state.tab === "bounties" ? bountiesView() : state.tab === "powers" ? powersView() : arcsView();
  body.scrollTop = 0;
}

function chip(text: string, color: string) {
  return `<span class="chip" style="--c:${color}">${esc(text)}</span>`;
}

function islandView(id: string) {
  const i = ISLANDS.find((x) => x.id === id)!;
  const ch = state.ch;
  const f = controlAt(i, ch);
  const notes = i.notes.filter(([c]) => c <= ch);
  const arcs = ARCS.filter((a) => a.island === id && a.ch[0] <= ch);
  const visits = ROUTE.filter(([r, c]) => r === id && c <= ch).map(([, c]) => c);
  return `
    <article class="card island-card">
      <button class="back" data-action="clear">← Overview</button>
      <p class="kicker">${esc(seaOf(i))}</p>
      <h2 class="title">${esc(i.name)}</h2>
      <div class="chips">
        ${f ? chip(FACTIONS[f].name, FACTIONS[f].color) : ""}
        ${visits.length ? chip(`Straw Hats arrive · ch. ${visits.join(", ")}`, "var(--red)") : ""}
      </div>
      <ol class="notes">${notes.map(([c, t]) => `<li><span class="ch">Ch. ${c}</span><p>${esc(t)}</p></li>`).join("")}</ol>
      ${arcs.length ? `<h3 class="sub">Arcs here</h3><div class="arc-list">${arcs.map(arcRow).join("")}</div>` : ""}
      <p class="fine">Position on the chart is approximate.</p>
    </article>`;
}

function arcRow(a: Arc) {
  const locked = a.ch[0] > state.shield;
  const done = state.ch >= a.ch[1];
  return `<button class="arc-row${a === arcAt(state.ch) ? " current" : ""}" data-arc="${a.id}" ${locked ? "disabled" : ""} style="--hue:${SAGAS[a.saga].hue}">
    <span class="arc-name">${locked ? "Locked arc" : esc(a.name)}</span>
    <span class="arc-ch">${locked ? `after ch. ${state.shield}` : `ch. ${a.ch[0]}–${a.ch[1]}${a.ep ? ` · ep. ${a.ep[0]}–${a.ep[1]}` : ""}`}</span>
    ${!locked && done ? `<span class="arc-sum">${esc(a.summary)}</span>` : ""}
  </button>`;
}

function crewNow() {
  return CHARACTERS.filter((c) => c.first <= state.ch && crewAt(c, state.ch) === "Straw Hat Pirates");
}

function overview() {
  const a = arcAt(state.ch), done = state.ch >= a.ch[1];
  const ship = state.ch >= 436 ? "Thousand Sunny" : state.ch >= 41 ? "Going Merry" : "a small boat";
  const crew = crewNow();
  const total = crew.reduce((s, c) => s + (bountyAt(c, state.ch) ?? 0), 0);
  return `
    <article class="card">
      <p class="kicker" style="--hue:${SAGAS[a.saga].hue}">${esc(SAGAS[a.saga].name)} Saga · now reading</p>
      <h2 class="title">${esc(a.name)}</h2>
      <p class="meta">Chapters ${a.ch[0]}–${a.ch[1]}${a.ep ? ` · Episodes ${a.ep[0]}–${a.ep[1]}` : ""}</p>
      <p class="lede">${done ? esc(a.summary) : `<span class="veil">Summary unlocks at the end of the arc (ch. ${a.ch[1]}).</span>`}</p>
      <button class="cta" data-goto="${a.island}">Go to ${esc(ISLANDS.find((i) => i.id === a.island)?.name ?? "")}</button>
    </article>
    <article class="card">
      <p class="kicker">The crew · aboard the ${ship}</p>
      <div class="roster">${crew.map((c) => `<div class="mate"><span class="mono">${initials(c.name)}</span><span><b>${esc(c.name)}</b><small>${bountyAt(c, state.ch) ? short(bountyAt(c, state.ch)!) + " berries" : "no bounty yet"}</small></span></div>`).join("")}</div>
      <p class="total">Total bounty <b>${berries(total)}</b> berries</p>
    </article>
    <article class="card how">
      <p class="kicker">How to read the chart</p>
      <ul>
        <li><i class="k-route"></i> The Straw Hats' voyage so far</li>
        <li><i class="k-terr"></i> Dashed rings mark who controls an island</li>
        <li><i class="k-belt"></i> Dotted bands are the windless Calm Belts</li>
        <li><i class="k-red"></i> The Red Line, a continent circling the world</li>
      </ul>
    </article>`;
}

const initials = (n: string) => n.replace(/\b(D\.|Tony|of|the)\s/g, "").split(/\s+/).map((w) => w[0]).slice(0, 2).join("");

function bountiesView() {
  const list = CHARACTERS.filter((c) => c.first <= state.ch && bountyAt(c, state.ch) !== null)
    .filter((c) => state.bountyFilter === "all" || crewAt(c, state.ch) === "Straw Hat Pirates")
    .sort((a, b) => bountyAt(b, state.ch)! - bountyAt(a, state.ch)!);
  return `
    <div class="seg-ctl" role="radiogroup" aria-label="Filter bounties">
      <button role="radio" aria-checked="${state.bountyFilter === "all"}" data-filter="all">Everyone</button>
      <button role="radio" aria-checked="${state.bountyFilter === "straw"}" data-filter="straw">Straw Hats</button>
    </div>
    <p class="fine">Bounties as known at chapter ${state.ch}. Reveal chapters are approximate.</p>
    <div class="posters">${list.length ? list.map(poster).join("") : `<p class="empty">No bounties known yet.</p>`}</div>`;
}

function poster(c: Character) {
  const b = bountyAt(c, state.ch)!;
  const hist = c.bounty.filter(([at]) => at <= state.ch);
  return `<figure class="poster">
    <div class="wanted">WANTED</div>
    <div class="portrait"><span>${initials(c.name)}</span></div>
    <div class="doa">DEAD OR ALIVE</div>
    <figcaption>
      <b>${esc(c.name)}</b>
      ${c.epithet ? `<i>“${esc(c.epithet)}”</i>` : ""}
      <span class="amt">${berries(b)}<small>berries</small></span>
      <span class="crew">${esc(crewAt(c, state.ch))}</span>
      ${hist.length > 1 ? `<span class="hist">${hist.map(([at, v]) => `<span title="chapter ${at}">${short(v)}</span>`).join("<em>→</em>")}</span>` : ""}
    </figcaption>
  </figure>`;
}

function powersView() {
  const ch = state.ch;
  const emps = EMPERORS.filter((e) => e.known <= ch && ch >= e.from && (e.to === undefined || ch < e.to));
  const fallen = EMPERORS.filter((e) => e.known <= ch && e.to !== undefined && ch >= e.to);
  const hq = ch >= 597 ? "G-1, in the New World" : ch >= 550 ? "Marineford" : "Marineford (unseen)";
  const fleet = ch >= 597 ? "Sakazuki (Akainu)" : ch >= 550 ? "Sengoku" : "—";
  const warlords = ch < 50 ? null : ch >= 956 ? "Abolished (ch. 956)" : "Active — seven pirates licensed by the Government";
  const terr = new Map<string, string[]>();
  for (const i of ISLANDS) if (i.first <= ch) {
    const f = controlAt(i, ch);
    if (f) terr.set(f, [...(terr.get(f) ?? []), i.name]);
  }
  return `
    <article class="card">
      <p class="kicker">The Four Emperors</p>
      ${emps.length ? `<ul class="emperors">${emps.map((e) => `<li style="--c:${FACTIONS[e.faction].color}"><b>${esc(e.name)}</b><span>${esc(FACTIONS[e.faction].name)}</span></li>`).join("")}</ul>` : `<p class="veil">Nobody has mentioned the Emperors yet.</p>`}
      ${fallen.length ? `<p class="fine">No longer Emperors: ${fallen.map((e) => esc(e.name)).join(", ")}</p>` : ""}
    </article>
    <article class="card">
      <p class="kicker">World Government & Marines</p>
      <dl class="facts">
        <dt>Marine HQ</dt><dd>${hq}</dd>
        <dt>Fleet Admiral</dt><dd>${fleet}</dd>
        ${warlords ? `<dt>Warlords</dt><dd>${warlords}</dd>` : ""}
      </dl>
    </article>
    <article class="card">
      <p class="kicker">Territories on the chart</p>
      <ul class="legend">${[...terr].map(([f, names]) => `<li style="--c:${FACTIONS[f as keyof typeof FACTIONS].color}"><b>${esc(FACTIONS[f as keyof typeof FACTIONS].name)}</b><span>${names.map(esc).join(", ")}</span></li>`).join("") || `<li class="veil">No territories yet.</li>`}</ul>
    </article>`;
}

function arcsView() {
  const out: string[] = [];
  for (const id of Object.keys(SAGAS) as (keyof typeof SAGAS)[]) {
    const arcs = ARCS.filter((a) => a.saga === id);
    if (arcs[0].ch[0] > state.shield) { out.push(`<h3 class="sub locked-saga">Locked saga</h3>`); continue; }
    out.push(`<h3 class="sub" style="--hue:${SAGAS[id].hue}">${esc(SAGAS[id].name)} Saga</h3><div class="arc-list">${arcs.map(arcRow).join("")}</div>`);
  }
  // Collapse runs of locked sagas
  return out.join("").replace(/(<h3 class="sub locked-saga">Locked saga<\/h3>)+/g, `<h3 class="sub locked-saga">More sagas hidden by your spoiler shield</h3>`);
}

$("#panel-body").addEventListener("click", (e) => {
  const t = (e.target as HTMLElement).closest<HTMLElement>("[data-action],[data-arc],[data-goto],[data-filter]");
  if (!t) return;
  if (t.dataset.action === "clear") select(null);
  if (t.dataset.arc) jumpArc(ARCS.find((a) => a.id === t.dataset.arc)!);
  if (t.dataset.goto) select(t.dataset.goto);
  if (t.dataset.filter) { state.bountyFilter = t.dataset.filter as "all" | "straw"; renderPanel(); }
});
document.querySelectorAll<HTMLButtonElement>(".tabs button").forEach((b) => b.addEventListener("click", () => {
  state.tab = b.dataset.tab as Tab;
  renderPanel(); writeHash(); openSheet();
}));

// ── Search (only what the shield allows) ────────────────────────
const search = $<HTMLInputElement>("#search");
const results = $("#results");
type Hit = { label: string; sub: string; go: () => void };
function runSearch() {
  const q = search.value.trim().toLowerCase();
  if (!q) { results.hidden = true; return; }
  const hits: (Hit & { score: number })[] = [];
  const score = (name: string) => { const n = name.toLowerCase(); return n.startsWith(q) ? 3 : n.split(/\s+/).some((w) => w.startsWith(q)) ? 2 : n.includes(q) ? 1 : 0; };
  for (const i of ISLANDS) if (i.first <= state.ch) { const s = score(i.name); if (s) hits.push({ score: s + 0.5, label: i.name, sub: seaOf(i), go: () => select(i.id) }); }
  for (const c of CHARACTERS) if (c.first <= state.ch) { const s = Math.max(score(c.name), score(c.epithet ?? "")); if (s) hits.push({ score: s, label: c.name, sub: crewAt(c, state.ch) || "Character", go: () => { state.tab = "bounties"; state.selected = null; map.select(null); renderPanel(); openSheet(); } }); }
  for (const a of ARCS) if (a.ch[0] <= state.shield) { const s = score(a.name + " arc"); if (s) hits.push({ score: s, label: `${a.name} arc`, sub: `ch. ${a.ch[0]}–${a.ch[1]}`, go: () => jumpArc(a) }); }
  hits.sort((a, b) => b.score - a.score);
  results.innerHTML = hits.slice(0, 8).map((h, n) => `<li role="option" id="r${n}" data-n="${n}"><b>${esc(h.label)}</b><span>${esc(h.sub)}</span></li>`).join("") || `<li class="none">Nothing up to chapter ${state.ch}.</li>`;
  results.hidden = false;
  (results as HTMLElement & { hits?: Hit[] }).hits = hits.slice(0, 8);
  activeHit = hits.length ? 0 : -1;
  markActive();
}
let activeHit = -1;
function markActive() {
  results.querySelectorAll("li[data-n]").forEach((li, n) => li.classList.toggle("active", n === activeHit));
  search.setAttribute("aria-activedescendant", activeHit >= 0 ? `r${activeHit}` : "");
}
function pick(n: number) {
  const hits = (results as HTMLElement & { hits?: Hit[] }).hits ?? [];
  if (!hits[n]) return;
  hits[n].go();
  search.value = ""; results.hidden = true; search.blur();
}
search.addEventListener("input", runSearch);
search.addEventListener("keydown", (e) => {
  const n = results.querySelectorAll("li[data-n]").length;
  if (e.key === "ArrowDown") { activeHit = Math.min(n - 1, activeHit + 1); markActive(); e.preventDefault(); }
  if (e.key === "ArrowUp") { activeHit = Math.max(0, activeHit - 1); markActive(); e.preventDefault(); }
  if (e.key === "Enter") pick(activeHit);
  if (e.key === "Escape") { search.value = ""; results.hidden = true; }
});
results.addEventListener("pointerdown", (e) => {
  const li = (e.target as HTMLElement).closest<HTMLElement>("li[data-n]");
  if (li) { e.preventDefault(); pick(Number(li.dataset.n)); }
});
search.addEventListener("blur", () => setTimeout(() => (results.hidden = true), 120));
window.addEventListener("keydown", (e) => {
  if (e.key === "/" && document.activeElement !== search && !(document.activeElement instanceof HTMLInputElement)) { e.preventDefault(); search.focus(); }
});

// ── Spoiler shield dialog ───────────────────────────────────────
const dlg = $<HTMLDialogElement>("#shield");
function openShield() {
  $<HTMLInputElement>("#shield-ch").value = state.shield ? String(state.shield) : "";
  $<HTMLInputElement>("#shield-ep").value = "";
  $("#shield-latest").textContent = String(LATEST_CHAPTER);
  dlg.showModal();
}
function applyShield(ch: number) {
  state.shield = Math.max(1, Math.min(LATEST_CHAPTER, Math.round(ch)));
  store.set("gla-shield", String(state.shield));
  dlg.close();
  setChapter(state.shield);
  const here = ISLANDS.find((i) => i.id === arcAt(state.ch).island && i.first <= state.ch);
  if (here) map.centerOn(here.x, here.y, false, true);
}
$("#shield-btn").addEventListener("click", openShield);
$("#shield-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const c = Number($<HTMLInputElement>("#shield-ch").value), ep = Number($<HTMLInputElement>("#shield-ep").value);
  if (c > 0) applyShield(c);
  else if (ep > 0) applyShield(epToCh(ep));
  else $("#shield-err").textContent = "Enter a chapter or an episode.";
});
$("#shield-ep").addEventListener("input", (e) => {
  const v = Number((e.target as HTMLInputElement).value);
  $("#shield-ep-note").textContent = v > 0 ? `≈ chapter ${epToCh(v)}` : "";
});
$("#shield-all").addEventListener("click", () => applyShield(LATEST_CHAPTER));
$("#shield-start").addEventListener("click", () => applyShield(7));
dlg.addEventListener("cancel", (e) => { if (!state.shield) e.preventDefault(); });

// ── Misc UI ─────────────────────────────────────────────────────
let toastTimer = 0;
function toast(msg: string) {
  const t = $("#toast");
  t.textContent = msg; t.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => (t.hidden = true), 3200);
}
$("#zoom-in").addEventListener("click", () => map.zoomBy(1.5));
$("#zoom-out").addEventListener("click", () => map.zoomBy(1 / 1.5));
$("#zoom-fit").addEventListener("click", () => map.fit(true));
$("#about-btn").addEventListener("click", () => $<HTMLDialogElement>("#about").showModal());
document.querySelectorAll("[data-close]").forEach((b) => b.addEventListener("click", () => (b.closest("dialog") as HTMLDialogElement).close()));

const theme = store.get("gla-theme");
if (theme) document.documentElement.dataset.theme = theme;
$("#theme-btn").addEventListener("click", () => {
  const dark = document.documentElement.dataset.theme
    ? document.documentElement.dataset.theme === "dark"
    : matchMedia("(prefers-color-scheme: dark)").matches;
  document.documentElement.dataset.theme = dark ? "light" : "dark";
  store.set("gla-theme", document.documentElement.dataset.theme);
});
$("#share-btn").addEventListener("click", async () => {
  writeHash();
  const url = location.href.split("#")[0] + "#" + new URLSearchParams({ c: String(state.ch), ...(state.selected ? { i: state.selected } : {}) });
  try { await navigator.clipboard.writeText(url); toast("Link copied. Friends with a lower spoiler shield will see their own chapter."); }
  catch { toast(url); }
});

// Phone bottom sheet
const panel = $("#panel");
function openSheet() { panel.classList.add("open"); }
$("#sheet-handle").addEventListener("click", () => panel.classList.toggle("open"));

// ── Boot ────────────────────────────────────────────────────────
buildTrack();
map.fit(true);
const h = readHash();
// Dev only: #shield=N skips the dialog for screenshots.
if (import.meta.env.DEV) { const s = Number(new URLSearchParams(location.hash.slice(1)).get("shield")); if (s) state.shield = s; }
if (h.tab) state.tab = h.tab;
if (!state.shield) {
  setChapter(1);
  openShield();
} else {
  let ch = h.ch || state.shield;
  if (h.ch > state.shield) { ch = state.shield; setTimeout(() => toast(`That link is past your spoiler shield, so you're at chapter ${state.shield}.`), 400); }
  setChapter(ch);
  const here = ISLANDS.find((i) => i.id === arcAt(state.ch).island && i.first <= state.ch);
  if (here) map.centerOn(here.x, here.y, false);
  if (h.island && ISLANDS.some((i: Island) => i.id === h.island && i.first <= state.ch)) select(h.island);
}
