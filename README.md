# Grand Line Atlas

A spoiler-safe interactive chart of the One Piece world: islands, story arcs, the Straw Hats' voyage, bounties, and the powers of the sea. Everything is gated to chapter, so readers and anime watchers see only what they've reached.

**Unofficial fan project.** Not affiliated with or endorsed by Eiichiro Oda, Shueisha or Toei Animation. All drawings are original; facts are summarised from the manga and the [One Piece Wiki](https://onepiece.fandom.com/) (CC BY-SA).

## Develop

```
npm install
npm run dev
```

Data lives in `src/data/world.ts`. Every island note, bounty, territory change and character carries the chapter it is revealed in, so the spoiler shield keeps working. Please keep that rule when adding data.

Pushing to `main` deploys to GitHub Pages via `.github/workflows/pages.yml`.

## Licence

Code: GPL-3.0-or-later.
