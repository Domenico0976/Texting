# 03: Waveform and debug panel

**Owner:** coding-agent
**Blocked by:** 01 — Audio cell engine; 02 — Selected-cell scaling
**Status:** done

## What to build

A floating audio panel with file waveform, playhead, live overlay, preset/configuration controls, and debug readouts for the selected cell.

## Acceptance criteria

- [ ] The panel loads an audio file and exposes play/pause and seek.
- [ ] The waveform shows decoded file peaks, current playhead, and live analyser samples.
- [ ] The panel lists the supported audio presets and applies their defaults.
- [ ] Sensitivity, scale range, steps, attack, release, and threshold are adjustable.
- [ ] Debug readouts show selected cell, filled state, raw signal, shaped signal, scale, and audio state.
- [ ] Reset restores audio defaults without clearing the drawing.
- [ ] `npm run typecheck`, `npm test`, and `npm run build` pass.

## Evidence

- `npm test`: 10/10 passed.
- `npm run typecheck`: passed.
- `npm run build`: passed.
- Playwright smoke test with system Chrome: canvas and Cell audio panel rendered; selection mode changed the selected cell to x2/y3; zero page or console errors.
- Real WAV fixture: decode/play succeeded; Level preset produced raw 0.7794, shaped 0.8031, scale 0.911 on the selected cell; zero page or console errors.
