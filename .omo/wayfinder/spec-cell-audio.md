# Spec — Selected-cell audio reactivity

## Problem Statement

Shape Editor lets the user paint a grid of cells, but the grid is static. The user cannot load a track, select one drawn cell, and make only that cell react to audio. The current controls panel has no cell selection, waveform, audio preset, or debug readout.

## Solution

Add a selected-cell audio path inside the existing 2D grid renderer. The user draws cells, switches to the cell selection tool, selects one filled cell, loads an audio file, chooses an audio preset, and sees only the selected cell scale around its own centre. A waveform shows the decoded file, playhead, and live analyser overlay. A compact floating debug panel exposes selection, signal, shaped value, and scale.

## User Stories

1. As a user, I can draw cells on the current grid so that I can compose a shape.
2. As a user, I can switch to a selection tool and click a grid cell so that the system knows which cell may react.
3. As a user, can load an MP3/WAV file so that the tool can analyse it.
4. As a user, can see a file waveform, playhead, and live waveform so that I can understand playback and analysis.
5. As a user, can choose an audio preset so that the selected cell reacts to a meaningful passage such as kick, bass, snare, hi-hat, level, band, BPM, or snap-and-hold.
6. As a user, can adjust sensitivity, scale range, steps, attack, release, and threshold so that the reaction feels right.
7. As a user, see only the selected cell scale from its centre while every other cell remains unchanged.
8. As a user, receive a clear debug state when no cell is selected, so audio reactivity cannot run accidentally.
9. As a user, can reset the audio configuration without resetting my drawing.
10. As a user, can run the project locally and verify the feature through tests and a production build.

## Implementation Decisions

- The existing Three.js/TSL grid renderer remains the visual surface; no second canvas renderer is introduced.
- Cell selection is a new pointer mode in the existing tool control.
- The selected cell is mandatory. Without a selected filled cell, the reactive scale stays at 1.
- Audio analysis is a focused browser module: AudioContext, AnalyserNode, decoded AudioBuffer, transport, waveform peaks, and the reaction subset needed by the presets.
- Signal shaping is a pure function: threshold, attack/release follower, sensitivity curve, optional quantisation, then scale mapping.
- Only one uniform pair identifies the selected cell and its reactive scale.
- The file waveform is derived from decoded PCM; the live waveform comes from the analyser.
- The debug panel is intentionally minimal and functional; final visual polish is not part of this slice.

## Testing Decisions

- Pure seam: known raw signals plus configuration produce deterministic shaped values and scales.
- Pure seam: synthetic PCM produces bounded waveform peaks and preserves silence.
- Gate seam: missing selection disables reactivity; valid selection enables it.
- Integration evidence: TypeScript typecheck, unit tests, Vite production build, and diff review.
- Browser/audio hardware behaviour is reported as a manual verification gap unless a headless audio fixture is available.

## Out of Scope

- Final UI polish and full design-system compliance.
- Multi-cell bindings, per-cell saved presets, MIDI, microphone input, stem separation, harmony, and automation curves.
- Export, cloud sync, project persistence, and mobile layout.
- Changes to the reference project `touch-sketc`.

## Further Notes

Reference material inspected at `C:\Users\Utente\Desktop\Web\touch-sketc`: audio analysis, binding math, waveform concepts, and floating-panel visual direction. The implementation target is `C:\Users\Utente\Desktop\PROVA FORGE\Shape Editor`.
