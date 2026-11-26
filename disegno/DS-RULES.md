# DS-RULES — Regole di pannelli, popup e componenti

Versione 0.9.0 · 2026-11-25. Ogni componente nuovo deve passare questa checklist prima di entrare in `Masters/Containers`. Le regole numeriche sono quelle usate nel file Figma "Texting".

## 1. Pannelli laterali (Sidebar, Inspector)

Anatomia obbligatoria, dall'alto:

| Parte | Sizing | Regola |
|---|---|---|
| Head | fixed 28–44 | titolo + azioni a destra; mai scorre |
| Body | **FILL + clip** | è l'unica zona che scorre; `overflow: auto` in codice |
| Foot | fixed 56 | azioni ancorate in basso; il body non può spingerle fuori |

- Il pannello **riempie sempre l'altezza disponibile**: `layoutSizingVertical = FILL` sul pannello e su Rail/Sidebar/Main/Inspector dentro `Content`.
- Il body non ha mai un'altezza fissa ricavata a mano: è `FILL`. Se il contenuto è più alto, scorre; il footer resta visibile.
- La larghezza del contenuto è il padding del pannello: niente figli larghi 268 dentro un body largo 266. I figli strutturali sono `FILL`, non `FIXED`.
- Le righe hanno label a sinistra e controllo a destra (`SPACE_BETWEEN` o spacer `FILL`). Un controllo appiccicato alla label lascia metà riga vuota: è un bug, non una scelta.
- I divisori sono `FILL` in larghezza.
- Il footer può essere full-bleed (264 dentro 264) con bordo superiore `border`.

Esempio verificato: `Screen/Editor` → Content 842 (Full) / 676 (Audio error); Sidebar e Inspector 842/676; footer a 56 dal fondo.

## 2. Popup e overlay

| Componente | Larghezza | Altezza | Corpo | Footer |
|---|---|---|---|---|
| Dialog | 480 fixed | fixed per variante: 176 Shell, 332 Export | `Slot` FILL + clip; max **640** | 60 fixed, pulsanti a destra |
| Command palette | 560 fixed | HUG 228 (max 420) | `Results` viewport 144 + clip | hints 20, sempre visibile |
| Context menu | 180 fixed | HUG (max 320) | items 26 | — |
| Target picker | 560 fixed | 386 | 3 colonne da 302 con scroll | path 40 |

Regole:
- Il contenuto nuovo non allunga il popup oltre il massimo: si aggiunge una variante `Kind`/`Context` con altezza fissa, oppure si lascia scorrere il body.
- Il footer non è mai dentro il body scrollabile.
- Il popup ha `popover` + `border` + ombra `Elevation/popover|dialog`; nessuna ombra su superfici non flottanti.
- Un dialog nuovo = una variante `Kind=<nome>` (il piano free non permette slot arbitrari). Non copiare il master sciolto.

## 3. Audio dock

- Larghezza sempre 100% (`FILL`); tutti i figli strutturali `FILL`: Bar, Tabs, TableHead, Rows, AddRow.
- Gli spacer dentro Bar e Tabs sono `FILL`: trasporto e `+ Add preset` stanno a destra. Uno spacer fisso 10 lascia metà dock vuoto.
- Altezze: collapsed **56**, expanded Ready **322**, expanded Idle/Error **222**. Sono altezze massime: il dock non cresce con i preset.
- La tabella ha `Rows` con altezza fissa 74 e `clip`; con più di 2 preset si scorre dentro `Rows`, non si allunga il dock.
- La prima colonna (`Name`/`PRESET`) è `FILL`; le colonne numeriche restano fisse. Il resto dello spazio va al nome, non a un vuoto a destra.
- Il controllo di rimozione ha cella **24×24** (icona 16 centrata), non 16×16.

## 4. Card, griglie e stati vuoti

- `ProjectCard`: larghezza base 260; Thumb, Meta e Top sono `FILL`; il titolo è `FILL`; la thumb è il **paper del progetto**, non `canvas-backdrop`.
- La libreria è una griglia a 4 colonne: `gridColumnCount = 4`, gap 20, `Cards` FILL; le card sono `FILL` (310 circa a 1440). Non usare posizioni assolute per le card.
- `EmptyState`: altezza **HUG** (174 Card / 190 Inline), non 120. La descrizione è `FILL`; il Card è centrato, l'Inline resta a sinistra. Icona 20 nel Card.
- Nei layout di pagina, titolo e contenuto condividono la stessa colonna: in Settings il `Page` è 760 centrato e contiene Head + gruppi; non centrare i gruppi lasciando il titolo a sinistra.

## 5. Accessibilità (minimi)

- Target interattivo ≥ 24×24: swatch colore 24, delete dock 24, chiusura popup 28, righe picker 30, righe menu/tree 26, tab 36.
- Focus visibile: anello `ring` 2px. I set che hanno `State=Focus`: Button, IconButton, Input, SearchField, Slider, Switch, Checkbox, NavItem, TreeRow, TreeRow-Child, ContextMenuItem, ProjectCard.
- La selezione non è solo colore: barra + spunta + path nel picker; underline + label nei tab; pill + label nei segmented.
- Contrasto: ogni coppia usata è in `CONTRAST-MATRIX.md`; il viola è indicatore, non testo.
- Gap noto: `Molecule/Tabs` e `Molecule/Segmented` non hanno una variante `Focus` dedicata. In codice: `:focus-visible` con anello `ring` 2px, senza cambiare la geometria. Non introdurre l'asse `Focus` nel master Figma senza rifare le istanze.

## 6. Timeline e workspace Animate

- Ingresso: segmented `Design | Animate` nell'header (172×28; due segmenti visibili; il terzo nascosto). In Design è attivo il primo, in Animate il secondo.
- `Organism/TimelineDock`: 1440×322, full width in fondo, al posto dell'AudioDock. Anatomia: Bar 34 · gap 8 · Scene strip 40 · gap 8 · Body 212, padding 10/16.
- Scene strip: tab 190×32 (miniatura 5×5, nome, intervallo), marker transizione 20×32, `+ Scene`, loop region + switch a destra.
- Body: Tools 220 (righe 34) · divider 1 · Timeline 906 · divider 1 · **Modulation 280**. Ruler 22, **5 tracce** da 26, waveform 28, scrollbar 3.
- Clip: **24 high**, radius 5; layer clip con miniatura 16 + label 10; modulation clip con onda + label + `dB`. Clip selezionato `accent` + bordo `selection`.
- **Modulation panel** (280): elementi raggruppati (CHLADNI, COLOR 3), righe 24 `source → target value`; riga selezionata `accent` + barra `selection`; `+ Add modulation`. Un elemento può avere più modulator, ma un solo per path esatto.
- La sidebar Animate usa **Scenes / Layers / Presets** (non Library), righe 26, Body gap 3 per far stare le tre sezioni; il footer resta 56.
- **Scene preset**: stack di layer linked; riga preset con conteggio; inserimento nella scena; `Unlink` per renderlo locale.
- **Cell mode**: per un target di cella non si usa una lista; il picker offre `Pick on canvas`, il canvas evidenzia le celle, una barra 420×40 `Pick a cell · Chladni · 3·5 · Esc · Use cell`; cella ≥44 (target ≥24); `Esc` annulla. Path `Scene 1 / Chladni / Cell 3·5 / Handle X`.
- **Noise map**: modulatore `Noise → Effects` (Shape → Transitions → Effects), scope **All cells**, Loop **Proportional**, Seamless On, Responsive On, Per-cell Off; Inspector con Source/Scale/Speed/Octaves/Contrast/Seed/Output/Range, preview 5×5 "All cells · dB"; overlay pesi su tutte le celle; un solo noise per forma; non disponibile per group/grid/cell/scene.
- **Toolbar**: `Organism/Toolbar` 48 wide, Stage 16,16; collapsed 48×48 (solo tool attivo), expanded 48×236 (header active + divider + Select/Draw/Erase/Toggle + bottom border); target 44.
- **Inspector rail**: `Organism/InspectorRail` 48×236 in un box a destra, 5 icone Tool/Look/Grid/Motion/Export; Body 232 (contenuto 204); il tool attivo aggiunge la sezione BRUSH con la sua icona nella rail. Rimossi i tab orizzontali.
- **Canvas content**: ink #202020, paper #E8E5E8, empty cell #FFFFFF, line #2C2C2C; `Organism/GlyphGrid` 5×5 con 9 stati (Reference/Heart/Arrow/Smiley/A/S/Clear/Random A/B); Empty usa Clear. Sono contenuto, non token UI.
- Playhead: linea 1px `selection` + handle 7 (target 24 in codice); loop line 2px `selection`.
- Scene attiva: tinta `selection` al 5% (node opacity); separatori 1px `border` alle soglie.
- Il ghost è un layer renderizzato, non un layer interattivo: `Ghost=Off|Below|Custom` + opacity/offset/tint; badge `GHOST` nella riga; resa visibile nel canvas, offset ≥24 per leggersi.
- La griglia è della scena, non del layer: il tab Grid dell'Inspector agisce sulla scena attiva; Morph solo con griglie compatibili.
- Non annidare scroll verticali nella timeline: le tracce scorrono in orizzontale; i tools e il pannello modulation restano fissi. La timeline demo ha contenuto fisso (3 scene, 5 tracce, 4 modulator); il codice usa dati.
- Target: tab scena 32, tool 34, clip 24, modulation row 24, cella 44, trasporto 32, mode 28. Il playhead è uno slider con step 50ms; aria-label su scene/clip; `:focus-visible` ring 2px.

## 7. Checklist per un componente nuovo

1. Sizing esplicito: root HUG/FILL/FIXED; nessuna altezza indovinata.
2. Body scrollabile + footer ancorato (se è un pannello/popup).
3. Figli strutturali `FILL`; testo lungo truncato in codice; niente testo tagliato in Figma.
4. Varianti `Theme=Dark` + `Theme=Light`; colori solo da `ds/*`.
5. Stato `Focus` se è interattivo; target ≥24.
6. Inserimento in `Masters/Containers` dentro `List`, con row **HUG** (non 40) così il set non sborda.
7. Screenshot dark + light e una riga in `DS-CHANGELOG`.
