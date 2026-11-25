# Review — selected-cell audio reactivity

## Perimeter

Source, controls, docs, tickets, and built output for the selected-cell audio slice. Generated `node_modules` changes are excluded from the review perimeter.

## Standards

- No repository coding-standard file was present.
- The audio module keeps DSP and transport behind one interface; the React panel only presents that interface.
- Pure mapping and waveform logic are tested at their public seam.
- Review found and removed per-frame FFT band allocation.
- Browser review found a stale identifier in the onset path; fixed and covered by typecheck plus real-audio smoke test.
- No blocking standards findings remain.

## Spec

- New selection mode: implemented.
- Selection mandatory and filled-cell gate: implemented and tested.
- Only selected cell scales centrally: implemented in the shader.
- File waveform + playhead + live overlay: implemented.
- Audio presets and adjustable mapping: implemented.
- Debug panel with raw/shaped/scale/status: implemented.
- UI polish, microphone, MIDI, stems, automation, and multi-cell binding remain out of scope.

## Verdict

Pass with evidence: 10 unit tests, typecheck, production build, diff check, and real-WAV browser smoke test all pass. Manual visual judgement of the final motion feel remains with the user.
