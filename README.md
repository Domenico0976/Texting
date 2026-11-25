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

## Selected-cell audio

1. Draw cells with the existing tools.
2. Set **Tool** to `select` and click a filled cell.
3. Open **Cell audio**, load an MP3/WAV, choose a preset, and enable it.
4. Only the selected cell scales around its centre. The panel shows file waveform, playhead, live waveform, and signal debug values.

Supported presets: level, bass, kick, snare, hi-hat, frequency band, BPM, and snap-and-hold.

## Verify

```bash
npm run typecheck
npm test
npm run build
```

## Components

- `src/components/main.tsx` — Main
- `src/components/dense-riso.tsx` — Dense Riso
- `src/components/midnight-minimal.tsx` — Midnight Minimal

Shared code: `src/lib/`.