# 01-editor — Editor

## 1. Purpose
Disegnare un glifo su una griglia, modularne forma e look, collegare una cella all'audio e salvare il progetto.

## 2. What it shows
1. Rail icone (Editor attivo).
2. Sidebar **Scene**: head con azioni (`panel-left`, `more-horizontal`), search, gruppo `SCENE` con conteggio, albero `Grid → Cells (n) → Cell x·y → Audio targets (n)`, divider, sezione **GLYPH PRESETS** con `+` e tre preset (Reference, Heart, Arrow), footer con `Save project` + export.
   - Il `+` non crea oggetti: apre i preset glifo. L'unica creazione è applicare un preset alla griglia.
   - Le proprietà (Look, Motion) non stanno nell'albero: stanno nelle schede dell'inspector.
3. Header: breadcrumb `Fragment / Untitled grid`, mode switch `Design | Animate`, undo, redo, ⌘K.
4. Canvas: griglia con celle ink/paper, **toolbar verticale 48 in alto a sinistra** (collapsed solo tool attivo; expanded 48×236 con Select/Draw/Erase/Toggle e bottom border), zoom in basso a destra. Il glyph è `Organism/GlyphGrid` 5×5 con 9 stati (Reference/Heart/Arrow/Smiley/A/S/Clear/Random A/B); l'Empty usa Clear. Default canvas: ink **#202020**, paper **#E8E5E8**, empty cell #FFFFFF, line #2C2C2C (contenuto, non token UI).
5. Inspector 296: titolo + dimensione griglia, **rail verticale 48 in un box a destra** (`Organism/InspectorRail`: Tool/Look/Grid/Motion/Export), Body 232 con contenuto 204, footer Reset / Apply look. Quando un tool è attivo, la sua icona appare nella rail e il Body mostra la sezione del tool (in Full: BRUSH, Brush 1).
6. **Audio dock a tutta larghezza, in basso** (`Organism/AudioDock`):
   - **Collapsed 56px:** Audio + badge REACTIVE + nome file, tempo, BPM, stop, play, Upload audio, volume, MIDI, espansione.
   - **Expanded 322px:** tab Presets/Scenes, waveform a tutta larghezza con playhead, tabella modulazioni `PRESET · REACT TO · SOURCE · SENSITIVITY · RANGE · FREQUENCY`, rimozione riga, `+ Add preset`.
   - Non è una scheda né un pannello laterale: resta sempre visibile e si espande in altezza.
7. Overlay contestuale (variante con menu su cella/layer).
8. **Target picker a colonne** (`Organism/TargetPicker`), aperto dalla cella `REACT TO` della riga preset: gerarchia visibile, path nel footer, spunta sul leaf. Specifica completa in `LOGIC-PAGES/02-target-picker.md` (migrazione A2 a `Scene → Layer → Parametro`).
9. **Mode switch `Design | Animate`** nell'header. In `Animate` la sidebar diventa Scenes/Layers, l'Inspector apre Motion (Layer/Ghost/Audio modulation) e il fondo è `Organism/TimelineDock`; dettagli in `LOGIC-PAGES/03-scenes-layers.md` e `04-animation-timeline.md`.

## 3. Data
- Selezione corrente: cella (x,y) oppure layer (Grid/Glyph/Look/Motion/Audio).
- Inspector guidato dalla selezione: nessuna selezione → proprietà del progetto.
- Ogni preset audio conserva un **`targetId` stabile** (es. `glyph.reference.cell.3-5.handle-x`), non una label. Il path si ricostruisce dal resolver alla riapertura.
- Mancante: nessuna cella selezionata → tab Audio mostra "Select a cell" con CTA "Pick a cell"; nessun audio caricato → "Load audio".

## 4. States
- **Full:** griglia con glifo, inspector su Look, dock audio collassato con file caricato, CTA save abilitata.
- **Empty:** griglia vuota, hint in canvas, inspector su Grid, dock in stato **Idle** ("No audio loaded", CTA upload).
- **Target:** cella selezionata, dock **Espanso · Ready**: waveform con playhead, preset di modulazione, `+ Add preset`; picker a colonne aperto sopra la riga `REACT TO` (Reference → Cell 3·5 → Handle X).
- **Audio error:** dock **Espanso · Error**: badge ERROR, "could not decode", Retry upload, waveform piatta `destructive`, messaggio con "Choose another file".
- **Loading:** spinner nel dock durante la decodifica; il resto della UI resta interattivo.
- **Partial:** cella senza audio → il pannello resta Idle e la riga target mostra "Select a cell".
- **Animate:** modalità scene/animazione (mode switch): sidebar Scenes/Layers, canvas con ghost del layer inferiore, Inspector Motion, TimelineDock 322 con 3 scene, 4 tracce, modulatore selezionato. Vedi `04-animation-timeline.md`.

## 5. Actions
- Disegnare/cancellare celle; selezionare cella; hover highlight.
- Cambiare look (preset o ink/paper custom), invert, grain.
- Cambiare griglia (columns/rows), corner radius, padding.
- Caricare audio, scegliere preset, attivare la reazione.
- Export, save, palette comandi, menu contestuale.

## 6. UX Rules
- I ~90 parametri vivono in 5 schede; default visibili solo quelli d'uso, "Advanced" collassato.
- Ogni riga dell'inspector mostra il valore numerico accanto allo slider.
- La toolbar flottante non copre mai il puntatore: si sposta in alto-centro.
- Zoom e toolbar sono overlay ancorati (eccezione G12 registrata).
- I pannelli riempiono sempre l'altezza: Head fisso, Body `FILL` scrollabile, Foot 56 ancorato. Le azioni non vengono mai spinte fuori dal contenuto.
- Il dock audio ha un'altezza massima per stato (56 / 322 / 222): non cresce con i preset; la tabella scorre dentro `Rows`.
- Il target picker non è un dropdown: la gerarchia resta visibile in colonne; il path testuale conferma la scelta.
- Regole numeriche e checklist: `disegno/DS-RULES.md`.

## 7. Perception & affordance
- Scopo percepito: "posso disegnare qui" — griglia visibile, cursore crosshair, toolbar con tool attivo in viola.
- Elementi attivi: celle (hover), tab inspector, toggle, CTA save.
- Ambiguità risolta: distinzione netta tra "aspetto" (Look) e "geometria" (Grid).

## 8. Flow & feedback
- Disegno: paint flash 120 ms, undo immediato.
- Cambio look: canvas aggiornato < 100 ms; nessun reload.
- Audio: stato esplicito (Select a cell / empty / load file / reactive).
- Salvataggio: toast "Saved" + library aggiornata al ritorno.

## 9. Target picker — comportamento nella schermata

- Si apre dalla cella `REACT TO` (click/Enter/Space) e si ancora sopra la riga, senza scrim.
- Colonne: `Scene` (oggetti), `Cells`/`Sections` (ramo), `Parameters` (leaf). Il branch selezionato resta visibile; il leaf ha la spunta.
- Click su un antenato tronca il path; click su un leaf committa e chiude; `Esc`/click fuori chiude e riporta il focus alla cella.
- `↑↓` nella colonna attiva, `→` apre il ramo, `←` torna indietro, `Enter` conferma.
- Il footer mostra sempre `Object / Branch / Parameter`; è l'antidoto all'ambiguità del solo dropdown.
- Contratto dati, resolver e ARIA: `LOGIC-PAGES/02-target-picker.md`.

## 10. Altezze e scrolling (numeri)

| Contesto | Head | Body | Foot | Totale |
|---|---|---|---|---|
| Sidebar | 28 + search 32 | FILL scroll | 56 | Content height |
| Inspector | 44 + rail 48×236 | FILL scroll (232) | 56 | Content height |
| Toolbar | — | 48×48 collapsed / 48×236 expanded | — | top-left Stage 16,16 |
| Dock collapsed | — | bar 34 | — | 56 |
| Dock expanded Ready | — | bar 34 + tabs 28 + waveform 64 + tabella 144 | — | 322 |
| Dock expanded Idle/Error | — | bar 34 + tabs 28 + waveform 64 + messaggio 44 | — | 222 |
| Dialog | 56 | Slot FILL (max 640 totale) | 60 | 176 / 332 |
| Command palette | search 32 | Results 144 scroll | hints 20 | 228 |

`Content` della schermata è sempre `FILL`: 842 con dock 56, 676 con dock 222, 576 con dock 322. Le varianti non impostano l'altezza a mano.
