# Handoff — selected-cell audio reactivity

## Primary sources

- Spec: `.omo/wayfinder/spec-cell-audio.md`
- Tickets: `.omo/wayfinder/tickets/01-audio-cell-engine.md` through `03-waveform-debug-panel.md`
- Reference project inspected: `C:\Users\Utente\Desktop\Web\touch-sketc`
- Implementation target: `C:\Users\Utente\Desktop\PROVA FORGE\Shape Editor`

## Settled decisions

- Modify Shape Editor, not the reference project.
- New selection mode inside the existing grid tool.
- Only one user-selected filled cell reacts.
- Reaction is central scale inside the selected cell.
- Selection is mandatory.
- Waveform is file peaks + playhead + live analyser overlay.
- Final UI polish is out of scope for this slice.

## Open gaps

- Headless browser audio verification is not yet proven; unit tests cover the pure DSP/mapping seams.
- Exact final panel styling waits for a later UI pass.

## Active commands

- `npm run dev`
- `npm run typecheck`
- `npm test`
- `npm run build`

## Next ticket

All three tickets are complete. Next work is a UI polish pass or broader audio sources (microphone, MIDI, automation), not started in this slice.
