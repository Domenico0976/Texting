# 03-scenes-layers — Scene, livelli, ghost, transizioni

Stato: 2026-11-26 · proposta di modello per la sezione animazione. Figma: `Screen/Editor State=Animate` + `Organism/TimelineDock` (0.10.0). Il codice non è ancora toccato.

## 1. Vocabolario

| Termine | Significato | Non è |
|---|---|---|
| **Project** | Il file salvato: scene ordinate, audio, impostazioni globali. | Una scena |
| **Scene** | Un segmento del progetto con **griglia propria**, durata, loop e transizioni. Contiene un albero di livelli. | Un livello |
| **Layer** | Un elemento visivo dello stack della scena: un glyph, un colore, una griglia di celle. Ha visibilità, lock, ghost, clip. | Una scena |
| **Group** | Un contenitore di layer; non è un target audio, non ha ghost proprio. | Un layer |
| **Frame** | Il render della scena a un istante, composto dallo stack di layer. | Un layer |
| **Clip** | L'intervallo in cui un layer è attivo sulla timeline. | Il layer intero |
| **Keyframe** | Un valore di proprietà a un tempo (in/out, modulazione). | Un frame |
| **Modulator** | Un clip che mappa una sorgente audio su un target (scena/layer/parametro). | Un preset statico |
| **Transition** | La transizione tra due scene (Cut / Fade / Morph). | Un layer |
| **Ghost** | Onion skin di un layer inferiore o scelto, mostrato perché il movimento si legga. | Un duplicato esportato |

## 2. Gerarchia

```
Project
└─ Scene 1  (grid 5×5, 0:00–0:20, loop)
   ├─ Group "Molecules"
   │  ├─ Layer "Chladni"   ← selezionato, ghost = Color 3, opacity 100%
   │  └─ Layer "Color 3"   ← sorgente ghost
   └─ Scene grid 5×5
└─ Scene 2  (grid 9×7, 0:20–0:40, transition Fade 300ms)
└─ Scene 3  (grid 5×5, 0:40–1:00)
```

Regole:
- L'ordine dei layer è **bottom → top**; il top copre i precedenti. Il ghost mostra un layer sotto (o uno scelto) senza spostarlo nello stack.
- La griglia è **della scena**: tutti i layer della scena condividono columns/rows/corner/padding/breathe. Cambiare griglia rilancia il layout della scena; le celle fuori range vengono clampate (con avviso, non cancellate).
- Scene e layer hanno **id stabili** (`scene.1`, `scene.1.layer.chladni`), non indici. Le label sono display/localizzabili.
- Un gruppo non è un target di modulazione; i suoi figli sì.

## 3. Layer come frame

Il punto ambiguo del brief: "ogni livello crea un frame". Nel modello:
- Un layer è uno **stato visivo**; la scena è il render dello stack a un tempo.
- Un layer può essere usato come **frame** mettendo il suo clip in sequenza sulla timeline (flipbook) oppure sovrapponendolo con ghost/opacity.
- La modulazione audio anima proprietà (shape, celle, trasformazioni) **dentro** il frame/scena; non crea un layer nuovo a ogni tick.

Questo permette sia l'animazione a frame (layer in sequenza) sia l'animazione continua (layer sovrapposti + modulazione). Se il significato voluto è "un layer = un frame obbligatorio", il modello va corretto prima di costruire il codice.

## 4. Ghost

- Controllo per layer: `Ghost = Off | Below | Custom`.
  - **Below**: usa il primo layer visibile sotto; se non c'è, Off.
  - **Custom**: un layer scelto; se genera un ciclo, fallback Off con warning.
- Parametri: `opacity` (0–1, default 0.18), `offset` (x/y o direzione+px), `tint` (nessuno o `muted-foreground`), `blend` (Normal/Screen/Add), `frame` (per ghost di un frame precedente).
- Il ghost è un **render** del layer sorgente, non un layer interattivo: non riceve click, non entra nell'export come layer separato; è composto nel frame.
- Nella UI: badge `GHOST` nella riga del layer sorgente, sezione GHOST nell'Inspector, ghost visibile nel canvas. Nel mock: Color 3 è il ghost di Chladni, opacity 0.30, offset 44px.
- Il ghost non deve mai superare l'opacità del layer principale; se opacity > 0.6, mostrare un warning "ghost troppo forte".

## 5. Griglia per scena e transizioni

- Il tab **Grid** dell'Inspector modifica la griglia della **scena attiva**, non del layer. Il badge della scena nella sidebar mostra `5×5`.
- Due scene possono avere griglie diverse. La transizione standard è un **Fade dei frame renderizzati**: non distorce la griglia. L'opzione **Morph grid** è disponibile solo se il numero di celle è compatibile (stesse columns/rows); altrimenti è disabilitata con spiegazione.
- La transizione vive tra le scene: `Cut` (0ms), `Fade` (default 300ms), `Morph` (solo griglie compatibili). Durata 0–2000ms, snap 50ms.
- La transizione si sovrappone alla fine della scena A e all'inizio della B; il playhead nella zona di overlap mostra il mix.
- Loop: il progetto ha una region di loop (start/end); ogni scena può avere `Loops to start` per tornare all'inizio della scena invece che al loop globale.

## 6. Modulazione audio

### 6a. Modulator clip e pannello

- Un **modulator clip** vive su una traccia della timeline; ha:
  - `source`: dB / Harmony / Stems / MIDI / BPM / Snap & Hold / Automation / Noise.
  - `target`: path stabile `Scene 1 / Chladni / Handle X` (vedi target picker).
  - `sensitivity`, `range` (min/max), `envelope` (attack/release), `smoothing`.
  - `in/out` sulla timeline; può attraversare il confine di scena solo se il target esiste in entrambe (altrimenti il clip si spezza).
- **Pannello MODULATION accanto alla timeline** (280px): elenca gli elementi con i loro modulatori, raggruppati per layer. Più effetti sullo stesso elemento sono righe separate (`dB → Handle X`, `Stems → Scale`, `Noise → Effects`); ogni riga ha source, target, valore, e seleziona il clip corrispondente.
- Il contratto delle opzioni React-to è `controls/React-to-opt.json` **v2.1.0**: 3 L1 (shape/group/cell), 5 L2, 22 L3. Contiene solo ciò che si può modulare; `Transitions` non c'è più (è nella sezione Scenes), `Effects` è L2 sotto shape. Il flusso delle scene è `controls/Scenes-opt.json` v1.0.0: 3 L1 (scene/boundary/project), 9 L2, 30 L3.
- **Proprietà dei pannelli.** React-to = modulazione audio del singolo livello (shape/group/cell). Scenes = flusso delle scene (tempi, playback, display/export della griglia, contenuto, confini). La griglia non è mai un target audio: le shape e le celle si muovono, la griglia resta il disegno.
- **Unicità del target**: lo stesso path esatto può avere **un solo modulator**. L'add flow disabilita i target già usati per quell'elemento e mostra "Already modulated by dB"; sorgenti diverse su target diversi sono ammesse. È una regola di prodotto, non solo UI: due modulatori sullo stesso leaf produrrebbero un valore ambiguo.
- La calibrazione (Image 2 del brief) è il dettaglio del clip: pannello con Sensitivity, Value Range, Envelope, tab sorgente. Nel mock attuale è riassunta nell'Inspector; il popover dedicato è A3.

### 6b. Cell target — picker sul canvas

- Per le celle di una forma il target non si sceglie da una lista: la lista non permette di riconoscere la cella.
- Il target picker, quando il leaf è una cella, mostra uno **scope `Cell`** con azione **"Pick on canvas"**. Il click chiude il picker ed entra in **cell mode**: le celle della forma sono evidenziabili, il canvas mostra hover + selezione, una barra flottante mostra `Pick a cell · Chladni · 3·5` + `Esc`.
- Il click su una cella la seleziona; il path diventa `Scene 1 / Chladni / Cell 3·5 / Handle X`. Il target picker si riapre sulla colonna parametri, oppure il modulator si crea direttamente se il parametro era già scelto.
- La cell mode è **solo** per target di cella di una forma; griglia, layer e parametri non-cell usano il column browser. Non è una selezione generica del canvas.
- Accessibilità: ogni cella è un target ≥24 (cella ~44/70), hover e focus visibili; `Esc` annulla e riporta al picker; il path è annunciato.

### 6c. Noise map — campo che randomizza le celle

- **Non è una texture sopra la forma e non la distrugge.** È un **campo scalare** generato da preset + matematica (somma di impulsi direzionali con bandwidth, impulses, direction, aniso) e tagliato da due soglie (Less than / More than).
- Ogni **cella colorata** campiona il valore del proprio quadrante e lo traduce in variazione di `Scale`, `Offset`, `Opacity`, `Speed` (animazione). **La cella non cambia quadrante**: varia i propri parametri, non la propria posizione. Le celle paper non cambiano.
- Parametri del campo: **Preset** (Blobs, Stripes, Grain, Duotone, Composite), `Scale` (frequenza), `Detail` (numero impulsi), `Roughness` (soglia), `Distortion` (jitter direzione); avanzati `Direction`, `Aniso`, `Bandwidth`, `Impulses`, `Less than`, `More than`; output `Cell scale/offset/opacity/speed`; animazione `Speed`, `Seed`, loop.
- **Pannello affiancato a Sources**: il noise ha il suo pannello con i parametri sopra; ogni parametro modulabile ha uno slot di modulazione (sorgente, amount, easing attack/release/curva).
- **Regola del tetto**: il valore impostato nel pannello è il massimo; l'audio lo porta da 0 a quel valore e non oltre. È l'ecosistema che lega pannello noise, Sources e timeline.
- Il noise map è un modulator clip con source `Noise`, target `Effects` (dentro `Shape → Effects`); nel pannello è una riga come le altre, ma il target è l'insieme delle celle della forma, non un leaf singolo. La regola di unicità si applica al path `… / Effects / Noise`.
- UI: nel pannello `Noise → Effects`; nell'Inspector sezione **NOISE MAP** con Scope `All cells`, Loop `Proportional`, Seamless loop On, Responsive to grid On, Per-cell Off e preview 5×5; nel canvas un overlay dei valori su tutte le celle. Il clip sulla timeline ha un'icona noise.
- Il noise non è per-cella in v1 e non è disponibile per group/grid/cell/scene. Il loop resta proporzionale quando la griglia viene allungata in larghezza/altezza, è seamless e si ri-tila sulla griglia corrente.
- Il noise non è un layer e non crea celle: è un **trasformatore di parametri per cella** sul layer esistente.

## 6d. Scene preset (layer stack riutilizzabili)

- Un **Scene preset** è uno stack salvato di layer (con ghost/opacity/ordine) creato dai layer del progetto; si inserisce in una scena come **gruppo collegato**.
- La sezione **PRESETS** nella sidebar Animate elenca i preset (`Chladni ghost`, `Molecules stack`, `Color trio`) con il numero di layer; il `+` della sezione Scenes crea una scena da preset.
- Inserire un preset in una scena aggiunge un gruppo di layer; il preset è **linked** (modifiche propagate) con azione **Unlink** per renderlo locale. Più preset possono coesistere nella stessa scena.
- La griglia è della scena, non del preset; il preset può contenere ghost che riferiscono layer del preset o layer locali (no cicli).
- I layer del preset compaiono nella timeline come tracce/clip; la scena resta la sorgente di durata/transizioni.

## 7. Contratto dati (estratto)

```ts
interface Scene {
  id: string; name: string; durationMs: number; loopToStart: boolean;
  grid: { columns: number; rows: number; corner: number; padding: number; breathe: number };
  layers: Layer[]; presets: ScenePresetInstance[]; transitions: SceneTransition[];
}
interface Layer {
  id: string; name: string; kind: 'glyph' | 'cells' | 'color' | 'group';
  parentId?: string; order: number;
  visible: boolean; locked: boolean;
  ghost: { mode: 'off' | 'below' | 'custom'; sourceId?: string; opacity: number; offset: number; tint: boolean };
  clips: LayerClip[];
}
interface ScenePreset { id: string; name: string; layers: Layer[]; thumbnail: string; }
interface ScenePresetInstance { id: string; presetId: string; linked: boolean; }
interface LayerClip { id: string; layerId: string; startMs: number; endMs: number; }
interface SceneTransition { id: string; fromSceneId: string; toSceneId: string; kind: 'cut' | 'fade' | 'morph'; durationMs: number; }
interface ModulatorClip { id: string; targetId: string; source: ModSource; sensitivity: number; range: [number, number]; envelope: { attack: number; release: number }; startMs: number; endMs: number; }
interface CellTarget { layerId: string; x: number; y: number; }  // scelto sul canvas, non in lista
interface NoiseModulator extends ModulatorClip {
  kind: 'noise'; output: 'cellScale' | 'cellOffset' | 'cellRotation' | 'cellOpacity';
  scale: number; speed: number; octaves: number; contrast: number; seed: number;
}
```

## 8. Edge case

- Scena vuota: canvas nero con hint "Add a layer"; non è un errore.
- Layer cancellato usato da un ghost/modulator: il ghost passa a Off, il modulator a `Target unavailable`; il clip non viene cancellato in silenzio.
- Griglia cambiata: layer con celle fuori range → clamp + toast "3 cells moved"; undo.
- Due scene con griglie incompatibili: Morph disabilitato; Fade disponibile.
- Loop region più corta di una scena: il loop taglia al frame; warning.
- Nessun audio: i modulator clip sono disabilitati ma restano sulla timeline, in grigio.
- Performance: anteprime a 12fps durante lo scrub; render a piena qualità al play/export.
- Target duplicato: il secondo modulator sullo stesso path è bloccato; l'utente vede "Already modulated by …" e può scegliere un altro parametro o modificare l'esistente.
- Cella cancellata/ridimensionata: il target `Cell 3·5` diventa `Cell unavailable`; il modulator resta e chiede di ripickare; non si cancella.
- Noise map su un gruppo: non è ammesso; si applica a una forma/layer; il gruppo va espanso.
- Preset unlink: i layer diventano locali; le modifiche al preset non li toccano più; undo.
- Cell mode annullata con Esc: si torna al picker con il target precedente intatto.

## 9. Decisioni aperte (da confermare prima del codice)

1. **Layer = frame**: il modello consente layer in sequenza e layer sovrapposti; confermare che non serve un "frame layer" separato.
2. **Dove si gestiscono i layer**: nel mock la gestione completa è nel workspace **Animate**; il workspace **Design** resta la modifica delle celle del layer attivo. Confermare o portare l'albero dei layer anche nel Design.
3. **Target picker**: migrare a `Scene → Layer → Parametro`, con cell scope via canvas (A2). Confermare.
4. **Morph grid**: solo griglie compatibili o morph geometrico completo (più costoso)?
5. **Ghost default**: Below con opacity 0.18; il mock usa 0.30 per mostrare l'effetto. Confermare il default di prodotto.
6. **Noise map**: un solo noise per forma; target `Effects` unico; scope all-cells; loop proporzionale, seamless e responsive. Non per-cell e non su grid/group/cell/scene in v1.
7. **Scene preset**: linked di default o copia locale di default? Il mock usa linked; confermare.
8. **Unicità target**: un solo modulator per path esatto; confermare.
