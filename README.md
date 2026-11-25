# Grid Shaper

Modular grid glyph tool in Three.js TSL on WebGPU.

## Run locally

```bash
npm install
npm run dev
```

Then open http://localhost:5173 (append `?variant=Dense+Riso` or `?variant=Midnight+Minimal`).

## Controls

Control definitions and tuned values for each variant are in `controls/*.json`.
The baked values are applied as default props in `src/main.tsx` (local copy).

## Components

- `src/components/main.tsx` — Main
- `src/components/dense-riso.tsx` — Dense Riso
- `src/components/midnight-minimal.tsx` — Midnight Minimal

Shared code: `src/lib/`.