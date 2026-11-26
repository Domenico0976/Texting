# TASK — shape-editor-ui

- **mode:** build + 10 audit passati
- **platform:** figma (`gmorvNrypDXH59DHWP5chr` / "Texting") · 3 pagine
- **phase:** PHASE 6 review (G23 pending) · feature Scene/Animation in design
- **lastSession:** 2026-11-26
- **next:** testare kinetic grid (cella e forma) nel dev; poi A10 pannello scena dalla strip, A2 target picker, A3 ResponseCalibration

## Stato
| Layer | Stato |
|---|---|
| Tokens | 4 collezioni · 132 variabili · 8 text style · 2 elevation |
| Icons | 41 icone lucide, `Icon/<name>` Size 16/20 + Theme, centrate |
| Components | 34 set · Theme su tutti (235 varianti, 113 light); GlyphGrid è contenuto (no Theme) |
| Panels | Sidebar, Inspector con rail verticale 48 e Body 232, footer fisso, fill in altezza |
| Toolbar | `Organism/Toolbar` 48 wide collapsed/expanded, top-left Stage 16,16 |
| Glyph | `Organism/GlyphGrid` 5×5, 9 stati (Reference/Heart/Arrow/Smiley/A/S/Clear/Random A/B) |
| Target picker | 3 colonne; demo legacy `Reference → Cell` (A2: `Scene → Layer → Cell → Parametro`) |
| Timeline | `Organism/TimelineDock` 1440×322, 4 varianti (Edit/Noise × Theme); 3 scene, 5 tracce, MODULATION 280 |
| Screens | 26 varianti: 15 dark (Editor 8, Library 4, Settings 1, Overlay 2) + 11 light (Editor 5, Library 3, Settings 1, Overlay 2); 5 flussi |

## Aperti
- **A2** target picker `Scene → Layer → Cell → Parametro` con cell scope `Pick on canvas`
- **A3** ResponseCalibration popover (Image 2)
- **A4** LayerRow con eye/lock/ghost/folder + icone lucide mancanti
- **A5** Transition inspector/marker · **A6** timeline empty/loading/error/collapsed · **A7** video export · **A8** flow
- Regola unicità target nel picker/add flow (non solo documentata)
- Scene preset linked/unlink; noise loop reale (7×7 è demo); `React-to-opt.json` da approvare
- `Molecule/Tabs` inutilizzato nell'Inspector: deprecare o riusare
- `Tabs`/`Segmented`: variante Focus assente; in codice `:focus-visible`
- Tooltip valore volume/sensitività
- G23 accettazione → PHASE 7

## Chiusi in questa tornata
- Toolbar verticale 48 (collapsed/expanded) top-left; active + tools + bottom border; 13 schermate
- InspectorRail 48×236, 5 contesti × Theme; Body 232/204; tool section BRUSH in Full
- Canvas colors ink #202020 / paper #E8E5E8; tutti i CanvasPreview, ghost, target, swatch, card
- GlyphGrid 5×5 9 stati; Empty Clear; vecchio 7×7 rimosso
- Noise `Shape → Transitions → Effects`; `Noise → Effects`; All cells, Loop Proportional, Seamless, Responsive, Per-cell Off; JSON 5/12/18
- Audit 10; Board/02 HUG 16446; List 14822
