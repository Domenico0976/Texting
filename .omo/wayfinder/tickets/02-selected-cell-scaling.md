# 02: Selected-cell scaling

**Owner:** coding-agent
**Blocked by:** 01 — Audio cell engine
**Status:** done

## What to build

A selection mode in the existing grid tool and a shader path that scales only the selected filled cell around its centre.

## Acceptance criteria

- [ ] The tool selector exposes a cell selection mode.
- [ ] Clicking a cell in selection mode selects it without painting or erasing.
- [ ] No selected cell means reactive scale remains 1 and the debug gate reports the missing selection.
- [ ] A selected empty cell is reported as non-reactive until the user draws it.
- [ ] Only the selected cell receives the audio scale; other cells and grid geometry remain unchanged.
- [ ] Selection is visually identifiable on the canvas.
- [ ] `npm run typecheck`, `npm test`, and `npm run build` pass.

## Evidence

- `npm test`: 10/10 passed, including exact-cell selection and missing-selection gate.
- `npm run typecheck`: passed.
- `npm run build`: passed.
- Visual/WebGPU confirmation remains manual; the shader path compiles in the production bundle.
