# CANVAS-MAP — Fragment / Shape Editor UI

- **File:** Figma "Texting" · `gmorvNrypDXH59DHWP5chr`
- **dsVersion:** 0.22.0
- **Tokens:** `ds/palette` (30) · `ds/semantic` Dark (29) · `ds/semantic-light` Light (29) · `ds/scale` (44 float)
- **Text styles:** Type/Heading · Title · Subtitle · Body · Label · Value · Mono · Caption (Inter)
- **Effect styles:** Elevation/popover · Elevation/dialog
- **Icon set:** lucide, 41 icone, `Icon/<name>` con Size 16/20, stroke 1.5, colore = `muted-foreground`
- **Contrast:** `disegno/CONTRAST-MATRIX.md` (nessun FAIL testuale; `border` documentato decorativo)
- **Rules:** `disegno/DS-RULES.md` (pannelli, popup, dock, card, accessibilità)

## Pagine e board

| Page | Board | Sections (ordine) |
|---|---|---|
| 01 Foundations | `Board/01 Foundations` | Header · Color (+ Light specimen) · Type · Spacing & radius · Elevation & focus · Icons · Archive/References |
| 02 Components | `Board/02 Components` | Masters/Atoms · Masters/Controls · Masters/Navigation · Masters/Containers |
| 03 UI | `Board/03 UI` | Screens/Editor · Screens/Library · Screens/Settings · Screens/System · Flows |

> Deviazione registrata (EXC-2): i board sono **stack verticale auto-layout** invece di GRID 7 colonne. Motivo: il grid auto-placement di Figma non accetta span parziali affidabili con sezioni di altezza diversa; l'ordine di lettura resta quello di navigazione e nessuna sezione si sovrappone.

## Master (canonical: page 02)

| Master | Varianti | Token chiave | Geometria | Stati | Superfici valide |
|---|---|---|---|---|---|
| Atom/Badge | Tone = Neutral/Accessory… Accent/Destructive/Outline | secondary, selection-solid, destructive, border | h 22, px 8, radius full, Label 11 | default | card, popover, background |
| Atom/Kbd | Key | secondary + border | h 24, px 6, radius 4, Mono 10 | default | header, popover, footer |
| Atom/Divider | H/V | border | 1px | — | qualsiasi contenitore |
| Atom/Spinner | Indeterminate | selection | ring 14, stroke 2 | default | qualsiasi |
| Atom/Text | Tone = Body/Muted/Label | foreground, muted-foreground | — | — | qualsiasi |
| Molecule/Button | Appearance × State (5×3) | primary/secondary/background/destructive + input border | h 32, px 12, radius 8, gap 6, Subtitle 13 | default, hover, disabled | footer pannelli, dialog, header |
| Molecule/IconButton | State 3 | background/accent + border | 32×32, radius 8, icon 20 | default, hover, disabled | header, panel head |
| Molecule/Input | State 3 | background + input/ring | h 32, radius 6, label Label 11 | default, focus, disabled | form, inspector |
| Molecule/SearchField | State 2 | background + input/ring + Kbd | h 32, radius 6 | default, focus | sidebar, palette |
| Molecule/Slider | State 3 | secondary track + selection fill + foreground knob | track 140×4, knob 12 | default, active, disabled | inspector |
| Molecule/Switch | State 3 | input / selection-solid | 32×18, knob 14 | off, on, disabled | inspector, settings |
| Molecule/Checkbox | State 3 | background/input, selection-solid | 16 box, radius 4 | unchecked, checked, disabled | dialogs, settings |
| Molecule/Segmented | Active 3 | secondary + background pill | h 28, radius 8/6 | active | toolbar, presets, export |
| Molecule/Tabs | Active 5 (Look/Grid/Motion/Audio/Export) | selection underline 2px | h 36 | active | catalogo (non usato nell'Inspector 0.12) |
| Molecule/InspectorRow | Kind = Number/Slider/Toggle/Select | secondary/background/input/selection | h 28, label Body 13 | default | inspector |
| Molecule/TableHeadCell | Align = Start/Center × Theme | muted-foreground | h 26, label 10 uppercase ls 0.6 | — | dock table head |
| Molecule/SelectCell | State = Rest/Hover × Theme | foreground + accent hover | h 26, cella 204, chevron 16 adiacente | rest, hover | dock rows |
| Molecule/ValueCell | Kind = Number/Range × Theme | foreground | h 26, cella 188, 13 tabular | — | dock rows |
| Molecule/TrackCell | Theme 2 | input track + selection fill | h 26, valore 12 + track 90×4 | — | dock rows |
| Molecule/CellButton | State = Rest/Hover × Theme | accent | 24×24, radius 6, icona 16 | rest, hover | dock rows, liste |
| Molecule/ViewSwitch | Active = Presets/Scenes × Theme | input track + selection pill | 125×24, segmenti 60/59×18 | presets, scenes | dock bar |
| Molecule/VolumeCell | Theme 2 | input + selection | h 24, icona 16 + track 80×4 + 12 | — | dock bar |
| Organism/DockRow | Theme 2 | foregound/muted/selection | 1406×32: Name 384 · Settings 832 · Frequency 100 · Action 32, 9 istanze | — | dock Presets |
| Molecule/MiniThumb | Theme 2 | background + foreground/input | 20×20, 5×5 celle 3 | — | SceneTab, Clip, card |
| Molecule/SceneTab | State = Active/Rest × Theme | selection underline + foreground/muted-foreground | 190×32: thumb 20 + name 12 + range 11 + underline 2 | active, rest | dock Scenes strip |
| Molecule/TransitionMarker | Theme 2 | input + border | 20×32, cerchio 16 con chevron-right | — | strip tra scene |
| Molecule/ToolRow | State = Rest/Active × Theme | accent | 204×34: icona 16 + name 13 + kind 11 + more 16 | rest, active | dock Scenes Tools |
| Molecule/Clip | Kind = Layer/Modulation × State = Rest/Selected × Theme | accent + selection border | h 24, radius 5; Layer 242 (thumb + label), Modulation 300 (onda + label + dB) | 8 | timeline |
| Molecule/ModRow | State = Rest/Selected × Theme | accent + selection bar | 264×24: source 11 · → · target 13 · value 12 | rest, selected | dock Modulation |
| Molecule/TimeRuler | Theme 2 | muted-foreground | 906×22, 7 label 10 | — | timeline |
| Molecule/Playhead | Theme 2 | selection | handle 7 + linea 1×172 | — | timeline |
| Molecule/ScrollBar | Theme 2 | input + muted-foreground | 906×3, handle 229 | — | timeline |
| Molecule/LoopRegion | Theme 2 | selection 35% | 755×2 | — | timeline |
| Molecule/WaveStrip | Theme 2 | selection 55% | 906×28, 32 barre | — | timeline |
| Molecule/AddModulationRow | Theme 2 | muted-foreground | 264×20, 11 | — | dock Modulation |
| Molecule/MiniThumb | Kind = Scene/Noise × Theme | background + foreground / muted-foreground | 20×20; Scene 5×5 celle 3, Noise 5×5 punti 2 | 4 | SceneTab, Clip |
| Molecule/SectionCard | Kind = Plain/Reset × Theme | muted | 384 wide, p 12/12/10, r 8, Head 14 + info 16 + reset 24, Slot FILL | 4 | Reactivity panel |
| Molecule/ValueChip | State = Rest/Focus × Theme | input (+ ring 2) | h 20, min-w 24, r 4, 12 tabular | 4 | pannelli, inspector |
| Molecule/AxisTicks | Kind = Single/Dual × Theme | muted-foreground + input | 276 wide; Single 3 stop 11; Dual = 2 colonne con titolo 12 + traccia 4 | 4 | Reactivity panel |
| Molecule/SliderCompact | State = Rest/Drag × Theme | input + selection | 140×16, traccia 2, pomello 20×14 r 7 | 4 | Reactivity panel |
| Molecule/RangeSlider | State = Rest/Drag × Theme | muted-foreground + selection | 276×56, 2 maniglie con punta, valori sotto | 4 | Reactivity panel |
| Molecule/ReactivityGlobalMenu | Theme 2 | popover + border | 264×279, p 12, r 10: 4 righe Menu + nota + divider + live | 2 | aperto da `Reactivity calibration` |
| Molecule/ReactivityParamRow | Width = Panel/Menu × Stop 0–4 × Theme | background + border, selection fill | 320/240×20: label 64/60 + slider 196/128 + chip 44/36 | 20 | card, menu |
| Molecule/ReactivityBadge | Theme 2 | border + muted-foreground | h 16, p 5, r 4, 9 caps | 2 | head delle card |
| Molecule/ReactivityTravel | Theme 2 | border track + selection span | 320×18, span 0.54–0.70, handle 6 | 2 | card Range |
| Molecule/ReactivityCurve | Active = linear/exp/spring × Theme | accent + selection underline | 320×25, 3 segmenti 102 | 6 | card Pulse |
| Molecule/ReactivityPresetRow | State = Rest/Active × Theme | accent + selection bar | 168×28, p 12, name 12 + check 11 | 4 | rail del pannello |
| Organism/ReactivityHeader | State = Calm/Open × Theme | background + border | 560×48: breadcrumb + calibration 24 + close 20 | 4 | pannello |
| Molecule/ReactivityFooter | Theme 2 | selection checkbox | 560×44: check 14 + enabled + reset | 2 | pannello |
| Molecule/ReactivityLiveRow | Theme 2 | muted-foreground + foreground | 240×16: amount + radius | 2 | menu globale |
| Molecule/ReactivityCard | Content 14 · Theme | muted + border badge | 344 wide, p 0, r 8: Block/Head (12) + plot full-bleed + Block/Body (12, righe + nota) | 28 · griglia 2 colonne per tema, 0 overlap | pannello |
| Molecule/ParamPlot | Kind = CurveLinear/CurveExp/CurveSpring/Transfer/Step/Band/Grid · Theme | solo inchiostro: selection (serie 1.5, area 14%) + border hairline | 344x72, **senza fill né bordo né radius**: la superficie è della card, il plot disegna solo la funzione; 7 kind in griglia 2 colonne | 14 | card con anteprima (T20) |
| Molecule/ParamSpec | Section = Band/Response/Range/Force/Pulse/Snap/Bands/Global · Theme | popover + border + Elevation/popover | 264 wide, p 12, r 10: titolo 12 + corpo 10/15 + divider + «not wired» 10 | 16 | tooltip di sezione (hover sull'info) |
| Molecule/ResizeHandle | Edge = Corner · Theme | muted-foreground | 24×24 (hit), glifo 3 tacche 12 | 2 | pannelli fluttuanti |
| Row/Molecule/ReactivityComposed | - | - | 2239x12962: card set + menu + 40 varianti pannello | 1 | composizione master |
| Organism/ReactivityPanel | Theme × Menu × Preset 10 | background + muted + accent | 560×658–923: header + rail 168 + 4/5 card + footer + menu | 40 · griglia 2 colonne per tema, 0 overlap | pannello reactivity |
| Organism/EffectPanel | Theme 2 | background + muted | 376×458: header Effect/Noise + card Effect + card Link + footer | 2 | target `kind: effect` |
| Molecule/ReactivityNotice | State = NoAudio/Error × Theme | muted + destructive | 560×54: dot 6 + titolo 12 + caption 11 + azione 11 | 4 | stati del pannello |
| Organism/ReactivityState | State = NoAudio/Error × Theme | background + destructive | 560×814: header + notice + corpo 35% + footer | 4 | stati del pannello |
| Icon/info | Size = 16/20 × Theme | foreground | cerchio + punto + barra | 4 | SectionCard, tooltip |
| Organism/NavRailItem | State 3 | accent/selection | 40×40, radius 8, icon 20 | default, hover, active | rail |
| Organism/NavItem | State 3 | accent | h 30, radius 6, icon 16 | default, hover, active | sidebar |
| Organism/TreeRow | State 3 | accent | h 26, radius 4, indent 20 | default, selected, hover | sidebar |
| Organism/ContextMenuItem | State 3 | accent, destructive | h 26, radius 4, shortcut Mono 10 | default, hover, destructive | menu |
| Organism/PanelHeader | State 2 | border hairline | h 36, px 12 | expanded, collapsed | sidebar/inspector |
| Organism/ContextMenu | Context = Cell/Layer | popover + border + shadow | 180 wide, radius 8, padding 4, item 26 | — | overlay ancorato |
| Organism/Toolbar | State = Collapsed/Expanded × Theme | popover + border + selection | 48×48 / 48×238, verticale, padding 8/8 espanso, top-left | collapsed, expanded | canvas (absolute) |
| Organism/InspectorRail | Active = Tool/Look/Grid/Motion/Export × Theme | card + border + accent/selection | 48×236, box a destra Inspector | 5 active | Inspector |
| Organism/GlyphGrid | Glyph = Reference/Heart/Arrow/Smiley/A/S/Clear/Random A/Random B | contenuto: paper #E8E5E8, ink #202020, line #2C2C2C | 400×400, 5×5, celle 70 | 9 stati | canvas, card |
| Organism/ProjectCard | State 2 | card + border/input, thumb = paper progetto | 260 base, radius 10, interni FILL | default, hover, focus | library grid |
| Organism/WaveformWide | State 3 | selection + muted-foreground | 1408×64 | playing, idle, error | dock |
| Organism/Dialog | Kind × Theme | popover + border + Elevation/dialog | 480 wide, 176 Shell / 332 Export, Slot FILL | — | overlay |
| Organism/CommandPalette | Mode × Theme | popover + border + Elevation/dialog | 560×228, Results 144 scroll | — | overlay |
| Organism/TargetPicker | Context = Cell/Grid × Theme | popover + border + Elevation/popover | 560×386, 3 colonne 186, row 30 | — | editor target |
| Organism/Dock | View = Collapsed/Presets/Presets error/Scenes/Scenes noise × Theme | popover + border + muted/accent/selection | collapsed 1440×56; presets e scenes 1440×322; presets error 1440×222; bar 34 + switch 24 dentro il bar + body | 10 | Editor + Animate, unico dock |

## Schermate (page 03)

| Screen set | Varianti | Note |
|---|---|---|
| Screen/Editor | Full × Empty × Target × Audio error × Grid × Animate × Animate cell × Animate noise | 1440×900 - rail 56 / sidebar 264 / main / inspector 296; Content FILL, dock 56/322/222 (View=Collapsed/Presets/Presets error/Scenes/Scenes noise) |
| Screen/Library | Full · Empty · Loading · Menu | griglia 4 colonne di ProjectCard (card FILL), empty centrata, skeleton, context menu |
| Screen/Settings | Full | Page 760 centrata: Appearance / Canvas / Account |
| Screen/Overlay | Export · Command palette | scrim `overlay` + master Dialog/Palette |
| Flows | 5 flow | Draw→save · Look→export · Audio-reactive · Grid setup · Library management |
| Screens/Light | Editor Full/Target/Animate/Animate cell/Animate noise · Library Full/Empty/Loading · Settings · System Export/Palette | 11 varianti, 1440×900, paint `ds/semantic-light` |

## Regole d'uso (do / don't)
- Do: ogni colore di chrome è un token `ds/*`; il colore del progetto (ink/paper) è **contenuto** e non usa token.
- Do: icone solo da `Icon/*` come istanze; nessun vettore incollato.
- Do: inspector a schede, con "Advanced" collassato; nessun parametro rimosso.
- Don't: usare `selection` come colore di testo (solo indicatore/CTA con `selection-solid`).
- Don't: bordi `border` come unico indicatore di un controllo (usare `input` o `ring`).
- Don't: ombre su superfici non flottanti.

## Limiti noti
- Light theme: 11 schermate complete in `Screens/Light`; 0 paint legati a `ds/semantic` (scan automatico).
- Le istanze annidate nelle schermate light mantengono il nome `Theme=Dark` (Figma non permette lo swap dentro un'istanza); i paint sono rimappati a `ds/semantic-light`, quindi il render è light. Limite di nome, non di colore.
- `Organism/TargetPicker` e `Organism/Dialog` hanno contenuto fisso per variante (`Context`/`Kind`): il piano free non permette slot arbitrari. In codice il contenuto arriva dai resolver.
- (0.11, superato da 0.14.0: il dock unico sostituisce TimelineDock) `Organism/TimelineDock` era un demo a contenuto fisso (3 scene, 5 tracce, 4 modulator); il target picker mostra ancora il ramo legacy `Reference $([char]0x2192) Cell 3$([char]0x00B7)5 $([char]0x2192) Handle X` (migrazione A2).
- `missing-backends.md`: persistenza progetti, export file, input audio.

---

## 0.4.0 — Sidebar Scene + Audio ancorato (2026-11-25)

**Sidebar Editor (264px), dall'alto:**
1. `Head` — titolo "Scene"
2. `Molecule/SearchField`
3. `SceneGroup` — etichetta `SCENE` + conteggio gruppi
4. `Tree` — `Grid (selezionato) → Cells (34) → Cell 3·5 → Audio targets (1)`
5. `Molecule/Button` ghost — **Glyph presets** (unica creazione: applicare un preset)
6. spacer FILL
7. `Organism/AudioPanel` **ancorato in basso** — header + Badge REACTIVE + chevron, `Organism/Waveform` (40 barre, playhead), transport `0:12 / 0:34 · 118 BPM`, `Target CELL 3·5`, `Preset Bass pulse`, 4 slider narrow (Sensitivity, Min/Max scale, Threshold), `Modulate` switch
8. `Molecule/Button` primary — Save project

**Nuovi master**

| Master | Varianti | Token | Geometria |
|---|---|---|---|
| Organism/Waveform | State=Playing / Idle | canvas-backdrop, selection, muted-foreground, foreground | 240×44, 40 barre 2px, gap 2 |
| Organism/AudioPanel | State=Expanded (402px) / Collapsed | card, border, accent, badge | 240 wide, padding 10, radius 10 |
| Organism/EmptyState | Kind=Card / Inline | card/popover, border | 460 / 320 |
| Organism/TreeRow-Child | State=Default / Selected / Focus | accent | indent 38 |
| Molecule/InspectorRow | + Kind=SliderNarrow | secondary + selection | track 64 |

**Focus**: varianti `State=Focus` su Button, IconButton, Input, SearchField, Slider, Switch, Checkbox, NavItem, TreeRow, TreeRow-Child, ContextMenuItem, ProjectCard (12 varianti, ring 2px).
**Tabs**: 4 schede (Look · Grid · Motion · Export). L'audio **non è più una scheda**: vive nel pannello ancorato.
**Stati Editor**: Full · Empty · Target (cella selezionata + pannello audio attivo).
**Fix di visualizzazione**: `Cell/Editor` clippava le varianti 2 e 3 (render null); i set schermata ora sono impilati in verticale e le celle non clippano.
**Testi**: 279 nodi collegati ai text style (`Type/*` + nuovo `Type/Caption`).
**Geometria**: 90 padding/gap normalizzati sulla scala, 21 altezze fissate (Button 32, SearchField 32, NavItem 28).

---

## 0.5.0 — Audio dock (sostituisce il pannello laterale)

| Master | Varianti | Geometria | Note |
|---|---|---|---|
| Organism/WaveformWide | State=Playing | 1408×64, 140 barre 4px, playhead | porzione riprodotta `selection`, resto `muted-foreground` 45% |
| Icon/volume-2 · Icon/mic | Size 16/20 | — | aggiunte al set lucide (39 icone) |

**Struttura schermata Editor:** `Content (844 / 578)` + `Organism/Dock (56 / 322 / 222)` = 900. La sidebar contiene solo Scene; `Organism/AudioPanel` e i due dock separati sono deprecati e rimossi.

**Dock expanded (colonne fisse, header = righe):** 300 · 162 · 82 · 162 · 100 · 100 · 32 — `PRESET · REACT TO · SOURCE · SENSITIVITY · RANGE · FREQUENCY · azione`.

### 0.5.1 — Stati del dock
`Organism/Dock` = `View (Collapsed / Presets / Presets error / Scenes / Scenes noise) x Theme` -> 10 varianti; switcher dentro il bar.
`Organism/WaveformWide` = Playing / Idle (linea piatta) / Error (linea `destructive` 2px).
Schermate: Full (Collapsed·Ready) · Empty (Collapsed·Idle) · Target (Expanded·Ready) · Audio error (Expanded·Error).

### 0.6.0 — Icone e pannelli
- **Icone:** ogni `Icon/<name>` ha il vettore riscalato al box e centrato via auto-layout (`primary/counterAxisAlignItems = CENTER`); prima il doppio rescale lo riduceva a 2/3 e l'auto-layout lo ancorava in alto a sinistra.
- **Sidebar Scene:** Head (titolo + panel-left + more) · Search · `SCENE` con conteggio · albero · divider · `GLYPH PRESETS` con `+` · 3 preset · footer Save + export.
- **Inspector:** Head (titolo + `5×5` + chiusura) · tabs · sezioni con label a sinistra e azione a destra (reset/swap) · divider · corpo FILL scrollabile · footer fisso (`Reset all` / `Apply look`).
- Regola panel: header con azioni, sezioni etichettate con azione trailing, footer d'azione sempre in basso.

### 0.7.0 — Tema Light
- **Asse `Theme` su tutti i 69 set** (364 varianti, 182 light): stesso componente, valori da `ds/semantic-light`. Il piano free vieta i mode, quindi il tema è un asse di variante (EXC-1 chiusa di fatto).
- `Screen/Editor-Light` (State=Full) in `03 UI → Screens/Light`: rail, sidebar, inspector e dock in light; il **canvas resta il paper del progetto** (#0E0E11).
- Icone: 41 set (aggiunte `heart`, `arrow-right`); Glyph presets con icona propria.
- Quando si crea un componente nuovo: sempre `Theme=Dark` + `Theme=Light`, mai un colore letterale.

### 0.7.1 — Light completo
`Screens/Light` contiene quattro schermate: **Editor, Library (Full/Empty/Loading), Settings, System (Export/Palette)**, tutte 1440×900, generate dalla stessa tecnica (clone + swap istanze + rebind paint). Le miniature delle card e il canvas usano il paper del progetto, non `canvas-backdrop`.

### 0.8.0 — Overlay master + flussi
- `Organism/Dialog` (`Kind=Shell` · `Kind=Export`) e `Organism/CommandPalette` sono i master degli overlay; le schermate `Screen/Overlay` li istanziano.
- Stati aggiunti: `Screen/Editor State=Grid`, `Screen/Library State=Menu`.
- Flussi: 5 totali (draw/save, look/export, audio, grid, library) = copertura 5/5 dei task del BRIEF.

### 0.9.0 — Target picker a colonne + pannelli fill (2026-11-25)

**Nuovo master:** `Organism/TargetPicker`, 560×386, 4 varianti (`Context=Cell|Grid` × `Theme=Dark|Light`). Tre colonne da 186 (Finder/NSBrowser): L1 oggetti della scena, L2 celle (forma) o sezioni (griglia), L3 parametri; path nel footer, spunta sul leaf. Contratto in `LOGIC-PAGES/02-target-picker.md`.

**Pannelli:** `Content` FILL in tutti gli stati Editor; Rail/Sidebar/Main/Inspector FILL in altezza; Sidebar `Body` scrollabile con footer 56; Inspector `Body` clip. Audio error 676 allineato ai pannelli (prima 578).

**Width:** inspector 266 (268 su 266 prima), righe `FILL`, tab 4×73.5, segmented 266; dock bar/tabs spacer `FILL`, tabella con prima colonna `FILL`, delete 24; Library head 1302 e card `FILL` in griglia 4 colonne; Settings Page 760 centrata; ContextMenu light 26→180; swatch 24.

**Height:** Dock fisse 56/322/222 con `Rows` 74 clip; CommandPalette 228 (Results 144); Dialog 176/332 con Slot FILL; EmptyState 174/190 HUG; ProjectCard interni FILL; riga TargetPicker dentro `List` HUG.

**Light:** 8 varianti rigenerate; switch Off corretto, segmented tema "Light" attivo, Settings a destra, dialog toggle On viola.

**Regole:** `DS-RULES.md` (pannelli, popup, dock, card, a11y, checklist nuovo componente). Audit: `AUDIT-7-2026-11-25.md`.

## 0.10.0 — Scene/Animation workspace + timeline (2026-11-26)

**Modello:** `LOGIC-PAGES/03-scenes-layers.md` — Scene = segmento con griglia propria e stack di layer; layer/gruppi con visibilità, lock, ghost; frame = render della scena; clip = intervallo del layer; transizioni Cut/Fade/Morph; modulatori audio per scena/layer/parametro.

**Nuovo master (0.10, ora dentro Organism/Dock):** TimelineDock 1440x322 (Bar 34, scene strip 40, body 212 con Tools 220 e Timeline 1187).

**Nuova schermata (0.10):** `Screen/Editor State=Animate` dark + light. Oggi usa `Organism/Dock View=Scenes` al posto del vecchio TimelineDock; contenuto 576, dock 322.

**Fix:** Board/02 Components era FIXED 6912 e tagliava il master TimelineDock; ora HUG 8704. Icone dei 7 IconButton della timeline corrette. Il ghost duplicato ha sfondo rimosso e ordine main→ghost→toolbar.

**Prossimo:** migrazione target picker `Scene → Layer → Parametro` (A2), ResponseCalibration (A3), LayerRow con eye/lock/ghost/folder, transition inspector, empty/loading timeline, video export.

## 0.11.0 — Modulazione, preset, cell picker, noise (2026-11-26)

**Timeline (0.11, ora nel dock):** `View=Scenes` con Body Tools 220 / Timeline 906 / Modulation 280; 5 tracce, clip 24; `Noise -> Effects`.

**Scene preset:** sidebar Animate SCENES → LAYERS → **PRESETS** (Chladni ghost, Molecules stack, Color trio), linked; LIBRARY glyph rimossa dall'Animate; Body gap 3.

**Cell picker:** `State=Animate cell` dark/light; barra `Pick a cell · Chladni · 3·5 · Use cell`; celle evidenziate; target `Cell 3·5 · Handle X` in pannello/clip/Inspector.

**Noise map:** `State=Animate noise` dark/light; `Noise → Cell weights`; Inspector NOISE MAP con preview 5×5; overlay pesi sul canvas; `Mode=Noise`.

**Conteggio:** 32 set · 214 varianti (107 light) · 26 varianti schermata (15 dark + 11 light) · 5 flussi. Audit: `AUDIT-9-2026-11-26.md`.

## 0.12.0 — Toolbar, InspectorRail, canvas colors, glyph states, noise (2026-11-26)

**Toolbar:** `Organism/Toolbar` 48 wide, `State=Collapsed|Expanded` × Theme; Stage 16,16; collapsed 48×48 solo tool attivo; expanded 48×236 con header active, divider, Select/Draw/Erase/Toggle, bottom border. Vecchia 122×38 rimossa.

**Inspector:** `Organism/InspectorRail` 48×236, 10 varianti `Active=Tool|Look|Grid|Motion|Export` × Theme, box in alto a destra; Body 232/content 204; tabs orizzontali rimossi. Full su Tool con BRUSH (Size/Hover/Paint flash/Shift erases).

**Canvas:** default ink #202020, paper #E8E5E8, empty cell #FFFFFF, line #2C2C2C; aggiornati CanvasPreview, ghost, target, noise, swatch, hex, ProjectCard. `Organism/GlyphGrid` 5×5 9 stati (Reference/Heart/Arrow/Smiley/A/S/Clear/Random A/Random B); Empty usa Clear.

**Noise:** `Shape → Transitions → Effects → Noise`; pannello `Noise → Effects`; Scope All cells, Loop Proportional, Seamless On, Responsive On, Per-cell Off; preview All cells; overlay su tutte le celle. `controls/React-to-opt.json` 5 L1 · 12 L2 · 18 L3.

**Counts:** 34 set · 235 varianti (113 light) · 26 schermate · 5 flussi. Board/02 HUG 16446. Audit: `AUDIT-10-2026-11-26.md`.
