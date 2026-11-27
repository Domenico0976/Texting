# Handoff — Reactivity panel (Figma LAB + dev bench)

Data: 2026-11-27 · progetto `C:\Users\Utente\Desktop\PROVA FORGE\Shape Editor`

## Primary sources

Leggere questi, non la cronologia della sessione:

| Cosa | Dove |
|---|---|
| Studio del pannello (autorità) | `disegno/LAB/reactivity-panel.md` (§3.3 range firmato, §3.4 add/replace/hide) |
| Stato fasi e prossimo passo | `disegno/TASK.md` |
| Ticket dev chiuso con esito | `.omo/wayfinder/tickets/06-reactivity-dev-panel.md` |
| Ticket onset (T11, chiuso) | `.omo/wayfinder/tickets/11-pulse-onsets.md` |
| Ticket scatter (T12, chiuso) | `.omo/wayfinder/tickets/12-scatter-prng.md` |
| Ticket auto-gain (T13, chiuso) | `.omo/wayfinder/tickets/13-autogain-range.md` |
| Ticket curve (T14, chiuso) | `.omo/wayfinder/tickets/14-curve-monotone.md` |
| Ticket latenza + meter (T15, chiuso) | `.omo/wayfinder/tickets/15-glide-default.md` |
| Ticket soglia doppia (T16, chiuso) | `.omo/wayfinder/tickets/16-double-gate.md` |
| Ticket soglia Pulse (T17, chiuso) | `.omo/wayfinder/tickets/17-pulse-threshold.md` |
| Ticket Pulse 2 canali (T18, chiuso) | `.omo/wayfinder/tickets/18-pulse-two-channels.md` |
| Contratto kinetic grid | `controls/Kinetic-opt.json` |
| Contratto target/modulabili | `controls/React-to-opt.json` (`audioCeiling` ancora da sostituire con `range`) |
| Mappa componenti Figma | `disegno/CANVAS-MAP.md` |
| Changelog design system | `disegno/DS-CHANGELOG.md` (0.15.0 dock, 0.16.0 pannello) |
| Motore audio (codice) | `src/lib/audio.ts` |
| Shader kinetic (codice) | `src/lib/shader.ts` |
| Bench dev | `src/components/reactivity-dev-panel.tsx` |

Figma: file "Texting" (`gmorvNrypDXH59DHWP5chr`), 3 pagine, pagina 02 = 62 set · 315 varianti.

## Stato attuale

### Chiuso in questa tornata

- **T06 dev panel**: `reactivity-dev-panel.tsx` (316×881, dock a destra) con core `Band → Response → Range → Force`, sezione preset (add/replace/hide), Roam, live readout. Montato in `src/main.tsx` accanto a `CellAudioPanel`.
- **Range firmato**: `size = silent + (peak − silent)·signal`, `amount = clamp((1 − size)/0.45, −1, 1)`. `1` = riferimento → piatto; peak più basso = più profondo. La normalizzazione sull'escursione (prima versione) annullava il range: non reintrodurla.
- **Livello globale di potenza** (`GlobalConfig`, default depth .5 / scatter .4 / speed .45 / response .5): Depth è il tetto sull'amount, Scatter il tetto sul raggio (`0.9 + 2.1·s` celle), Speed va 0.3×–1.6×, Response è un glide (tau ≈ 0.4·r² s). Force è curvata `x^1.7`. Il raggio si calcola in JS (`radiusCells`) e arriva allo shader come uniform `radiusCells`: non rimettere la formula nello shader.
- **Fase integrata**: `roamPhase`/`shapePhase` si accumulano in `main.tsx` (`+= dt·0.8·rate`). Non tornare a `time × speed` nello shader: era la causa del salto quando la banda cambiava o si metteva in pausa. Il ritorno a riposo quando `isPlaying` è falso usa un glide minimo di 0.35 s.
- **Silenzio = zero**: `amount = (silent − size)/0.45`, non `(1 − size)/0.45`. Con un silent diverso da 1 la griglia restava deformata a segnale zero (bug segnalato con `Silent 0.70`). Lo zero è il silent, la corsa è il depth.
- **Pausa = silenzio**: con `isPlaying` falso il segnale è 0, non l'ultimo valore. BPM e Snap & Hold tenevano la fase/lo snap e la griglia restava mossa.
- **Sweep di regressione**: 10 preset × 4 range, `depth/scatter/speed 1`, `glide 0.05`, in pausa → amount 0.00 ovunque, diff fra fotogrammi 1.70 (grana della carta). In play diff 14–23. Baseline "fermo" = 1.7: sopra 2 c'è movimento reale.
- **`shapeAmt`** ora legge lo stesso amount (prima usava il segnale grezzo, il range non filtrava Shape).
- **Shader**: `level = clamp(audioAmt, -1, 1)`, raggio su `abs(level)`.
- **`CellAudioPanel`** allineato: Min/Max scale scrivono anche `range`.
- **Figma rail**: 10 voci in tutti i 5 pannelli LAB (`dB, Pulse, Bass, Spectral, Stems, MIDI, BPM, Snap & Hold, Harmony, Automation`).
- Verdi: `npm run typecheck`, `npm test` (30/30), `npm run build`. 60 fps con audio attivo.

### Evidenza numerica (dal bench, misurata via CDP)

| Config | shaped | size | amount |
|---|---|---|---|
| peak 1.00 | 0.59 | 1.00 | 0.00 |
| peak 0.45 | 0.54 | 0.70 | 0.66 → **0.39** col globale default |
| peak 0.90 | 0.60 | 0.94 | 0.13 |
| force 0 | 0.53 | 0.71 | 0.00 |
| threshold 0.95 | 0.00 | 1.00 | 0.00 |
| Pulse exp | 0.97 | 0.47 | 1.00 |
| Cells 2·5 | 0.87 | 0.48 | 1.00 |

Globale: default radius 1.51 celle; tutto al massimo (depth 1, scatter 1, speed 1) amount 0.72 e radius 2.78 (tetto 3.0); `depth 0` → 0; `response 0 → 1` porta la sd dell'amount da 0.017 a 0.006.

Screenshot: `%TEMP%\opencode\t06-flat.png`, `t06-shrink.png`, `t06-shallow.png`, `t06-cells.png`, `t06-bench.png`.

## Gap aperti

1. **React To / target picker — rimandato per scelta (2026-11-27).** Non toccato in questa tornata: resta `controls/React-to-opt.json` con `audioCeiling` da sostituire con `range`, la regola di unicità del target nel picker, e il collegamento `effect` (Noise) → pannello affiancato. Non blocca: pannello e dev usano `reactTo` del preset.
2. **Preset non cablati**: solo **MIDI**, ora `hidden: true` nel modello (sparisce dal select del dev, resta come variante Figma e come riga nel codice): nessun device MIDI gestito, da riprendere in futuro. Stems (band slice come proxy), Harmony (tonal share, nessuna pitch detection) e Automation (pulso libero 0.5 Hz) sono cablati. Restano non cablati i parametri interni: Hold/Retrigger (Pulse), Bands (Spectral), Gain (Stems), CC/Smoothing (MIDI), Interval (Snap & Hold), Scale/Confidence (Harmony).
3. **Stati reactivity**: fatti come set separato (`Organism/ReactivityState` + `Molecule/ReactivityNotice`) perché Figma rifiuta varianti con proprietà in più; nel dev sono `NoAudio / Error / Live` con banner e corpo a 0.35.
4. **Canvas LAB**: le guide sono verticali fra le due maniglie; devono essere tangenti punto→maniglia. Hover completo (punto, handle, chip).
5. **4 set legacy fuori board**: `Molecule/Splitter`, `RangePreview`, `RangeSlider`, `Organism/SourcePanel` (x≈24). Da decidere se spostarli.
6. **Altezze LAB**: `Pulse` 1314 e `Audio` 1009 contro il max 520 previsto. Non deciso se canvas opzionali o corpo scrollabile.

## Ultima tornata — Pulse onset: finestra non smussata + entrata (T11, 2026-11-27)

Dettaglio completo e numeri: `.omo/wayfinder/tickets/11-pulse-onsets.md`.

- **Sintomo**: su `ambient_electronic-dreamy-girl-198623.mp3` il `level` di Pulse restava 0.00 nei primi secondi.
- **Causa 1**: il detector leggeva l'analyser a `smoothingTimeConstant 0.8` → flux max **0.0147** contro
  **0.0706** non smussato; la soglia assoluta 0.012 passava 2 volte in 20 s. Su `beat.wav` funzionava
  perché i kick sono forti: il caso quieto non era coperto.
- **Causa 2**: l'intro non ha attacchi (silenzio fino a 0.36 s, fade-in fino a 0.80 s, primo tasto a 3.1 s):
  nessun detector di soli attacchi può scattare.
- **Causa 3**: soglia assoluta su un valore in dB → dipende dal volume del brano.
- **Fix**: seconda `AnalyserNode` con smoothing 0 (`this.onset`) solo per gli onset; la prima resta a 0.8 per
  `level`/`low`/`high`/`bandLevel`. Detector estratto puro (`createOnsetState`, `detectOnset`, `DEFAULT_ONSET`)
  con due canali: **attack** = flux relativo `flux/(energy+0.02)` contro `0.2 / mean+1σ / mean×1.35`, e
  **entrance** = energia sopra un follower lento (`τ 0.45 s`, `rise > 0.03 + 0.25·base`) con ri-armo al
  ritorno. Debounce 70 ms e gate `level > 0.02` invariati.
- **Misurato nel dev**: ambient → hit a 0.31 e 0.54 s (entrata del pad), poi 3.3 · 6.1 · 6.3 · 6.9 · 8.8 s;
  22 hit/20 s sui frame grezzi (prima 2). `beat.wav` → 22–27 hit/12 s (kick ogni 0.5 s). amount ambient
  max 0.28 (prima 0). 58–61 fps.
- **Test**: +5 su `detectOnset` e `snapHoldValue` (silenzio, banda costante, debounce, fade-in, intro quieta
  vs ritornello forte, rumore, hold/release). Totale **31/31**, typecheck e build verdi.
- **Snap & Hold (seconda metà di T11)**: era **1.0 fisso** perché `snapArmed` non si abbassava mai.
  Ora `SNAP_HOLD_MS = 250` + `snapHoldValue(armed, held, elapsed)` (puro): latcha sul trigger e rilascia
  dopo 250 ms. Misurato: ambient duty 0.25 (prima 1.00 costante), beat duty 1.00 (trigger più fitti del hold),
  amount ambient 0.29 max. Il dev mostra `Hold · 250 ms · fixed`; `Interval` resta non cablato.
- **Auto-gain (T13)**: due guasti, due fix. (a) `hi` seguiva il valore anche verso il basso → il primo
  colpo forte saturava l'uscita a 1.0 (raw 0.78/0.38/0.69 → shaped 1.00/1.00/1.00). (b) anche con
  l'espansione immediata, `lo` inseguiva il *valore* e chiudeva la finestra: su un mix denso e forte
  (`level` sd 0.017) l'`amount` aveva sd **0.007** → shape immobile. Ora il clamp è una **finestra di
  2.5 s** sui picchi locali: `lo/hi = min/max` della finestra, espansione immediata, rilascio 80 ms,
  `span = max(0.02, range·1.15)` (picco a 0.87, mai 1) e **deadband 0.006** sotto la quale non si
  amplifica il dither. Misurato su `dense.wav`: shaped sd 0.025 → **0.294**, amount sd 0.007 → **0.083**;
  ambient dB 0.048, Bass 0.108, beat Pulse 0.047; 60 fps.
- **Curve (T14)**: `spring` era `1 − e^(−5s)·cos(4.5s)`, che satura a **1.0 già a s = 0.35**. Con Pulse
  su un sustain (valore 0.60) il segnale diventava costante 1 → l'auto-gain lo azzerava → *waiting for
  signal* nel pieno del brano. Ora `spring(s) = s + sin(πs)·s·(1−s)`: monotona, elastica, pendenza 1 in 1.
  Test nuovo `no curve saturates before its input does` (f(0)=0, f(1)=1, monotona, `f(0.9) < 0.999`,
  corsa 0.85→0.95 > 0.02): fallisce sulla vecchia formula. Misurato dopo: ambient t 38–46 s shaped sd
  **0.197**, status **live 84/84**; intro e beat idem.
- **Latenza (T15)**: il ritardo era quasi tutto nel default del Glide. Misurato con la catena reale
  (`audio.ts` in Node, step 0→0.8): dB con `response 0.5` → **250 ms al 90%**, con `response 0` → 17 ms,
  con `0.2` → **50 ms**. `glide` a 0.5 ha τ 104 ms = 216 dei 250 ms; analyzer smoothing + follower ~33 ms.
  Ora `DEFAULT_GLOBAL.response = 0.2`. Il controllo resta.
- **Meter nuovi nel dev**: `curve` (post-curva, pre-auto-gain: qui si vede un plateau) e `range`
  (`hi − lo` della finestra auto-gain: **0 = segnale costante, niente da normalizzare** = la causa esatta
  di "waiting for signal"). Sono nella card Live. Letto a runtime: `level 0.61 · curve 0.79 · shaped 0.57 ·
  range 0.088 · size 0.74 · amount 0.16`.
- **Release dell'env legato all'energia: non fatto, per misura.** Rigioando i 64 s catturati nel detector
  vero, l'inviluppo non si appiattisce mai (col debounce 70 ms il minimo tra due hit è `exp(−70/140) = 0.61`):
  env sd 0.240 vs 0.268 col release legato all'energia, +10/15% per un cambio di carattere. Il problema del
  sustain (0 hit) era un altro, già chiuso dal pavimento di banda (T11).
- **Soglia doppia (T16)**: `shapeCellSignal` applicava già soglia e step, e il frame loop le applicava
  di nuovo. `(v−t)/(1−t)` non è idempotente: con t 0.15, raw 0.30 → 0.25 con una passata, **0.12** con due;
  raw 0.19 → 0.07 → **0.00** (il meter `curve` a zero con `level` 0.19, misurato). Stesso difetto sugli step
  (1/7 poi 1/8). Ora soglia/follower/gamma/step vivono solo in `shapeCellSignal`. Effetto: amount sd
  `beat` 0.039 → **0.068**, ambient 0.054 → 0.057 (mean 0.142 → **0.162**), il tratto a raw 0.19 passa da
  `curve 0` a 0.07–0.20. Test nuovo `the threshold is applied once`.
- **Soglia Pulse/Kick 0.15 → 0.05 (T17)**: il pavimento di banda di un sustain sta a ~0.19; con il gate
  a 0.15 la curva lo mappava a 0.07 (un decimo di scala) e il sustain non si vedeva. Misurato su frame con
  raw 0.14–0.26: `curve` mean 0.120 → **0.246**, `amount` mean 0.016 → **0.034**. Il tratto forte (raw 0.61)
  è invariato: lì il gate non mordeva. La soglia resta un controllo del pannello.
- **Pulse a due canali (T18)**: `pulse-attack` = inviluppo di onset, `pulse-sustain` = energia della banda;
  ognuno ha il **proprio auto-gain**, poi `mixChannels` li combina con un **massimo pesato** (la media
  dimezzava i canali) prima della catena normale. Dev: slider `Attack 1.00` / `Sustain 0.70`.
  Misurato su raw 0.14–0.26: `curve` mean 0.246 → **0.509**, `amount` mean 0.034 → **0.117** (era 0.016 con
  un canale). Tratto forte 0.052 → **0.063**; `beat` 0.068 → 0.071. Test `the two Pulse channels mix as a
  weighted maximum` + `Pulse ships with two channels and the others do not` (39/39).
- **Preview nella card (0.21.0)**: `Molecule/ParamPlot` bare (la superficie è della card), card
  Curve/Response/Band/Snap ricomposte full-bleed (`Block/Head` + plot + `Block/Body`); auto-gain nel menu
  Global (riga con switch); `Section/Reactivity-Plots-LAB` eliminata perché promossa. Comportamenti dei
  pannelli (footer sticky, resizable senza snap, timeline sopra / pannello sopra al click) in
  `LOGIC-PAGES/00-global` §9. Mappa e changelog a 0.21.0.
- **Info tool e spec (0.22.0)**: `Molecule/ParamSpec` 16 (8 sezioni × Theme) apre dall'`Icon/info`
  nel titolo di 7 card; `Molecule/ResizeHandle` (24 hit) sui pannelli fluttuanti (`EffectPanel` +
  esempio in `Row/Molecule/ReactivitySpec`). Regola copy: la nota di card dice cosa fa il parametro, la
  spec dice cosa è la sezione e cosa non è cablato. Mappa e changelog a 0.22.0.
- **Regola nuova**: nessuna soglia assoluta sul flux. Il flux si giudica relativo all'energia della banda.
- **Scatter PRNG (T12)**: `Scatter` era solo il tetto del raggio; ora dà anche grana per cella. In `shader.ts`,
  `jit(k, salt) = 1 + scatter·(h − 0.5)` con `h = fract(sin((k + salt + seed·13.7)·12.9898)·43758.5453)`,
  sale diverso per colonne (`0.0`) e righe (`37.3`); `mapAxis` moltiplica `a` per il jitter.
  **Il riposo del warp è 0, non 1**: moltiplicare `a` non deforma a silenzio, scalare `(a−1)` sì (prima
  versione: MAD 16.8 in pausa). `Σw = n` resta esatto: cambia solo la distribuzione, non l'estensione.
  Misurato (MAD luminanza canvas, ambient): pausa 0.54 (= controllo 0.53), play level 1 → **21.1**,
  level 0.68/0.42 → 8.9/7.2, level 0 → 0.76. Uniform `U.scatter` da `glob.scatter` in `main.tsx`.
  Limite: la grana si legge come larghezze di colonna/riga irregolari (il warp è separabile), non come
  celle che respirano una per una. Per una grana più forte: jitter di `u` (dentro la cella) o sull'inchiostro.
- **Jitter di `u` (parte 2 di T12)**: `ij = floor(c)` resta l'identità della cella, `f0` è la coordinata
  interna, `f = f0 + wob·sin(π·f0)·jaws` con `jaws = scatter·|amount|·0.12`, poi `sdf()` e l'ombra leggono
  `c2 = ij + f`. Il seno azzera lo spostamento sui bordi: niente tear, `f` resta in [0,1].
  **0.12 è il massimo sicuro**: la scala locale è `1 + a·π·cos(πf)`; a 0.18 scende a 0.43 e i tratti
  sottili (cerchi, 0.3 px) si stirano sotto la soglia AA e **spariscono a tratti** (visto a schermo).
  A silenzio `|amount| = 0` → warp identico a prima (MAD 0.80 contro 0.79 di controllo).
- **Pulse sul sustain (terza parte di T11)**: a t 30–60 s sull'ambient la shape restava ferma perché la
  banda 40–250 è un sustain denso (energia **0.60** ma sd 0.023): un detector di soli transienti deve dare
  0. Ora `value('kick')` = **max(inviluppo di onset, energia della banda)**: il pavimento di banda tiene
  vivo il segnale, l'auto-gain (T13) ne normalizza la piccola escursione. Misurato: t 38–48 s level
  0.604 ± 0.036, shaped sd 0.201, amount sd 0.054 (prima 0.00); intro e batteria invariati (0.062 / 0.039).
- **Grana di stampa (parte 3 di T12)**: oltre alla geometria, due hash per cella sull'**inchiostro** —
  bordo `d - cellEdge·0.2·printGrain` (fino a ±0.1 cella: silhouette dentellata ai confini) e densità
  `ink·(1 + cellTone·0.6·printGrain)` (fino a ±30%). `printGrain = scatter·|amount|`, quindi a silenzio
  zero. Misurato: pausa MAD 0.80 = controllo, play level 0.7 con Peak 0.1/Force 1/Depth 1 → **21.38**
  fra scatter 0 e 1. Se il dentellato legge come danno, il bordo scende da `0.2` a `0.12` senza toccare altro.
- **Nota harness CDP**: il pannello dev è `pointerEvents: 'none'` finché `state !== 'Live'`. Va atteso il badge  `LIVE LIVE` prima di cliccare `Shape`/`enabled`, altrimenti la lettura resta a 0 e sembra un bug del motore.
  Chrome CDP va lanciato con `--disable-background-timer-throttling --disable-renderer-backgrounding`, se no
  rAF si ferma a 0 fps e nessuna analisi gira.

| Preset | Prima (smussato, T11) | Dopo (brano ambient `dreamy-girl-198623.mp3`) |
|---|---|---|
| Pulse | raw 0.00 → amount 0.00 | raw 0 → 0.88 → **amount 0–0.24** |
| Bass | 0.34 → 0.08 | 0.34 → shaped 0.48–0.63 → 0.15–0.19 |
| Spectral | 0.37 → 0.10 | 0.37 → shaped 0.67–0.82 |
| dB | 0.60 → 0.18 | **satura a 1.0** (livello quasi costante) |
| Snap & Hold | 0.36 → 0.13 | **1.0 fisso** (hold senza timeout) → ora 250 ms e rilascia |

- **Pulse (storico)**: banda detector 40–250 Hz, gate 0.02, debounce 70 ms. Le soglie assolute qui sotto sono
  state **sostituite** dal detector relativo di T11: non rimetterle.
- **Auto-gain**: `autoGain(state, value, dt)` in `audio.ts`, stato in `main.tsx`, toggle nella card Global (default on). Guardia `1.25×`, span minimo 0.12.
- **Limiti noti (aggiornati 2026-11-27, vedi sotto)**: Pulse risolto (T11), Snap & Hold ha il timeout (250 ms). Resta dB senza dinamica su questo brano: amplificare non la crea, servono auto-gain off + threshold o il crest factor.
- **Prossimi**: T08 chroma (nessun modello, usa l'FFT che c'è). Restano `Hold` di Snap come costante e
  la grana dello scatter come sola larghezza (T12 §limite noto).
- **Incidente mojibake**: riscrivere i sorgenti con `Set-Content -Encoding utf8` ha doppio-codificato 7 righe (`main.tsx`, `audio.ts`). Pulite. **Regola: non riscrivere file con PowerShell `Set-Content`; usare il tool `edit` o Node con `writeFileSync(..., 'utf8')`.** Scanner di controllo: grep `Ã.|Â.|â€|ï¿½` su `*.{ts,tsx,md,json,css}`.

## Preset non cablati: piano (2026-11-27)

Scelta presa: **il pannello resta audio-bound**. Un preset audio produce un inviluppo dal segnale; se la sua sorgente non esiste, lo dichiara (`wired: false`) e non inventa un moto. Automation non è un'analisi: vive nel trasporto.

Stato dopo il riporto: `Stems`, `Harmony`, `MIDI`, `Automation` sono `wired: false`; `MIDI` e `Automation` anche `hidden: true` (spariscono dal select del dev, restano come varianti Figma). Il pulso libero di Automation è stato rimosso: `value('automation')` = 0 finché non legge il trasporto.

| Ticket | Lavoro | Giorni | Sblocca |
|---|---|---|---|
| `07-preset-capabilities.md` | flag `source`/`requires` + `wired` calcolato, `not wired` derivato | 0.5 | fondamenta, chiude le liste a mano |
| `08-harmony-chroma.md` | chroma da FFT + 24 triadi + quantizzazione sui gradi + gate di confidence | 1-2 | Harmony audio-reactive lento |
| `09-automation-transport.md` | keyframe `{t, value, ease}` + evaluator su `currentTime` + `Edit curve` | 1 | Automation fuori dalla rail audio |
| `10-stems-separation.md` | ONNX in worker + envelope 100 Hz per stem + profili attack/release | 2-4 | Stems vero |

Ordine: 07 → 08 → 09 → 10. Il 08 è il più conveniente (nessun modello, usa l'FFT che c'è); il 10 è il più incerto sul peso.

Contratto da rispettare in tutti e quattro:
- `value(key)` risponde solo se la capability è presente.
- La separazione/chroma/acquisizione è **fuori** dal frame loop: si pre-calcola e si legge per indice di tempo.
- Nessun preset crea un secondo collegamento React To: React To resta la destinazione, il preset è l'analisi.

## Copy dei preset (fonte unica)

`src/lib/preset-copy.ts` → `PRESET_COPY`: per ognuno dei 10 preset `verb`, `badge`, `bandNote`, `hide[]`, `replace`, `kind`, `extra { title, badge, params, note }`, `wired`, `note`. Figma e dev leggono le stesse stringhe. `coreFor(id)` restituisce il core nell'ordine fisso dopo le nascoste. `preset-copy.test.ts` blocca verbi incoerenti, core riordinato, `replace` + `hide` sullo stesso slot, note su bande nascoste.

Nel dev: `Band` si spegne con badge `HIDDEN` se il preset la nasconde; `Response` mostra `HIDDEN` (Automation) o `REPLACED` (MIDI/BPM/Snap), con la nota del preset. Verificato a runtime: Automation → HIDDEN + "No band for this preset…", MIDI → REPLACED + "Whole-track fallback…".

## Comandi attivi

| Comando | Stato |
|---|---|
| `npm run dev -- --port 5177 --strictPort` | acceso in background (PID nel processo shell) |
| `http://localhost:5177/` | pagina del prototipo, pannello dev in alto a destra |
| Chrome CDP `http://localhost:9222` | profilo `%TEMP%\opencode\chrome-cdp4`, **con** `--disable-background-timer-throttling --disable-renderer-backgrounding --disable-backgrounding-occluded-windows`, se no rAF va a 0 fps |
| Helper CDP | `%TEMP%\opencode\bench.mjs`, `t06verify.mjs`, `pulse-capture.mjs` (spettro grezzo), `pulse-verify.mjs <mp3> <s> <out> [preset]` (legge la card Live), `beat.mjs` (genera `beat.wav`) |
| Verifica | `npm run typecheck` · `npm test` · `npm run build` |

Nota: le letture dei valori si fanno con l'audio caricato (`beat.wav`) e il target Shape o una cella selezionata, altrimenti `audioActive` è falso e l'amount resta 0.

## Prossimo ticket

1. **T07 — `Organism/ReactivityPanel` in Figma**: generato da schema (`core[]` + `sections[]{verb,id,controls[]}`), stati Rest / No audio / Error, rail 10 preset, canvas tangenti corrette. Prerequisito: conferma del verbo `replace` sui 5 pannelli LAB.
2. Poi: sostituire `audioCeiling` con `range` in `React-to-opt.json`.
3. Poi: pannello effetti affiancato per `kind: effect` (Noise).

Regola che non cambia: FIGMA LAB resta disegnato a mano, senza componenti, finché i pannelli non sono approvati.
