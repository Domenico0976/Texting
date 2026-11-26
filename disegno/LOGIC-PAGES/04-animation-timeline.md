# 04-animation-timeline — Workspace Animate e timeline

Stato: 2026-11-26 · primo passaggio di design. Master: `Organism/TimelineDock`; schermata: `Screen/Editor State=Animate` (dark + light). Codice: non toccato.

## 1. Scopo

Permettere di costruire un video complesso con scene, layer, ghost, transizioni e modulazione audio senza abbandonare il canvas: si passa da **Design** a **Animate** con lo stesso progetto, lo stesso inspector e lo stesso linguaggio visivo.

Non è un video editor generico: le tracce sono **layer e modulatori** del progetto, i clip sono intervalli di visibilità/modulazione, le scene sono segmenti con griglia propria.

## 2. Ingresso e shell

- Segmented `Design | Animate` nell'header, a destra del breadcrumb. In Design è attivo Design; in Animate è attivo Animate. La scelta è globale per il progetto.
- In Animate:
  - **Sidebar** 264: Scenes (Scene 1/2/3, active), Layers (gruppo Molecules → Chladni selezionato, Color 3 GHOST), Presets (Chladni ghost / Molecules stack / Color trio). Footer Save/export invariato.
  - **Canvas** centrale: preview della scena attiva con ghost del layer inferiore; toolbar e zoom restano overlay.
  - **Inspector** 296: tabs Look/Grid/Motion/Export; in Animate si apre su **Motion**: Layer (opacity/visible), Ghost (source/opacity), Audio modulation (React to/source/sensitivity/range/calibrate). Il footer Reset/Apply resta.
  - **TimelineDock** 322 in basso, a tutta larghezza, al posto dell'AudioDock. Il dock audio torna in Design.
- Il contenuto scende a 576 (900 − 322 − 2): lo stage del canvas è 532, il preview 640 viene ritagliato dal Main (la griglia 400 resta visibile), l'Inspector scrolla, i footer restano ancorati.

## 3. Anatomia del TimelineDock

| Parte | Misura | Contenuto |
|---|---|---|
| Bar | 1408×34 | titolo Animation, badge SCENE 1, trasporto (pause/play, 00:22 / 01:00, 82 BPM), Upload audio, mic, MIDI, zoom, collapse |
| Scene strip | 1408×40 | 3 tab scena (190×32) con miniatura 5×5, nome, intervallo; marker transizione tra le scene; + Scene; Loops to start |
| Body | 1408×212 | Tools 220 · divider 1 · Timeline 906 · divider 1 · Modulation 280 |
| Tools | 220 | 4 tool (Molecules, Color 3, Chladni, Handle X) con icona, tipo, drag handle; hint "Drag a tool into a track" |
| Timeline | 906×212 | ruler 22, 5 tracce da 26, waveform 28, scrollbar 3 |
| Modulation | 280×212 | elementi raggruppati (Chladni, Color 3) con 4 modulator clip; source → target + valore; riga selezionata; + Add modulation |

- **Ruler**: 00:00 → 01:00, tick ogni 10s, etichette mono 9. Loop region 5–55s con linea viola. Playhead a 22s: linea 1px `selection`, handle 7×7.
- **Scene strip**: tab attiva `accent` + underline `selection`; miniatura 5×5; transizioni come cerchi con chevron; `+ Scene` ghost; switch loop a destra.
- **Tracce**: layer e modulatori. Clip 24 high, radius 5, fill `muted`, bordo `border`; clip selezionato `accent` + bordo `selection`. Clip layer: miniatura 16 + nome 10. Clip modulatore: icona onda + nome + `dB`.
- **Waveform**: 118 barre da 4px, porzione suonata `selection`, resto `muted-foreground` al 35%; decorativa, non interattiva.
- **Scrollbar orizzontale**: 3px, handle 300; indica lo zoom, non è un secondo scroll verticale.
- **Scene attiva**: tinta `selection` al 5% sulla regione 0–20s; separatori 1px alle soglie 20/40s.
- **Nessun footer**: la timeline è il footer dell'app in Animate.

- **Kinetic grid (regola di animazione).** Nessuna scala del corpo cella, nessuna deformazione del canvas. Ogni quadrante è un **sink radiale**: lo spazio si contrae attorno al centro del quadrante e l'anello attorno assorbe la differenza. Essendo **isotropo** le celle mantengono le proporzioni (i cerchi restano cerchi, niente shear né allungamenti su un solo asse); essendo **compatto** (raggio ~1.9 celle per la cella, 2.2 per il shape mode) la griglia mantiene la dimensione globale; essendo **continuo** ogni giuntura resta un bordo condiviso, disegnato una volta.
- **Shape mode**: lo stesso sink applicato per cella, ampiezza = vicinanza al livello audio mappato in verticale (alto → alto, basso → basso) × hash della cella. La griglia non cambia misura: diventano cinetici solo gli spazi dei quadranti.

### Dock unificato: `Organism/Dock` (10 varianti)

Un solo componente al posto di AudioDock + TimelineDock. `View = Collapsed | Presets | Presets error | Scenes | Scenes noise` × `Theme`.

| View | Altezza | Contenuto |
|---|---|---|
| Collapsed | 56 | solo bar (niente switcher) |
| Presets | 322 | bar + switch + waveform 64 + tabella Setting + Add preset |
| Presets error | 222 | bar (badge ERROR) + switch + waveform + messaggio + `Choose another file` |
| Scenes | 322 | bar + switch + strip scene 40 + Tools 220 / Timeline / Modulation |
| Scenes noise | 322 | come Scenes, con `Noise → Effects` selezionato |

- Il campo scena nella strip è il **punto d'ingresso del pannello scena**: click sul campo apre il pannello modale con le impostazioni della scena selezionata (`Scenes-opt.json`). Il pannello non sostituisce mai React-to.
- Il marker di confine sta **fra** due campi scena e mostra Out a sinistra, In a destra; si legge in una riga (`Fade out · 300 ms` / `Fade in · 300 ms`) e si modifica nel pannello.
- Mapping schermate: Full/Empty/Grid → Collapsed; Target → Presets; Audio error → Presets error; Animate/Animate cell → Scenes; Animate noise → Scenes noise.

## 4. Interazioni

### Scene e preset
- Click su una tab: seleziona la scena, porta il playhead all'inizio, aggiorna canvas/sidebar/inspector.
- Drag della tab: riordina le scene; le transizioni si spostano con i confini.
- `+ Scene`: menu `Empty scene` / `From preset`; il preset aggiunge un gruppo di layer linked alla scena.
- Nella sidebar **PRESETS**: tre stack (`Chladni ghost`, `Molecules stack`, `Color trio`); drag o `+` inserisce il preset nella scena attiva; `Unlink` rende i layer locali.
- Loops to start: switch globale; la loop region resta visibile sul ruler.

### Timeline
- Click sul ruler: seek; drag: scrub; `Shift`+drag: selezione intervallo.
- Play/pause: spazio; il playhead avanza; il canvas mostra il frame; il ghost è calcolato per il frame corrente.
- Zoom: pulsanti e `⌘/Ctrl`+scroll; il ruler scala, i clip restano proporzionali; min 10s, max 5min visibili.
- Clip layer: drag per spostare, trim ai bordi, `⌘/Ctrl+B` split al playhead, `Delete` rimuove (con undo).
- Clip modulatore: click seleziona e apre il riepilogo nell'Inspector; doppio click apre la calibrazione (Response calibration).
- Drag di un tool dalla lista nella timeline: crea un layer + clip alla posizione; se il tool è un parametro crea un modulator clip.
- Transizione: click sul marker tra due scene apre Transition nell'Inspector; drag del bordo cambia durata; `Cut` nasconde il marker.
- Snap: 50ms per clip e transizioni; `Alt` disabilita lo snap.

### Pannello MODULATION
- Accanto alla timeline (280px): elementi raggruppati, ogni riga è un modulator (source → target, valore).
- Click su una riga seleziona il clip e apre la sezione nell'Inspector; `+ Add modulation` crea un nuovo modulator sull'elemento.
- Più effetti sullo stesso elemento sono ammessi; lo stesso **path esatto** no. Il target picker dell'add flow disabilita i leaf già usati ("Already modulated by dB").
- La riga `Noise → Effects` è il noise map; seleziona il clip `Chladni · Noise` e apre l'Inspector NOISE MAP.
- Il pannello è scrollabile; il clip selezionato resta evidenziato anche nella timeline.

### Cell mode (canvas)
- Dal target picker, quando il leaf è una cella, `Pick on canvas` chiude il picker ed entra in cell mode.
- Il canvas evidenzia le celle (hover + focus), una barra flottante mostra `Pick a cell · Chladni · 3·5 · Esc` con `Use cell`.
- Click su una cella → path `Scene 1 / Chladni / Cell 3·5 / Handle X`; il pannello mostra `dB → Cell 3·5 · Handle X`.
- `Esc` annulla e riporta al picker; la cell mode è solo per target di cella, non per griglia/layer.
- Il target picker non usa più una lista di celle: la lista non permette il riconoscimento spaziale.

### Noise map
- **Cosa è.** Non è una texture sopra la forma e non la distrugge: è un **campo scalare** generato da preset + matematica (somma di impulsi direzionali). Ogni cella colorata legge il valore del proprio quadrante e lo traduce in variazione di **scale, offset, opacity e velocità di animazione**. La cella resta nel proprio quadrante: la modulazione cambia i suoi parametri, non la sua posizione. Le celle non colorate non ricevono nulla.
- **Dove vive.** `Shape → Effects → Noise`. Il lv3 `Effects` è una voce `kind: "effect"`: selezionarla non apre una quarta colonna nel picker, apre il **pannello Noise affiancato a Sources**. `Transitions` non sta più in React-to: è nella sezione Scenes.
- **Pannello Noise (due blocchi).**
  1. *Field*: Preset (Blobs, Stripes, Grain, Duotone, Composite), Scale, Detail, Roughness, Distortion.
  2. *Advanced*: Direction, Aniso, Bandwidth, Impulses, soglie Less than / More than.
  3. *Output*: Cell scale, Cell offset, Cell opacity, Cell speed.
  4. *Animation*: Speed, Seed, Loop Proportional, Seamless, Responsive to grid, Per-cell (Off in v1).
- **Modulazione audio per parametro.** Ogni parametro modulabile ha uno slot: sorgente (dB, Stems, MIDI, BPM, Snap & Hold), amount e **easing** (attack, release, curva).
- **Regola del tetto.** Il valore impostato nel pannello è il **massimo**: l'audio porta il parametro da 0 a quel valore, mai oltre. L'easing della modulazione si imposta nello stesso pannello che possiede il parametro.
- **Inspector**: Scope All cells, Loop Proportional, Seamless On, Responsive On, Per-cell Off. Preview 5×5 "All cells · dB" + overlay pesi sul canvas; il clip `Chladni · Noise` è selezionato; il pannello mostra `Noise → Effects`.
- Il noise è shape-only: non disponibile per group/grid/cell/scene; un solo noise per forma; loop proporzionale allo stretch, seamless, responsive alla griglia. Contratto: `controls/React-to-opt.json` v2.0.0.

### Tastiera
| Tasto | Azione |
|---|---|
| `Space` | play/pause |
| `←` / `→` | playhead −/+ 1 frame (o 1s con Shift) |
| `Home` / `End` | inizio/fine progetto |
| `J` / `K` / `L` | indietro / stop / avanti (video editor) |
| `⌘/Ctrl+B` | split clip al playhead |
| `Delete` | rimuove clip selezionato |
| `1`…`3` | selezione scena 1…3 |
| `C` | cell mode dalla selezione corrente |
| `Esc` | deseleziona clip / chiude popover / annulla cell mode |

## 5. Collegamento a React to

- **Due proprietari, nessuna sovrapposizione.**
  - `React-to-opt.json` (v2.1) = **modulazione audio del singolo livello**: `Scene → Elemento → Ramo → Parametro`, 3 livelli. Contiene **solo** ciò che può essere modulato: le proprietà statiche (Ink, Paper, Glyph, Preset, Seed, loop) **non compaiono affatto** nel picker e vivono solo nel pannello che le possiede.
  - `Scenes-opt.json` (v1) = **flusso delle scene**: tempi, playback, display/export della griglia, contenuto, e i **confini** fra scene. Non è un elenco di target audio.
- **Confine (boundary).** Fra scena N e N+1 ci sono due slot indipendenti: **Out** (fine di N) e **In** (inizio di N+1). Si può impostare uno, l'altro o entrambi: fade out su scena 1 + fade in su scena 2 = due slot; fade in solo su scena 2 = un solo slot In. Il campo scena nella strip mostra il marker dal lato corretto.
- **Pannello scena.** Si apre dal **campo scena** nella strip `Scenes` (sopra la timeline), non da React-to. Mostra sempre le impostazioni della **scena selezionata**: cambiando scena cambia il contenuto dello stesso pannello, mai un pannello per scena.
- **Griglia.** La griglia è lo strumento di disegno: invisibile in animazione e in export salvo `Show grid in export` (per scena). Non è modulabile: sono le shape/celle a muoversi, e solo temporaneamente, senza modificare il disegno.
- **Profondità fissa a 3 livelli**: `lv1` → `lv2` ramo → `lv3` parametro. Un raggruppamento è il campo `group`, non un livello. Colonne del picker: **Scene | Elemento | Ramo | Parametro**.
- **Eccezione unica**: una voce lv3 con `kind: "effect"` è l'effetto stesso. I suoi parametri vivono nel pannello dedicato.
- Ogni modulatore è un clip; il suo target è un path `Scene → Elemento → Ramo → Parametro`. Per le celle il path include `Cell 3·5`, scelto sul canvas.
- Il target picker si apre dal clip (doppio click), dal pannello MODULATION o dalla riga `React to` dell'Inspector. Per le celle mostra `Pick on canvas`.
- La calibrazione (Image 2 del brief) contiene: header `Layer · Parametro`, tab sorgente (dB / Harmony / Stems / MIDI / BPM / Snap & Hold / Automation), Sensitivity, Value Range (min/max), Envelope (attack/release), footer Apply/Cancel. A3.
- **Tetto della modulazione**: il Value Range non può superare il valore impostato nel pannello che possiede il parametro; l'envelope è l'easing della modulazione.
- Nel mock attuale l'Inspector mostra `React to Handle X / Cell 3·5`, `Source dB`, `Sensitivity 59`, `Range 0–100`; il pulsante `Calibrate modulation…` è il punto d'ingresso al popover.
- Il clip modulatore selezionato è `Chladni · Handle X` (0:06–0:34) nel base; `Chladni · Cell 3·5` nello stato cell; `Chladni · Noise` nello stato noise.
- Il **Noise map** è un modulatore `Noise → Effects`: audio → noise field → pesi per tutte le celle → output (scale/offset/rotation/opacity). Non è una sorgente React-to separata: vive dentro `Shape → Transitions → Effects`.
- **Canvas colors:** default ink #202020, paper #E8E5E8, empty cell #FFFFFF, line #2C2C2C. Sono contenuto del progetto, non token UI: l'utente può cambiarli. Il glyph è `Organism/GlyphGrid` 5×5 con 9 stati.
- **Toolbar:** 48 wide, top-left Stage 16,16; collapsed solo tool attivo, expanded 48×236 con Select/Draw/Erase/Toggle e bottom border.
- **Inspector:** rail verticale 48 (`Organism/InspectorRail`) a destra; Body 232/204; il tool attivo aggiunge la sezione BRUSH con la sua icona nella rail.

## 6. Flusso "scena complessa"

1. **Animate** → `+ Scene` → `From preset` → `Chladni ghost` (Scene 1, grid 5×5, 2 layer linked).
2. Trascina `Chladni` dal Tools alla traccia se non è già nel preset; nasce il layer + clip 0:00–0:20.
3. Aggiungi `Color 3` come ghost source; attiva **Ghost = Below** su Chladni, opacity 0.30, offset 44.
4. Crea **Scene 2** con grid 9×7 e una transizione Fade 300ms dal confine 0:20.
5. Apri `+ Add modulation` su Chladni: `dB → Handle X`. Poi `Stems → Scale`. Poi `Noise → Effects`; il noise applica i pesi alle celle.
6. Per un target di cella, `Pick on canvas` → click `Cell 3·5` → path `Scene 1 / Chladni / Cell 3·5 / Handle X`.
7. Loop 5–55s, play; scrub per vedere ghost, noise e transizione; export video.

## 7. Stati

| Stato | Comportamento |
|---|---|
| Empty | nessuna scena: canvas con CTA "Create the first scene"; timeline vuota con ruler e + Scene |
| No audio | trasporto disabilitato, modulator clip in grigio, CTA Upload audio |
| Playing | playhead animato, canvas 12fps durante scrub, stop/pausa |
| Scrub | anteprime a bassa qualità, ghost calcolato, inspector aggiornato |
| Transition selected | inspector su Transition (tipo/durata/easing), marker evidenziato |
| Missing target | clip `Target unavailable`, CTA "Pick another target" |
| Error | audio non decodificato: banner nel bar, clip audio rosso, il resto interattivo |
| Collapsed | 56px: solo bar e trasporto; chevron per riaprire. Il contenuto resta montato |
| Cell mode | canvas con celle evidenziabili, barra `Pick a cell` + `Use cell`; path con `Cell 3·5` |
| Noise selected | pannello su `Noise → Effects`, Inspector NOISE MAP con preview 5×5, overlay pesi sul canvas |
| Multiple modulators | più righe sullo stesso elemento (target diversi); riga target duplicata bloccata |

## 8. Accessibilità

- Target: tab scena 32, tool 34, clip 24, modulation row 24, cella 44 (≥24), pulsanti cell bar 28–32, playhead handle 24 in codice (visivo 7), trasporto 32, mode switch 28.
- Clip e scene tab sono button con `aria-label` (`Scene 1, 0:00–0:20`, `Chladni · Cell 3·5`); la timeline è una lista di tracce, non un canvas ARIA.
- Focus visibile: anello `ring` 2px su tab, clip, tool, modulation row, cella; il tasto `Tab` attraversa scene → tools → clip → modulation.
- Il playhead è uno slider con `aria-valuenow/valuemin/valuemax` e step 50ms.
- Il ghost non è solo colore: badge `GHOST` + sezione Inspector + offset visibile.
- Cell mode: le celle sono `role=gridcell` con coordinate; hover/focus; `Esc` annulla; il path è annunciato.
- Noise: i pesi non sono solo colore; la preview mostra i valori; l'output è descritto in testo.
- Reduced motion: durante lo scrub niente animazioni di transizione; il playhead si muove senza easing.
- Contrasto: clip label `foreground` su `muted` 14.50/18.16; clip selezionato `foreground` su `accent`; bordo `selection` 3.57/5.23; playhead `selection` su `background` 4.68/5.70. Tutte coppie già in `CONTRAST-MATRIX.md`.

## 9. Componenti e prossimi passi

Costruiti:
- `Organism/TimelineDock` 1440×322, **4 varianti** (`Mode=Edit|Noise` × Theme): 3 scene, 5 tracce, clip 24, pannello MODULATION 280 con 4 modulator, waveform, playhead.
- `Screen/Editor State=Animate`: sidebar Scenes/Layers/Presets, ghost, Inspector Motion, TimelineDock.
- `State=Animate cell`: cell mode sul canvas, barra `Pick a cell`, target `Cell 3·5 · Handle X` nel pannello/clip/Inspector.
- `State=Animate noise`: `Noise → Effects` selezionato, Inspector NOISE MAP con preview 5×5, overlay pesi sul canvas, clip Noise.
- Tutti gli stati in dark + light; 0 paint `ds/semantic` nelle schermate light.
- Mode switch `Design | Animate` su 7 stati Design + 3 Animate.

Prossimi (ticket A2/A3):
- **ResponseCalibration** popover (Image 2) con tab sorgente, sensitivity, range, envelope.
- **LayerRow** dedicata con eye/lock/ghost/folder e drag; icone lucide `eye`, `eye-off`, `lock`, `folder`, `ghost`, `grip-vertical`.
- **Target picker** migrato a `Scene → Layer → Cell → Parametro` con cell scope `Pick on canvas`.
- **Transition** inspector e marker; **Empty/Loading** della timeline; **video export**.
- **Video export** dialog: durata, fps, risoluzione, audio, loop; usa il Dialog master.

