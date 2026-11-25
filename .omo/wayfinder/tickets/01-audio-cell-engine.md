# 01: Audio cell engine

**Owner:** coding-agent
**Blocked by:** None (can start immediately)
**Status:** done

## What to build

A focused audio module that loads a local audio file, exposes transport and live analysis, computes file waveform peaks, and maps a reaction into a deterministic selected-cell scale.

## Acceptance criteria

- [ ] MP3/WAV decoding errors are reported without breaking the render loop.
- [ ] The module exposes play, pause, seek, current time, duration, live waveform, and file peaks.
- [ ] Presets cover level, low frequency, kick, snare, hi-hat, custom band, BPM, and snap-and-hold.
- [ ] Pure tests prove threshold, attack/release, sensitivity, quantisation, and scale mapping with known values.
- [ ] Pure tests prove waveform peaks are finite, bounded, and preserve silence.
- [ ] `npm run typecheck` and `npm test` pass.

## Evidence

- `node --test src/lib/audio.test.ts`: 9/9 passed.
- `npm run typecheck`: passed.
- Browser/audio hardware playback remains a manual verification gap.
