# DS-CHANGELOG — Fragment / Shape Editor UI

## Change history

### 0.14.0 — 2026-11-26 · Dock unico: AudioDock + TimelineDock rimossi
- **C5 — deprecazione:** `Organism/AudioDock` (12 varianti) e `Organism/TimelineDock` (4) rimossi dal canvas insieme alle rispettive righe in `Masters/Containers`.
- **C4 — `Organism/Dock`** esteso a **10 varianti**: `View = Collapsed | Presets | Presets error | Scenes | Scenes noise` × Theme. Altezze: collapsed 56, presets/scenes 322, presets error 222; bar 34 con switcher 24 dentro, body per view.
- **Migrazione:** 13 istanze nelle schermate `Screen/Editor` e `Screen/Editor-Light` riportate al Dock — Full/Empty/Grid → Collapsed; Target → Presets; Audio error → Presets error; Animate/Animate cell → Scenes; Animate noise → Scenes noise. 8 istanze annidate nei Flow riportate a Collapsed (erano state scambiate).
- **Conteggio:** **33 set · 229 varianti (110 light)** · 26 schermate · 5 flussi. Board/02 HUG **15786**, List **14162**.
- **Nota:** badge del bar legato alla view: `REACTIVE` in Presets, `SCENE 1` in Scenes e Scenes noise (corretto in dark e light).
- **Codice (prototipo):** animazione audio a **quadranti locali** — cell mode: solo il quadrante selezionato + i vicini 3×3 (anche vuoti) assorbono, resto della griglia fermo; shape mode: pinch per cella con ampiezza dal livello audio mappato in verticale (alto→alto) + hash, griglia di dimensione invariata. Mappa continua, giunture condivise. Toggle `Select shape`. Typecheck e build verdi.

### 0.13.0 — 2026-11-26 · Organism/Dock (Presets + Scenes in un componente)
- **C4 — `Organism/Dock`**: nuovo set `View=Presets|Scenes × Theme` (4 varianti), 1440×322 = bar 34 + switch 24 + body 264. Costruito da `AudioDock → Expanded, Audio=Ready` + `TimelineDock → Mode=Edit`; bar condiviso, switcher `Presets|Scenes` dentro il bar (track `muted`, attivo `accent`, testo 11 Medium), sempre visibile.
- **Corpo per view**: Presets = WaveformWide 64 + TableHead 22 + Rows 74 + AddRow 28 (body 264); Scenes = strip 40 + timeline 212 (body 264). 4 paint light rimappati, icone `Theme=Light` dove serve.
- **Pendente**: le 26 schermate istanziano ancora `AudioDock`/`TimelineDock`; `Audio=Idle/Error` non è ancora dentro il Dock; migrazione + C5 su TimelineDock in A9.
- **Codice (prototipo, non canvas)**: corretta la modulazione della cella in `src/lib/shader.ts` — la scala audio agisce attorno al centro della cella (`qs`, nessun warp della coordinata), quindi la cella non si sposta e non campiona lo stato del vicino. Typecheck e build verdi.

### 0.12.1 — 2026-11-26 · AudioDock: spaziature della tabella Setting propagate in light
- **C1 — valore:** le spaziature corrette a mano in `Organism/AudioDock → State=Expanded, Audio=Ready, Theme=Dark` sono ora la regola della tabella Setting: `Name 394` · gap 16 · `Settings 832` (Select 204 · 16 · Select 204 · 16 · Sensitivity 188 · 16 · Col 188) · gap 16 · `Frequency 100` · gap 16 · `Col 32` = 1406; `Rows` gap 10, righe 32, controllo 26; `TableHead` h 22, label a 6.
- **C1 — propagation:** `TableHead`, `Rows`, `AddRow` di `State=Expanded, Audio=Ready, Theme=Light` ricostruiti sullo stesso albero (56 paint rimappati `ds/semantic` → `ds/semantic-light`, 9 icone `Theme=Dark` → `Theme=Light`). Geometria light ≡ dark, 0 binding dark residui.
- **C1 — allineamento label:** `TableHead` portato sullo stesso modello di colonne delle righe: `Col 394` · gap 16 · `Frame 2 832` · gap 16 · `Col 100` · gap 16 · `Col 32`; dentro `Frame 2` gap 16 con `204 · 204 · 188 · 188`. Label a **410 · 630 · 850 · 1054 · 1258 · 1374**, verificati per posizione assoluta contro i controlli (427/647/867/1071/1275 con il padding 17 del dock).
- Conteggio invariato: **34 set · 235 varianti (113 light) · 26 schermate · 5 flussi**.

### 0.12.0 — 2026-11-26 · Toolbar, rail, canvas colors, glyph states, noise
- **C4 — Toolbar:** ricostruita `Organism/Toolbar` `State=Collapsed|Expanded` × Theme, 48 wide, verticale in Stage 16,16. Collapsed 48×48 solo tool attivo; Expanded 48×236 con header active, divider, Select/Draw/Erase/Toggle e bottom border. Rimossa la vecchia 122×38; 13 schermate aggiornate.
- **C4 — InspectorRail:** nuovo `Organism/InspectorRail` 48×236, 10 varianti `Active=Tool|Look|Grid|Motion|Export` × Theme, box in alto a destra; Body 232/contenuto 204. Rimossi i tab orizzontali dall'Inspector. In Full la rail è su Tool e il Body mostra BRUSH (Size/Hover/Paint flash/Shift erases).
- **C1 — Canvas colors:** default dal codice ink **#202020**, paper **#E8E5E8**, empty cell **#FFFFFF**, line **#2C2C2C**. Aggiornati 13 CanvasPreview, 6 ghost, 10 Glyph instance, 4 target, 2 noise overlay, 21 swatch, 22 hex label, ProjectCard Thumb/MiniGrid.
- **C4 — GlyphGrid:** `Organism/GlyphGrid` 400×400 5×5, 9 stati (Reference/Heart/Arrow/Smiley/A/S/Clear/Random A/Random B); pattern da `src/lib/glyphs.ts`; Empty usa Clear. Vecchio 7×7 rimosso.
- **C1 — Noise:** gerarchia `Shape → Transitions → Effects → Noise`; pannello `Noise → Effects`; Inspector Scope All cells, Loop Proportional, Seamless On, Responsive On, Per-cell Off; preview All cells; overlay su tutte le celle. `React-to-opt.json` (5 L1 · 12 L2 · 18 L3) come contratto.
- **C2 — Board:** Board/02 HUG **16446**, List **14822**; `Row/Organism/GlyphGrid` e `Row/Organism/InspectorRail` aggiunte; `Row/Toolbar` aggiornata.
- Conteggio: **34 set · 235 varianti (113 light) · 26 schermate · 5 flussi**. Light 0 paint `ds/semantic`; 0 testi a larghezza zero.
- **A2** target picker e **A3** ResponseCalibration restano aperti. Vecchio `Molecule/Tabs` inutilizzato nell'Inspector.

### 0.11.0 — 2026-11-26 · Modulazione, preset, cell picker, noise
- **C4 — pannello MODULATION:** accanto alla timeline, 280×212, righe per elemento con source → target + valore; Chladni ha `dB→Handle X`, `Stems→Scale`, `Noise→Cell weights`; Color 3 `BPM→Opacity`; `+ Add modulation`. Più effetti per elemento, un solo path esatto.
- **C4 — Scene preset:** sidebar Animate con **PRESETS** (Chladni ghost, Molecules stack, Color trio) linked; `LIBRARY` glyph rimossa dall'Animate per spazio; Body gap 3.
- **C4 — Cell picker:** `State=Animate cell` dark/light con barra `Pick a cell · Chladni · 3·5 · Use cell`, celle evidenziate, target `Cell 3·5 · Handle X` in pannello/clip/Inspector; niente lista celle.
- **C4 — Noise map:** `State=Animate noise` dark/light con `Noise → Cell weights`, Inspector NOISE MAP (Source/Scale/Speed/Octaves/Contrast/Seed/Output/Range), preview 5×5, overlay pesi sul canvas; `Mode=Noise` del TimelineDock.
- **C2 — timeline:** Tools 220 · Timeline 906 · Modulation 280; 5 tracce; clip 24; `TimelineDock` 4 varianti (`Mode=Edit|Noise` × Theme).
- **C1 — fix:** light cell bar (popover light + Use cell primary light), noise clip selection, board 02 HUG 9396, presets/layers fit.
- Conteggio: **32 set · 214 varianti (107 light) · 26 varianti schermata · 5 flussi**.
- Prossimo: A2 target picker (Scene → Layer → Cell → Parametro), A3 ResponseCalibration, A4 LayerRow.

### 0.10.0 — 2026-11-26 · Scene/Animation workspace + timeline
- **C4 — modello:** `LOGIC-PAGES/03-scenes-layers.md` (Scene con griglia propria, layer/gruppi, ghost, frame/clip, transizioni, modulatori) e `04-animation-timeline.md` (workspace Animate, timeline, React-to, tastiera, a11y).
- **C4 — nuovo master:** `Organism/TimelineDock` 1440×322 (`Mode=Edit` × Theme): bar con trasporto/upload/zoom, scene strip (3 tab + transizioni + loop), tools 220, timeline 1187 con ruler, 4 tracce, clip 24, modulatore selezionato, waveform, playhead. Luce in `Theme=Light`.
- **C4 — schermata:** `Screen/Editor State=Animate` dark + `Screen/Editor-Light State=Animate` (0 paint `ds/semantic`): sidebar Scenes/Layers, ghost del layer inferiore nel canvas, Inspector Motion (Layer/Ghost/Audio modulation), TimelineDock al posto dell'AudioDock. Contenuto 576, timeline 322.
- **C4 — mode switch:** segmented `Design | Animate` nell'header di 7 stati Design (5 dark + 2 light) + Animate; labels con terzo segmento nascosto, 172×28.
- **C2 — sidebar Animate:** Scene 1/2/3, Layers (Molecules 2 → Chladni → Color 3 GHOST), Library (Reference/Heart/Arrow) con icone reali; footer invariato.
- **C1 — board:** `Board/02 Components` era FIXED 6912 e tagliava il master TimelineDock (row 684); ora HUG 8704. `Row/Organism/TimelineDock` dentro `List` (684), lista 7080.
- **C1 — icone:** swap icone corretto nei 7 IconButton della timeline (pause/play/mic/zoom/chevron/plus) e nelle righe Scenes/Layers/Library.
- **C1 — ghost:** impostato a 0.30, offset 44, sfondo rimosso dal duplicato e ordine main→ghost→toolbar; l'Inspector Ghost Opacity 0.30.
- Conteggio: **32 set · 212 varianti (106 light) · 22 schermate · 5 flussi**. Il target picker resta sul demo legacy: migrazione A2 (`Scene → Layer → Parametro`); Response calibration A3.

### 0.9.0 — 2026-11-25 · Target picker, pannelli fill, width/height pass
- **C4 — nuovo master:** `Organism/TargetPicker` 560×386, colonne Finder-like da 186, header 36, riga 30, footer path 40; 4 varianti (`Context=Cell|Grid` × `Theme=Dark|Light`). Contratto in `LOGIC-PAGES/02-target-picker.md`; usa `Screen/Editor State=Target` e `Screen/Editor-Light State=Target`. Trigger `REACT TO` con `ring` + chevron up.
- **C2 — pannelli:** `Content` è `FILL` in tutti gli stati Editor; Rail/Sidebar/Main/Inspector `FILL` in altezza; Sidebar con `Body` scrollabile + footer 56; Inspector `Body` clip. Audio error: pannelli 676 allineati al Content (prima 578).
- **C1 — width:** inspector 266 (era 268 su 266), righe `FILL`, tab 4×73.5, segmented 266; dock bar/tabs spacer `FILL`, tabella con prima colonna `FILL`, delete 24; Library head 1302 e card `FILL` in griglia 4 colonne; Settings Page 760 centrata e righe con controllo a destra; ContextMenu light 26→180; swatch 24.
- **C1 — height:** AudioDock fisse 56/322/222 con `Rows` 74 clip; CommandPalette 228 (Results 144 scroll); Dialog 176/332 con Slot `FILL`; EmptyState 174/190 HUG; ProjectCard interni `FILL`; `Row/Organism/TargetPicker` dentro `List` e HUG.
- **C4 — light:** rigenerate Editor (Full/Target), Library (Full/Empty/Loading), Settings, Overlay (Export/Palette) = 8 varianti; 0 paint `ds/semantic` nelle schermate light; switch Off corretto, segmented tema "Light" attivo, Settings allineate, dialog toggle On viola.
- **C3 — contrasto:** aggiunte le coppie del picker (`foreground/accent`, `muted-foreground/accent`, `selection/accent`) a `CONTRAST-MATRIX.md`.
- **C2 — processo:** nuove regole numeriche e checklist in `DS-RULES.md`; audit in `AUDIT-7-2026-11-25.md`.
- Conteggio verificato a fine tornata: **31 set · 210 varianti · 105 light · 41 icone**. I valori "69 set / 364 varianti" citati in 0.7.0 sono un conteggio errato: il file non li ha mai avuti.

### 0.8.0 — 2026-11-25 · Dialog/Palette master + 2 flussi
- **C4 — master:** `Organism/Dialog` (`Kind=Shell` · `Kind=Export`, entrambi con Theme) e `Organism/CommandPalette` (`Mode=Default`, con Theme). Gli overlay istanziano i master; i pannelli precedenti sono nascosti.
- **C4 — stati:** `Screen/Editor State=Grid` (inspector Grid con columns/rows/radius/padding/breathe) e `Screen/Library State=Menu` (context menu Duplicate/Rename/Delete).
- **C4 — flussi:** `Flow/Grid setup` e `Flow/Library management` → copertura 5/5 dei task BRIEF.
- Nota: slot arbitrari non supportati dall'API su piano free → dialog con contenuto fisso per variante `Kind`.

### 0.7.1 — 2026-11-25 · Light completo
- **C4 — schermate:** `Screen/Library-Light` (Full/Empty/Loading), `Screen/Settings-Light`, `Screen/Overlay-Light` (Export/Palette), accanto a `Screen/Editor-Light`. Sezione `03 UI → Screens/Light` con le quattro schermate in ordine.
- **C1:** `ProjectCard.Thumb` usa il paper del progetto (#0E0E11), non `canvas-backdrop`; in light le miniature non sono più chiaro su chiaro.
- **C1:** Settings light mostra "Light" attivo nella segmented del tema.
- Verifica: 0 paint legati a `ds/semantic` nelle schermate light (scan automatico).

### 0.7.0 — 2026-11-25 · Tema Light come asse di variante
- **C3 — architettura:** `Theme=Dark | Theme=Light` su **69 set** (364 varianti, 182 light). Il light usa `ds/semantic-light` (collezione parallela: il piano free consente 1 mode).
- **C4 — schermata:** `Screen/Editor-Light` (clone con 35 istanze scambiate alla variante light) nella sezione `Screens/Light`.
- **C1:** `CanvasPreview` usa il paper del progetto (#0E0E11) e non `canvas-backdrop` — in light il canvas non diventa bianco.
- **C4 — icone:** `Icon/heart`, `Icon/arrow-right` (41 totali) e righe Glyph presets con icone reali (image / heart / arrow-right).
- Verifica: 0 set con errori, 0 paint non rimappati.

### 0.6.0 — 2026-11-25 · Icone centrate + pannelli completi
- **C1 — bug icone:** doppio rescale + auto-layout ignorava `x/y`; 74 vettori riscalati alla box e 78 varianti centrate con `primary/counterAxisAlignItems = CENTER`.
- **C2 — sidebar Scene:** head con azioni (`panel-left`, `more`), gruppo `SCENE` con conteggio, divider, `GLYPH PRESETS` con `+` e 3 righe, footer con Save + export.
- **C2 — inspector:** head con badge `5×5` e chiusura, header di sezione con azione a destra (reset/swap), divider, corpo scrollabile (FILL + clip), footer fisso `Reset all` / `Apply look`.
- **C1 — stati:** Empty con griglia svuotata e dock Idle; Target/Error con ADVANCED nascosto e footer sempre visibile; undo/redo corretti in tutte le varianti; "Invert ink" off.
- Regola: ogni pannello ha header con azioni, sezioni con label+azione a destra, footer di azione ancorato in basso.

### 0.5.1 — 2026-11-25 · Stati audio (Idle / Error)
- **C2 — varianti:** `Organism/AudioDock` passa a due assi, `State` (Collapsed/Expanded) × `Audio` (Ready/Idle/Error) = 6 varianti. `Organism/WaveformWide` guadagna `State=Idle` e `State=Error`.
- **C4 — schermata:** nuova `Screen/Editor State=Audio error` (Content 678 + dock 222); `State=Empty` ora usa il dock Idle.
- **C1:** altezze dei dock Idle/Error legate al contenuto (222, non 322); riga d'errore 2px `destructive`; `+ Add preset` nascosto quando non c'è audio.
- Semantica: Idle = nessun file (CTA upload), Error = decodifica fallita (retry + scelta file), Ready = waveform + preset attivi.

### 0.5.0 — 2026-11-25 · Audio dock a tutta larghezza
- **C4 — nuovi master:** `Organism/AudioDock` (Collapsed 1440×56 / Expanded 1440×322), `Organism/WaveformWide` (1408×64, 140 barre, playhead), icone `volume-2` e `mic`.
- **C5 — deprecato:** `Organism/AudioPanel` (pannello audio laterale) rimosso: l'audio vive solo nel dock.
- **C1 — correzioni:** `Main`/`Stage` ridimensionati quando il dock è espanso (prima il canvas veniva tagliato); colonne della tabella a larghezza fissa; swap icone stop/play corretto.
- Struttura schermata: `Content (844 o 578)` + `AudioDock (56 o 322)` = 900.
- Sidebar Editor: solo Scene (gruppi, Glyph presets, Save).

### 0.4.0 — 2026-11-25 · Secondo audit + sidebar Scene/Audio
- **C4 — nuovi master:** `Organism/Waveform` (Playing/Idle), `Organism/AudioPanel` (Expanded/Collapsed), `Organism/EmptyState` (Card/Inline), `Organism/TreeRow-Child`, `Molecule/InspectorRow Kind=SliderNarrow`, `Type/Caption`.
- **C2 — varianti:** `State=Focus` su 9 set interattivi (ring 2px) — copertura focus 12 varianti totali; Tabs ridotto a 4 schede (Audio rimosso: ora è un pannello persistente).
- **C1 — correzioni geometria:** 90 padding/gap allineati alla scala 4px (10→12, 3→2); altezze fissate Button 32, SearchField 32, NavItem 28.
- **C1 — correzione visualizzazione:** `Cell/Editor` con `clipsContent` tagliava le varianti Empty e Target (absoluteRenderBounds null); set schermata impilati in verticale, celle non clippano.
- **C0 — riuso:** sidebar composta da `SceneGroup` + `Tree` + `AudioPanel` istanziato; nessun elemento one-off.
- **C1 — tipografia:** 279 nodi di testo collegati ai text style.
- Gate: G4 (unbound = solo contenuto progetto), G12 (0 frame senza layout), G15 (screen set validi), G17 (icone intatte).
- **C2 — estensioni:** `Organism/TreeRow-Child` (Default/Selected), `Organism/EmptyState` (Card/Inline), Button `State=Focus`, Input `State=Error`, `Screen/Editor State=Audio`.
- **C1 — correzioni:** set TreeRow con assi misti separato (era invalido); switch 32×18 → 32×24 (target WCAG 2.2); padding/gap/radius legati a `ds/scale` (8.094 + 1.876 + 1.160 binding); label menu contestuali; knob light specimen; header sidebar 32px; icona ProjectCard.
- **C0 — riuso:** stati vuoti delle schermate convertiti in istanze di `Organism/EmptyState` (niente elementi one-off).
- **C4 — modello pannello:** pannello sinistro rinominato **Scene**: `Grid → Cells (n) → Cell x·y → Audio targets (n)`; rimosso il `+` (nessun oggetto creabile) e aggiunto il comando **Glyph presets**. Decisione registrata in BRIEF §7.
- Gate: G8, G9, G11, G12, G13, G15, G16, G17 ri-eseguiti. Report: `AUDIT-2026-11-25.md`.
- Aperti tracciati: B1 light screens, B2 Dialog/Palette come master, B3 due flussi mancanti, B4 Focus residui.

### 0.2.0 — 2026-11-25 · Foundations + Components + Screens (first build on Figma)
- **C4 — new components (22 sets):** Atom/Badge, Kbd, Divider, Spinner, Text; Molecule/Button, IconButton, Input, SearchField, Slider, Switch, Checkbox, Segmented, Tabs, InspectorRow; Organism/NavRailItem, NavItem, TreeRow, ContextMenuItem, PanelHeader, ContextMenu, Toolbar, ProjectCard.
- **C4 — screens (4 sets):** Screen/Editor (Full, Empty), Screen/Library (Full, Empty, Loading), Screen/Settings, Screen/Overlay (Export, Command palette); 2 flows.
- **C3 — tokens:** `ds/palette` 30 colori, `ds/semantic` (Dark) 29, `ds/semantic-light` 29, `ds/scale` 44 float; text styles 7; effect styles 2.
- **C3 — icon system:** 37 icone lucide, component set `Icon/<name>` con asse Size 16/20, stroke 1.5, colore `muted-foreground`.
- **C1 — generated:** `CONTRAST-MATRIX.md`, `HARNESS.md`, `CANVAS-MAP.md`, `LOGIC-PAGES/*`, contracts.
- Gates run: G4 (paint binding), G8 (asset validation), G11 (contrast), G12 (auto-layout), G13 (harness), G17 (icons in Foundations).
- Deviations recorded: EXC-1 (parallel light collection), EXC-2 (vertical boards).
- Rationale: shadcn/ui neutral semantics with a single violet indicator; dark default; density from references (rail 56, sidebar 264, inspector 296, row 26–32, radius 6/8/10).

### 0.1.0 — 2026-11-25 · Intake + BRIEF
- Platform resolved: Figma (`gmorvNrypDXH59DHWP5chr`), free plan → 3 pages.
- Reference DNA extracted from 5 images; codebase read (`controls/main.json`, `controls-ui.tsx`, `cell-audio-panel.tsx`).
- Catalog indexed (152 design systems, 115 templates) — shadcn/ui chosen by user.
