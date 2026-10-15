# Balloon Buster: Neta Edition 🎈🔫

A fast, satirical arcade balloon-shooter for the timeline wars.
Pick your side — **CJP**, **Congress**, or **BJP** — and pop 60 seconds of pure political satire.

- **CJP / Congress — Troll Mode:** pop balloons carrying supporter-trope punchlines.
- **BJP — Defend Mode:** pop opposition taunts to reveal green `FACT CHECK` development cards.

No real person is named or targeted. It's satire, not a hit list.

## Play

**Live:** deploy to Vercel (or any static host) — see below.

**Locally:** just open `index.html` in a browser. No build step, no dependencies, zero external requests — fonts and all assets ship with the repo.

## Controls

- **Aim** — move the mouse / drag your finger. The scope follows your pointer.
- **Shoot** — click / tap. One shot per tap.
- Pop as many balloons as you can in **60 seconds**. Chain quick pops for combo multipliers (`DOUBLE POP!`, `TRIPLE POP!`, `RAMPAGE!`, `UNSTOPPABLE!`).
- Your final score earns a rank title on the game-over screen.

## Project structure

```
├── index.html            # markup + script loading
├── css/
│   └── style.css         # full arcade UI: menu, HUD, cards, CRT overlay
├── js/
│   ├── data.js           # mode config, balloon lines, taunt/fact pairs, ranks
│   ├── audio.js          # WebAudio sound effects (shot, pop) + mute state
│   ├── game.js           # canvas engine: balloons, gun, scope, particles, game loop
│   └── ui.js             # menu wiring, HUD, announcements, game-over screen
```

Fonts (Press Start 2P + VT323, OFL licensed) are inlined as data-URIs inside
`css/style.css` — the game makes **zero external requests**, so it works the
moment it deploys, even offline.

## Deploy to Vercel (free)

1. Push this repo to GitHub.
2. Go to [vercel.com](https://vercel.com) → **Add New → Project** → import the repo.
3. Framework preset: **Other**. No build command, no output directory — hit **Deploy**.

That's it. Your game is live in under a minute.

## Tech

- Vanilla HTML/CSS/JS — no frameworks, no bundler, no npm.
- Canvas 2D rendering, WebAudio for sound (generated in code, no audio files).
- Fully responsive, touch-first, mobile-ready.
- `prefers-reduced-motion` respected.

## Content

All balloon lines are original satirical writing based on recurring online political tropes.
Made for laughs — play all three sides. 🎪
