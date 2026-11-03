// The chart: an SVG world that wraps east–west, drawn as a sea chart in manga ink.
import {
  W, H, REVERSE_X, MARY_X, GL_TOP, GL_BOTTOM, BELT, ISLANDS, ROUTE, SEAS, FACTIONS,
  type Island, type FactionId,
} from "./data/world";

const NS = "http://www.w3.org/2000/svg";
const el = <K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string, string | number> = {}, parent?: Element) => {
  const e = document.createElementNS(NS, tag);
  for (const k in attrs) e.setAttribute(k, String(attrs[k]));
  parent?.appendChild(e);
  return e;
};

// Deterministic pseudo-random, so every island keeps its coastline.
function rng(seed: string) {
  let h = 2166136261;
  for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return () => {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Closed smooth path through jittered points around (cx, cy). */
function blob(seed: string, cx: number, cy: number, r: number, n = 13, rough = 0.38) {
  const rand = rng(seed);
  const pts: [number, number][] = [];
  const stretch = 0.7 + rand() * 0.6;
  const rot = rand() * Math.PI;
  n = Math.max(n, Math.round(n * 1.9));
  const p2 = rand() * 6.3, p3 = rand() * 6.3, p5 = rand() * 6.3, p7 = rand() * 6.3;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const wob = 0.2 * Math.sin(2 * a + p2) + 0.17 * Math.sin(3 * a + p3) + 0.09 * Math.sin(5 * a + p5) + 0.06 * Math.sin(7 * a + p7);
    const rr = r * (1 + wob * rough * 2.4 + (rand() - 0.5) * rough * 0.45);
    const x = Math.cos(a) * rr * stretch, y = Math.sin(a) * rr / stretch;
    pts.push([cx + x * Math.cos(rot) - y * Math.sin(rot), cy + x * Math.sin(rot) + y * Math.cos(rot)]);
  }
  let d = "";
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    if (i === 0) d += `M${p1[0].toFixed(1)},${p1[1].toFixed(1)}`;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return d + "Z";
}

export function controlAt(island: Island, ch: number): FactionId | null {
  let f: FactionId | null = null;
  for (const [from, who] of island.control ?? []) if (ch >= from) f = who;
  return f;
}

export function seaOf(i: Island): string {
  const x = ((i.x % W) + W) % W;
  if (i.id === "marygeoise" || i.id === "reverse") return "Red Line";
  if (i.y < GL_TOP - BELT) return x > REVERSE_X && x < MARY_X ? "East Blue" : "North Blue";
  if (i.y > GL_BOTTOM + BELT) return x > REVERSE_X && x < MARY_X ? "South Blue" : "West Blue";
  if (i.y < GL_TOP || i.y > GL_BOTTOM) return "Calm Belt";
  return x > REVERSE_X && x < MARY_X ? "Grand Line · Paradise" : "Grand Line · New World";
}

export interface MapEvents {
  onSelect(id: string | null): void;
}

export class ChartMap {
  svg: SVGSVGElement;
  private world: SVGGElement;
  private dyn: SVGGElement;
  private view: SVGGElement;
  private labels: HTMLDivElement;
  private k = 0.3;
  private tx = 0;
  private ty = 0;
  private minK = 0.3;
  private ch = 1;
  /** Island of the arc being read; its label wins collisions. */
  focus: string | null = null;
  private selected: string | null = null;
  private visible: Island[] = [];
  private labelEls = new Map<string, HTMLButtonElement[]>();
  private raf = 0;

  constructor(private host: HTMLElement, private ev: MapEvents) {
    this.svg = el("svg", { class: "chart", role: "img", "aria-label": "Chart of the One Piece world" }) as SVGSVGElement;
    host.appendChild(this.svg);
    this.defs();
    this.view = el("g", {}, this.svg) as SVGGElement;
    // Two layers, each drawn three times across the wrap seam. All the sea copies
    // go down first, so islands east of x = W are never painted over by the next copy.
    const defs = this.svg.querySelector("defs")!;
    this.world = el("g", { id: "world-base" }, defs) as SVGGElement;
    this.base(el("g", { "clip-path": "url(#worldclip)" }, this.world) as SVGGElement);
    this.dyn = el("g", { id: "world-dyn" }, defs) as SVGGElement;
    for (const layer of ["#world-base", "#world-dyn"])
      for (const off of [-W, 0, W]) el("use", { href: layer, x: off }, this.view);
    this.labels = document.createElement("div");
    this.labels.className = "labels";
    host.appendChild(this.labels);
    this.interact();
    new ResizeObserver(() => this.fit(false)).observe(host);
  }

  private defs() {
    const d = el("defs", {}, this.svg);
    const tone = el("pattern", { id: "tone", width: 6, height: 6, patternUnits: "userSpaceOnUse", patternTransform: "rotate(45)" }, d);
    el("circle", { cx: 3, cy: 3, r: 1.15, class: "ink-fill" }, tone);
    const toneS = el("pattern", { id: "tone-sea", width: 9, height: 9, patternUnits: "userSpaceOnUse", patternTransform: "rotate(45)" }, d);
    el("circle", { cx: 4.5, cy: 4.5, r: 1.3, class: "tone-sea" }, toneS);
    const hatch = el("pattern", { id: "hatch", width: 7, height: 7, patternUnits: "userSpaceOnUse", patternTransform: "rotate(-35)" }, d);
    el("line", { x1: 0, y1: 0, x2: 0, y2: 7, class: "hatch-line" }, hatch);
    const waves = el("pattern", { id: "waves", width: 44, height: 22, patternUnits: "userSpaceOnUse" }, d);
    el("path", { d: "M2,12 q5,-6 10,0 t10,0", class: "wave" }, waves);
    el("path", { d: "M24,3 q5,-6 10,0", class: "wave" }, waves);
    const clip = el("clipPath", { id: "worldclip" }, d);
    el("rect", { x: 0, y: 0, width: W, height: H }, clip);
    // Radial burst behind the selected island — the manga "impact" frame.
    const burst = el("radialGradient", { id: "burst-fade" }, d);
    el("stop", { offset: "0.3", "stop-color": "var(--burst)", "stop-opacity": 0.9 }, burst);
    el("stop", { offset: "1", "stop-color": "var(--burst)", "stop-opacity": 0 }, burst);
  }

  /** Everything that never changes: ocean, bands, Red Line, rhumb lines, sea names. */
  private base(g: SVGGElement) {
    el("rect", { x: 0, y: 0, width: W, height: H, class: "ocean" }, g);
    el("rect", { x: 0, y: 0, width: W, height: H, fill: "url(#tone-sea)", opacity: 0.55 }, g);
    // Graticule
    const grat = el("g", { class: "graticule" }, g);
    for (let x = 0; x <= W; x += 250) el("line", { x1: x, y1: 0, x2: x, y2: H }, grat);
    for (let y = 100; y < H; y += 250) el("line", { x1: 0, y1: y, x2: W, y2: y }, grat);
    // Rhumb lines from compass roses, drawn at ±W so the seam disappears.
    const roses: [number, number, number][] = [[1650, 420, 1], [3500, 1800, 0.8], [3950, 520, 0.7], [2450, 1840, 0.75]];
    const rh = el("g", { class: "rhumb" }, g);
    for (const [cx, cy] of roses) for (const off of [-W, 0, W]) for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      el("line", { x1: cx + off, y1: cy, x2: cx + off + Math.cos(a) * 2600, y2: cy + Math.sin(a) * 2600, class: i % 2 ? "minor" : "" }, rh);
    }
    // Calm Belts: dead-flat screentone
    for (const y of [GL_TOP - BELT, GL_BOTTOM]) {
      el("rect", { x: 0, y, width: W, height: BELT, class: "belt" }, g);
      el("rect", { x: 0, y, width: W, height: BELT, fill: "url(#tone)", opacity: 0.32 }, g);
    }
    // Grand Line: brighter water with chart waves
    el("rect", { x: 0, y: GL_TOP, width: W, height: GL_BOTTOM - GL_TOP, class: "grandline" }, g);
    el("rect", { x: 0, y: GL_TOP, width: W, height: GL_BOTTOM - GL_TOP, fill: "url(#waves)", opacity: 0.6 }, g);
    for (const y of [GL_TOP, GL_BOTTOM, GL_TOP - BELT, GL_BOTTOM + BELT])
      el("line", { x1: 0, y1: y, x2: W, y2: y, class: y === GL_TOP || y === GL_BOTTOM ? "gl-edge" : "belt-edge" }, g);
    // Reverse Mountain canals: the four Blues' currents meet at the summit
    const can = el("g", { class: "canal" }, g);
    for (const [dx, dy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
      const sx = REVERSE_X + dx * 330, sy = 1100 + dy * 520;
      el("path", { d: `M${sx},${sy} Q${REVERSE_X + dx * 60},${1100 + dy * 260} ${REVERSE_X},1100` }, can);
    }
    // The Red Line: one continent ringing the world, crossing the map twice
    for (const x of [REVERSE_X, MARY_X]) {
      const rl = el("g", { class: "redline" }, g);
      const rand = rng("rl" + x);
      let left = `M${x - 30},0`, right = "";
      for (let y = 0; y <= H; y += 55) left += ` L${x - 26 - rand() * 12},${y}`;
      for (let y = H; y >= 0; y -= 55) right += ` L${x + 26 + rand() * 12},${y}`;
      const path = left + right + "Z";
      el("path", { d: path, class: "rl-fill" }, rl);
      el("path", { d: path, fill: "url(#hatch)", opacity: 0.55 }, rl);
      el("path", { d: path, class: "rl-edge" }, rl);
    }
    // Labels in world space (they grow with zoom, like printed chart lettering)
    const lab = el("g", { class: "worldlabels" }, g);
    const t = (x: number, y: number, s: string, cls: string, size: number, rot = 0) => {
      const e = el("text", { x, y, class: cls, "font-size": size, transform: rot ? `rotate(${rot} ${x} ${y})` : "" }, lab);
      e.textContent = s;
    };
    for (const s of SEAS) t(s.x, s.y, s.name, "sea-name", s.size);
    t(1950, GL_TOP - BELT - 22, "GRAND LINE · PARADISE", "band-name", 20);
    t(3950, GL_TOP - BELT - 22, "GRAND LINE · NEW WORLD", "band-name", 20);
    for (const x of [600, 2000, 3400]) {
      t(x, GL_TOP - BELT / 2 + 6, "CALM BELT", "belt-name", 16);
      t(x, GL_BOTTOM + BELT / 2 + 6, "CALM BELT", "belt-name", 16);
    }
    t(REVERSE_X - 46, 520, "RED LINE", "rl-name", 22, -90);
    t(MARY_X - 46, 1700, "RED LINE", "rl-name", 22, -90);
    // Compass rose
    for (const [cx, cy, s] of roses) this.rose(lab, cx, cy, s);
    // Neat line
    el("rect", { x: 3, y: 3, width: W - 6, height: H - 6, class: "neatline" }, g);
  }

  private rose(g: SVGGElement, cx: number, cy: number, s: number) {
    const r = el("g", { class: "rose", transform: `translate(${cx} ${cy}) scale(${s})` }, g);
    el("circle", { r: 70, class: "rose-ring" }, r);
    el("circle", { r: 62, class: "rose-ring thin" }, r);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 - Math.PI / 2, L = i % 2 ? 46 : 84, w = i % 2 ? 7 : 11;
      const tip = [Math.cos(a) * L, Math.sin(a) * L];
      const l = [Math.cos(a - Math.PI / 2) * w, Math.sin(a - Math.PI / 2) * w];
      el("path", { d: `M0,0 L${l[0]},${l[1]} L${tip[0]},${tip[1]}Z`, class: "rose-dark" }, r);
      el("path", { d: `M0,0 L${-l[0]},${-l[1]} L${tip[0]},${tip[1]}Z`, class: "rose-light" }, r);
    }
    const n = el("text", { y: -92, class: "rose-n" }, r);
    n.textContent = "N";
  }

  /** Redraw what depends on the chapter: islands, territories, route, ship. */
  setChapter(ch: number) {
    this.ch = ch;
    this.visible = ISLANDS.filter((i) => i.first <= ch);
    this.dyn.replaceChildren();
    const terr = el("g", { class: "territories" }, this.dyn);
    const routeG = el("g", { class: "route" }, this.dyn);
    const isl = el("g", { class: "islands" }, this.dyn);

    for (const i of this.visible) {
      const f = controlAt(i, ch);
      if (f) {
        const c = FACTIONS[f].color;
        el("circle", { cx: i.x, cy: i.y, r: i.r * 2.1 + 18, fill: c, "fill-opacity": 0.16, stroke: c, "stroke-width": 2.2, "stroke-dasharray": "7 5", class: "terr" }, terr);
      }
    }
    this.drawRoute(routeG, ch);
    for (const i of this.visible) this.drawIsland(isl, i);
    this.syncLabels();
    this.select(this.selected && this.visible.some((i) => i.id === this.selected) ? this.selected : null, false);
  }

  private drawRoute(g: SVGGElement, ch: number) {
    const pos = new Map(ISLANDS.map((i) => [i.id, i]));
    const stops = ROUTE.filter(([, c]) => c <= ch).map(([id]) => pos.get(id)!);
    if (stops.length < 1) return;
    let d = `M${stops[0].x},${stops[0].y}`;
    for (let n = 1; n < stops.length; n++) {
      const a = stops[n - 1], b = stops[n];
      const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
      const bend = ((n % 2) * 2 - 1) * Math.min(60, Math.hypot(b.x - a.x, b.y - a.y) * 0.18);
      const nx = -(b.y - a.y), ny = b.x - a.x, L = Math.hypot(nx, ny) || 1;
      d += ` Q${(mx + (nx / L) * bend).toFixed(1)},${(my + (ny / L) * bend).toFixed(1)} ${b.x},${b.y}`;
    }
    el("path", { d, class: "route-casing" }, g);
    el("path", { d, class: "route-line" }, g);
    for (const s of stops) el("circle", { cx: s.x, cy: s.y, r: 4.5, class: "route-stop" }, g);
    const last = stops[stops.length - 1];
    this.ship(g, last.x + last.r * 0.9 + 14, last.y - last.r * 0.6 - 10);
  }

  private ship(g: SVGGElement, x: number, y: number) {
    const s = el("g", { class: "ship", transform: `translate(${x} ${y})` }, g);
    el("path", { d: "M-20,6 L20,6 L13,17 L-14,17 Z", class: "ship-hull" }, s);
    el("line", { x1: 0, y1: 6, x2: 0, y2: -26, class: "ship-mast" }, s);
    el("path", { d: "M2,-23 Q18,-12 2,0 Z", class: "ship-sail" }, s);
    el("path", { d: "M-2,-20 Q-14,-10 -2,0 Z", class: "ship-sail back" }, s);
    el("path", { d: "M0,-26 L11,-23 L0,-20 Z", class: "ship-flag" }, s);
    el("path", { d: "M-34,20 q6,-4 12,0 t12,0 M14,20 q6,-4 12,0", class: "ship-wake" }, s);
  }

  private drawIsland(parent: SVGGElement, i: Island) {
    const g = el("g", { class: `island kind-${i.kind ?? "island"}`, "data-id": i.id }, parent);
    const { x, y, r } = i;
    el("circle", { cx: x, cy: y, r: r * 3.2, class: "burst", fill: "url(#burst-fade)" }, g);
    const sel = el("g", { class: "burst-lines" }, g);
    for (let n = 0; n < 28; n++) {
      const a = (n / 28) * Math.PI * 2, r1 = r * 1.5, r2 = r * (2.6 + (n % 3) * 0.35);
      el("line", { x1: x + Math.cos(a) * r1, y1: y + Math.sin(a) * r1, x2: x + Math.cos(a) * r2, y2: y + Math.sin(a) * r2 }, sel);
    }
    el("circle", { cx: x, cy: y, r: r + 14, class: "hit" }, g);

    if (i.kind === "sky") {
      el("line", { x1: x, y1: y + r * 0.5, x2: x, y2: y + r * 0.5 + 110, class: "tether" }, g);
      const rand = rng(i.id);
      const puffs: string[] = [];
      for (let n = 0; n < 7; n++) {
        const px = x + (n - 3) * r * 0.42, py = y + Math.sin(n * 1.7) * r * 0.18, pr = r * (0.42 + rand() * 0.25);
        puffs.push(`M${px - pr},${py} a${pr},${pr} 0 1,0 ${pr * 2},0 a${pr},${pr} 0 1,0 ${-pr * 2},0`);
      }
      el("path", { d: puffs.join(" "), class: "cloud" }, g);
      el("path", { d: blob(i.id, x, y - r * 0.15, r * 0.55, 10, 0.3), class: "land" }, g);
      el("path", { d: blob(i.id, x, y - r * 0.15, r * 0.55, 10, 0.3), class: "coast" }, g);
      return;
    }
    if (i.kind === "undersea") {
      el("circle", { cx: x, cy: y, r: r * 1.1, class: "bubble" }, g);
      el("circle", { cx: x, cy: y, r: r * 1.1, class: "coast dashed" }, g);
      el("path", { d: `M${x - r * 0.6},${y + r * 0.35} Q${x},${y - r * 0.8} ${x + r * 0.6},${y + r * 0.35} Z`, class: "land" }, g);
      el("path", { d: `M${x - r * 0.6},${y + r * 0.35} Q${x},${y - r * 0.8} ${x + r * 0.6},${y + r * 0.35} Z`, class: "coast" }, g);
      for (let n = 0; n < 3; n++) el("circle", { cx: x + r * (0.8 + n * 0.25), cy: y - r * (0.9 + n * 0.45), r: 2.5 + n, class: "coast thin" }, g);
      return;
    }
    if (i.kind === "ship") {
      el("path", { d: `M${x - r * 1.6},${y} L${x + r * 1.6},${y} L${x + r},${y + r * 0.8} L${x - r},${y + r * 0.8} Z`, class: "land coast" }, g);
      el("path", { d: `M${x - r},${y} L${x - r * 0.6},${y - r * 0.9} L${x + r * 0.6},${y - r * 0.9} L${x + r},${y} Z`, class: "land coast" }, g);
      el("path", { d: `M${x - r * 0.4},${y - r * 0.9} L${x},${y - r * 1.5} L${x + r * 0.4},${y - r * 0.9}`, class: "coast" }, g);
      return;
    }
    if (i.kind === "mystery") {
      el("circle", { cx: x, cy: y, r: r * 1.4, class: "coast dashed mystery-ring" }, g);
      el("path", { d: blob(i.id, x, y, r * 0.7, 9, 0.5), class: "land" }, g);
      el("path", { d: blob(i.id, x, y, r * 0.7, 9, 0.5), class: "coast" }, g);
      const q = el("text", { x, y: y - r * 1.65, class: "mystery-q" }, g);
      q.textContent = "?";
      return;
    }
    if (i.kind === "mountain") {
      el("path", { d: `M${x - r * 1.5},${y + r * 0.7} L${x - r * 0.2},${y - r * 1.2} L${x + r * 0.15},${y - r * 0.7} L${x + r * 0.5},${y - r * 1.05} L${x + r * 1.5},${y + r * 0.7} Z`, class: "peak" }, g);
      el("path", { d: `M${x - r * 0.2},${y - r * 1.2} L${x + r * 0.3},${y + r * 0.7} L${x + r * 1.5},${y + r * 0.7} L${x + r * 0.5},${y - r * 1.05} L${x + r * 0.15},${y - r * 0.7} Z`, fill: "url(#tone)" }, g);
      el("path", { d: `M${x - r * 1.5},${y + r * 0.7} L${x - r * 0.2},${y - r * 1.2} L${x + r * 0.15},${y - r * 0.7} L${x + r * 0.5},${y - r * 1.05} L${x + r * 1.5},${y + r * 0.7} Z`, class: "coast" }, g);
      return;
    }
    // Ordinary island: ripple rings, shadowed land, screentone on the south-east.
    const main = blob(i.id, x, y, r);
    for (const s of [1.32, 1.62]) el("path", { d: main, class: "ripple", transform: `translate(${x} ${y}) scale(${s}) translate(${-x} ${-y})` }, g);
    el("path", { d: main, class: "land" }, g);
    const clipId = `c-${i.id}`;
    const cp = el("clipPath", { id: clipId }, g);
    el("path", { d: main }, cp);
    const shade = el("g", { "clip-path": `url(#${clipId})` }, g);
    el("path", { d: main, fill: "url(#tone)" }, shade);
    el("path", { d: main, class: "land-light", transform: `translate(${-r * 0.22} ${-r * 0.26})` }, shade);
    if (r > 24) {
      const rand = rng(i.id + "hills");
      const count = Math.round(r / 11);
      const cxr = x - r * 0.12, cyr = y - r * 0.05;
      for (let n = 0; n < count; n++) {
        const t = count > 1 ? n / (count - 1) - 0.5 : 0;
        const hx = cxr + t * r * 0.95 + (rand() - 0.5) * r * 0.2, hy = cyr + t * r * 0.35 + (rand() - 0.5) * r * 0.25;
        const hs = r * (0.13 + rand() * 0.07), hh = hs * (1.1 + rand() * 0.5);
        el("path", { d: `M${hx},${hy - hh} L${hx + hs},${hy} L${hx + hs * 0.15},${hy} Z`, class: "peak-shade" }, g);
        el("path", { d: `M${hx - hs},${hy} L${hx},${hy - hh} L${hx + hs},${hy}`, class: "hill" }, g);
      }
    }
    el("path", { d: main, class: "coast" }, g);
    if (r > 22) {
      const islet = rng(i.id + "islet");
      for (let n = 0; n < 2; n++) {
        const a = islet() * Math.PI * 2, dd = r * (1.15 + islet() * 0.35);
        const p = blob(i.id + n, x + Math.cos(a) * dd, y + Math.sin(a) * dd, r * 0.18, 7, 0.4);
        el("path", { d: p, class: "land coast" }, g);
      }
    }
  }

  // ── Labels: HTML buttons positioned over the chart (accessible, crisp) ──
  private syncLabels() {
    this.labels.replaceChildren();
    this.labelEls.clear();
    for (const i of this.visible) {
      const arr: HTMLButtonElement[] = [];
      for (let c = 0; c < 3; c++) {
        const b = document.createElement("button");
        b.className = `label imp${i.imp}`;
        b.textContent = i.name;
        b.dataset.id = i.id;
        if (c !== 1) { b.tabIndex = -1; b.setAttribute("aria-hidden", "true"); }
        b.addEventListener("click", (e) => { e.stopPropagation(); this.ev.onSelect(i.id); });
        this.labels.appendChild(b);
        arr.push(b);
      }
      this.labelEls.set(i.id, arr);
    }
    this.place();
  }

  private sizes = new Map<HTMLElement, [number, number, number]>();
  private place() {
    const vw = this.host.clientWidth, vh = this.host.clientHeight;
    const zoomRel = this.k / this.minK;
    const taken: [number, number, number, number][] = [];
    const pri = (i: Island) => (i.id === this.selected ? 9 : i.id === this.focus ? 5 : i.imp);
    const order = [...this.visible].sort((a, b) => pri(b) - pri(a));
    for (const i of order) {
      const arr = this.labelEls.get(i.id)!;
      const show = i.imp === 3 || i.id === this.selected || (i.imp === 2 && zoomRel > 1.5) || (i.imp === 1 && zoomRel > 2.4);
      [-W, 0, W].forEach((off, c) => {
        const b = arr[c];
        const sx = (i.x + off) * this.k + this.tx;
        const sky = i.kind === "sky" || i.kind === "mountain";
        const sy = (i.y + (sky ? -i.r * 0.9 : i.r * 1.1)) * this.k + this.ty + (sky ? 0 : 4);
        let on = show && sx > -120 && sx < vw + 120 && sy > -40 && sy < vh + 40;
        b.classList.toggle("selected", i.id === this.selected);
        if (on) {
          b.style.display = "";
          let sz = this.sizes.get(b);
          const isSel = i.id === this.selected ? 1 : 0;
          if (!sz || sz[2] !== isSel) { sz = [b.offsetWidth, b.offsetHeight, isSel]; this.sizes.set(b, sz); }
          const x0 = sx - sz[0] / 2, y0 = sky ? sy - sz[1] : sy;
          const box: [number, number, number, number] = [x0 - 3, y0 - 1, x0 + sz[0] + 3, y0 + sz[1] + 1];
          if (!isSel && taken.some((t) => box[0] < t[2] && box[2] > t[0] && box[1] < t[3] && box[3] > t[1])) on = false;
          else { taken.push(box); b.style.transform = `translate(${x0.toFixed(1)}px, ${y0.toFixed(1)}px)`; }
        }
        if (!on) b.style.display = "none";
      });
    }
  }

  // ── View ────────────────────────────────────────────────────
  private apply() {
    const vw = this.host.clientWidth, vh = this.host.clientHeight;
    this.k = Math.max(this.minK, Math.min(this.k, this.minK * 9));
    const span = W * this.k;
    this.tx = ((this.tx % span) + span) % span - span; // wrap
    const mh = H * this.k;
    this.ty = mh <= vh ? (vh - mh) / 2 : Math.min(0, Math.max(vh - mh, this.ty));
    this.view.setAttribute("transform", `translate(${this.tx} ${this.ty}) scale(${this.k})`);
    cancelAnimationFrame(this.raf);
    this.raf = requestAnimationFrame(() => this.place());
  }

  fit(reset = true) {
    const vw = this.host.clientWidth, vh = this.host.clientHeight;
    if (!vw || !vh) return;
    const prevMin = this.minK;
    this.minK = Math.max(vw / W, vh / H) * 1.0001;
    if (reset) { this.k = this.minK * 1.15; this.centerOn(2000, 900, false); }
    else { this.k *= this.minK / prevMin; this.apply(); }
  }

  centerOn(x: number, y: number, zoomIn = true, animate = false) {
    const vw = this.host.clientWidth, vh = this.host.clientHeight;
    const k1 = zoomIn ? Math.max(this.k, this.minK * 2.4) : this.k;
    const panelW = window.innerWidth > 820 ? 400 : 0;
    const wantX = (vw - panelW) / 2, wantY = window.innerWidth > 820 ? vh / 2 : vh * 0.32;
    if (!animate || matchMedia("(prefers-reduced-motion: reduce)").matches) {
      this.k = k1; this.tx = wantX - x * k1; this.ty = wantY - y * k1;
      this.apply();
      return;
    }
    // Start from the copy of the point nearest the target, so we take the short way round.
    const k0 = this.k, span = W * k0;
    let sx0 = x * k0 + this.tx;
    sx0 += Math.round((wantX - sx0) / span) * span;
    const sy0 = y * k0 + this.ty, t0 = performance.now(), dur = 650;
    const step = (now: number) => {
      const t = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - t, 3);
      this.k = k0 + (k1 - k0) * e;
      this.tx = sx0 + (wantX - sx0) * e - x * this.k;
      this.ty = sy0 + (wantY - sy0) * e - y * this.k;
      this.apply();
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  zoomBy(f: number, cx?: number, cy?: number) {
    const vw = this.host.clientWidth, vh = this.host.clientHeight;
    cx ??= vw / 2; cy ??= vh / 2;
    const nk = Math.max(this.minK, Math.min(this.k * f, this.minK * 9));
    this.tx = cx - ((cx - this.tx) / this.k) * nk;
    this.ty = cy - ((cy - this.ty) / this.k) * nk;
    this.k = nk;
    this.apply();
  }

  private interact() {
    const pts = new Map<number, { x: number; y: number }>();
    let moved = 0, pinch = 0;
    this.host.addEventListener("wheel", (e) => {
      e.preventDefault();
      const r = this.host.getBoundingClientRect();
      this.zoomBy(Math.exp(-e.deltaY * (e.ctrlKey ? 0.01 : 0.0018)), e.clientX - r.left, e.clientY - r.top);
    }, { passive: false });
    this.host.addEventListener("pointerdown", (e) => {
      if ((e.target as HTMLElement).closest(".label")) return;
      this.host.setPointerCapture(e.pointerId);
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      moved = 0;
      if (pts.size === 2) { const [a, b] = [...pts.values()]; pinch = Math.hypot(a.x - b.x, a.y - b.y); }
      this.host.classList.add("dragging");
    });
    this.host.addEventListener("pointermove", (e) => {
      const p = pts.get(e.pointerId);
      if (!p) return;
      if (pts.size === 1) {
        this.tx += e.clientX - p.x; this.ty += e.clientY - p.y;
        moved += Math.abs(e.clientX - p.x) + Math.abs(e.clientY - p.y);
        p.x = e.clientX; p.y = e.clientY;
        this.apply();
      } else if (pts.size === 2) {
        p.x = e.clientX; p.y = e.clientY;
        const [a, b] = [...pts.values()];
        const d = Math.hypot(a.x - b.x, a.y - b.y), r = this.host.getBoundingClientRect();
        if (pinch) this.zoomBy(d / pinch, (a.x + b.x) / 2 - r.left, (a.y + b.y) / 2 - r.top);
        pinch = d; moved = 99;
      }
    });
    const up = (e: PointerEvent) => {
      pts.delete(e.pointerId);
      if (pts.size < 2) pinch = 0;
      if (!pts.size) this.host.classList.remove("dragging");
    };
    this.host.addEventListener("pointerup", up);
    this.host.addEventListener("pointercancel", up);
    // Clicks: SVG <use> copies swallow per-island listeners, so hit-test here.
    this.host.addEventListener("click", (e) => {
      if (moved > 6 || (e.target as HTMLElement).closest(".label")) return;
      const r = this.host.getBoundingClientRect();
      const wx = (e.clientX - r.left - this.tx) / this.k, wy = (e.clientY - r.top - this.ty) / this.k;
      let best: Island | null = null, bd = Infinity;
      for (const i of this.visible) for (const off of [-W, 0, W]) {
        const dd = Math.hypot(i.x + off - wx, i.y - wy);
        if (dd < i.r + 22 / this.k && dd < bd) { bd = dd; best = i; }
      }
      this.ev.onSelect(best ? best.id : null);
    });
    this.host.addEventListener("pointermove", (e) => {
      if (pts.size) return;
      const r = this.host.getBoundingClientRect();
      const wx = (e.clientX - r.left - this.tx) / this.k, wy = (e.clientY - r.top - this.ty) / this.k;
      const hit = this.visible.some((i) => [-W, 0, W].some((off) => Math.hypot(i.x + off - wx, i.y - wy) < i.r + 22 / this.k));
      this.host.classList.toggle("over-island", hit);
    });
  }

  select(id: string | null, fly = true) {
    this.selected = id;
    this.dyn.querySelectorAll(".island").forEach((n) => n.classList.toggle("selected", (n as SVGElement).dataset.id === id));
    if (id && fly) {
      const i = ISLANDS.find((x) => x.id === id)!;
      this.centerOn(i.x, i.y, true, true);
    }
    this.place();
  }

  get chapter() { return this.ch; }
}
