# TICKET — Scene / Animation workspace (A1–A8)

- **Stato:** design in corso (0.10.0)
- **Owner design:** designer (Figma "Texting")
- **Owner code:** coding-agent, dopo l'accettazione G23
- **Dipende da:** `LOGIC-PAGES/03-scenes-layers.md`, `04-animation-timeline.md`, `02-target-picker.md`, `DS-RULES.md`
- **Fuori scope ora:** codice, persistenza, export reale, onboarding

## Obiettivo

Aggiungere al tool la gestione di **scene e layer** con griglia per scena, ghost del layer inferiore, timeline stile video editor, transizioni e modulazione audio per scena. L'utente deve poter creare un video complesso senza uscire dal progetto.

## Scope

1. **Modello** Scene/Layer/Group/Frame/Clip/Modulator/Transition/Ghost (docs 03).
2. **Workspace Animate**: mode switch, sidebar Scenes/Layers/Library, Inspector Motion, TimelineDock.
3. **TimelineDock** 1440×322: bar, scene strip, tools, ruler, tracce, clip, playhead, loop, waveform, zoom.
4. **Ghost**: per layer, Below/Custom, opacity/offset/tint; resa nel canvas.
5. **React-to**: modulators clip con source/target/sensitivity/range/envelope; calibrazione.
6. **Transizioni** tra scene: Cut/Fade/Morph; marker e inspector.
7. **Light** theme completo.
8. **A11y**: target ≥24, focus, tastiera, aria, contrasto.

## Criteri di accettazione (osservabili)

- [ ] Si crea Scene 1 (5×5), Scene 2 (9×7), Scene 3 (5×5); ogni scena ha la propria griglia e il badge in sidebar.
- [ ] Si aggiunge un gruppo "Molecules" con layer Chladni e Color 3; Chladni ha ghost = Color 3, opacity 0.30, offset 44; il ghost è visibile nel canvas e non è cliccabile.
- [ ] Chladni ha più modulator: `dB → Handle X`, `Stems → Scale`, `Noise → Effects`; Color 3 ha `BPM → Opacity`; lo stesso path esatto non è duplicabile.
- [ ] La toolbar è verticale top-left 48: collapsed solo tool attivo; expanded con header, Select/Draw/Erase/Toggle e bottom border; la sezione BRUSH appare nella rail dell'Inspector con l'icona del tool.
- [ ] L'Inspector usa `Organism/InspectorRail` 48 a destra, non i tab orizzontali; Body 232; il tool attivo aggiunge la sua sezione.
- [ ] La sidebar Animate ha PRESETS (Chladni ghost / Molecules stack / Color trio) inseribili in una scena come gruppi linked; Unlink li rende locali.
- [ ] Con `Pick on canvas` si seleziona `Cell 3·5`; il target diventa `Scene 1 / Chladni / Cell 3·5 / Handle X` in pannello, clip e Inspector.
- [ ] Il noise map mostra Scope All cells, Loop Proportional, Seamless On, Responsive On, Per-cell Off e una preview 5×5; le celle del canvas hanno pesi variabili; non è per-cell e non è su grid/group/cell/scene.
- [ ] Il glyph è `Organism/GlyphGrid` 5×5 con 9 stati, incluso Random A/B e Clear; il canvas default è ink #202020 / paper #E8E5E8; Empty usa Clear.
- [ ] La timeline mostra 3 scene, 5 tracce, 4 modulator; il pannello MODULATION è accanto alla timeline.
- [ ] Click sul clip modulatore apre il riepilogo/calibrazione; il target è stabile.
- [ ] La timeline mostra 3 scene, 4 tracce, clip layer e un clip modulatore `Chladni · Handle X` selezionato.
- [ ] Click sul clip modulatore apre la calibrazione (source, sensitivity, range, envelope); il target è `Scene 1 / Chladni / Handle X`.
- [ ] La transizione Scene 1 → Scene 2 è Fade 300ms; Morph è disabilitato se le griglie non sono compatibili.
- [ ] Play/scrub: il playhead muove, il canvas mostra il frame, il ghost segue; loop 5–55s.
- [ ] Export video (dialog) usa la sequenza scene + audio + loop.
- [ ] Tastiera: space, ←/→, Home/End, J/K/L, ⌘B, Delete, 1–3, Esc; focus visibile; target ≥24.
- [ ] Dark e light: 0 paint dark nelle schermate light; contrasto conforme a `CONTRAST-MATRIX.md`.
- [ ] Il target picker apre `Scene → Layer → Parametro` (non più `Reference → Cell 3·5`).

## Sotto-ticket

| Id | Contenuto | Stato |
|---|---|---|
| A1 | TimelineDock + Animate screen + ghost + mode switch | fatto (0.10.0) |
| A1b | Pannello MODULATION (multi-effetto), scene preset, cell picker, noise map | fatto (0.11.0, design) |
| A1c | Toolbar verticale, InspectorRail, canvas colors, GlyphGrid 5×5, noise hierarchy/JSON | fatto (0.12.0, design) |
| A2 | Target picker `Scene → Layer → Cell → Parametro` (cell scope canvas) + screen Target | aperto |
| A3 | ResponseCalibration popover (Image 2) | aperto |
| A4 | LayerRow con eye/lock/ghost/folder/grip + 6 icone lucide | aperto |
| A5 | Transition panel **nella scena** (Out/In sul confine), marker nella strip, non in React-to | aperto |
| A6 | Timeline empty/loading/error/playing/missing target | aperto |
| A7 | Video export dialog | aperto |
| A8 | Flow "scene → layer → ghost → transition → export" | aperto |
| A9 | Dock unificato `Organism/Dock` (10 varianti, View Collapsed/Presets/Presets error/Scenes/Scenes noise), AudioDock e TimelineDock rimossi, 13 istanze migrate | fatto (0.14.0, design) |
| A10 | Pannello scena aperto dal campo scena della strip (modale, `Scenes-opt.json`), sempre sulla scena selezionata | aperto |

## Decisioni da confermare

1. Layer = frame? Il modello consente layer in sequenza e sovrapposti; nessun "frame layer" separato.
2. Gestione layer solo in Animate o anche in Design?
3. Target picker `Scene → Layer → Cell → Parametro`, cell scelta sul canvas.
4. Morph solo griglie compatibili o morph geometrico completo?
5. Ghost default 0.18 o 0.30?
6. Noise map: un solo noise per forma; output cell scale/offset/rotation/opacity.
7. Scene preset linked di default; Unlink per locale.
8. Un solo modulator per path esatto; il noise è `Shape → Transitions → Effects`, all cells, loop proporzionale e responsive, per-cell Off.
9. Canvas content default ink #202020 / paper #E8E5E8; GlyphGrid 5×5 9 stati.
