# 02-target-picker — Selettore target a colonne

## 1. Perché esiste

La riga `REACT TO` del dock audio non è un menu di valori: è una **scelta di gerarchia**. L'utente deve vedere da dove viene il parametro (forma → cella → parametro, oppure griglia → sezione → parametro) senza ricostruirlo a memoria.

Il pattern è un **column browser** (Finder / `NSBrowser`): ogni colonna è un livello, le colonne antenate restano visibili, il livello attivo apre la colonna successiva. Non è un dropdown, non è un albero collassabile, non è un selettore di modalità.

## 2. Gerarchia del prodotto

| Livello | Ramo layer | Ramo griglia |
|---|---|---|
| L1 — Scene | `Scene 1`, `Scene 2`, `Scene 3` | `Scene 1` |
| L2 — Branch | layer/gruppi della scena: `Grid`, `Chladni`, `Color 3`, `Molecules`, `Ghost` | sezioni della griglia: `Layout`, `Ink & paper`, `Texture`, `Advanced` |
| L3 — Parametro (leaf) | `Handle X`, `Handle Y`, `Scale`, `Rotation`, `Opacity`, `Scatter` | `Columns`, `Rows`, `Corner radius`, `Cell padding`, `Breathe`, `Inner corners`, `Cycle glyphs` |

Il percorso è **spaziale** (colonne affiancate) e **testuale** (footer `Scene 1 / Chladni / Handle X`). La selezione finale è marcata da una spunta viola; l'antenato selezionato resta evidenziato. Il target memorizzato è l'**id stabile** del leaf, mai la label.

**Cell scope (solo target di cella).** Quando il target è una cella di una forma, L2 è il layer e L3 è il parametro; la cella è uno **scope** scelto sul canvas, non una colonna né una lista. Il picker mostra `Cell: — / Pick on canvas`; il click entra in cell mode, il click su una cella produce `Scene 1 / Chladni / Cell 3·5 / Handle X`. La lista di celle (`Cell 1·2`, `Cell 2·2`, …) è stata rimossa: non permette il riconoscimento spaziale. Per griglia/layer/parametri non-cell resta il column browser.

> Migrazione A2: il master `Organism/TargetPicker` in 0.10.0 mostra ancora il ramo legacy `Reference / Cell 3·5 / Handle X` come demo. Il contratto delle opzioni è ora `controls/React-to-opt.json` (5 L1 · 12 L2 · 18 L3); il picker deve derivarne L1/L2/L3, incluso il cell scope sul canvas. Lo stato `State=Animate cell` è già il primo esempio di cell mode.

## 3. Contratto dati (per il codice, PHASE 7)

```ts
type TargetKind = 'grid' | 'glyph' | 'cell' | 'section' | 'parameter';

interface TargetNode {
  id: string;            // stabile: 'grid.layout.columns', 'glyph.reference.cell.3-5.handle-x'
  kind: TargetKind;
  label: string;         // solo display, localizzabile
  icon?: IconName;       // 16px, opzionale sui leaf
  value?: string;        // valore corrente mostrato a destra (leaf)
  hasChildren: boolean;
}

interface TargetPath {
  levels: TargetNode[];  // [object, branch?, leaf]
  leaf: TargetNode | null;
}

interface TargetSource {
  objects(scene: Scene): TargetNode[];
  children(node: TargetNode, scene: Scene): TargetNode[];
  isLeaf(node: TargetNode): boolean;
  pathFor(targetId: string, scene: Scene): TargetPath;
  labelFor(targetId: string, scene: Scene): string;
}
```

Regole:
- `TargetSource` è l'unico punto che conosce il prodotto. Il `TargetPicker` non conosce "Grid" o "Handle X".
- Aggiungere una feature futura = aggiungere un `kind` e il caso in `children()`. Nessuna modifica al componente.
- Un leaf non ha figli. Un branch non è selezionabile come target audio.
- `pathFor()` ricostruisce le colonne all'apertura: il picker si apre già posizionato sul target corrente.
- `targetId` è salvato nel preset. Se un nodo sparisce (cella cancellata), il resolver restituisce `null` e la riga mostra `Target unavailable` con CTA "Choose another target"; non si cancella il preset in silenzio.

## 4. Componente `ColumnBrowser` (generico)

```ts
interface ColumnBrowserProps {
  columns: Array<{
    id: string;
    title: string;
    count?: number;
    items: TargetNode[];
    selectedId?: string;
    activeId?: string;     // riga col focus da tastiera
  }>;
  path: TargetNode[];
  footerHint?: string;
  onOpen(node: TargetNode): void;     // branch → apre la colonna successiva
  onSelect(node: TargetNode): void;   // leaf → commit + close
  onBack(depth: number): void;        // click su un antenato
  onClose(): void;
}
```

- Larghezza colonna **186**, area colonne **302**, header **36**, riga **30**, footer **40**, root **560×386**.
- Ogni colonna ha scroll indipendente (`overflow: auto`), header sticky.
- La colonna attiva è l'ultima; le precedenti restano leggibili ma non ricevono focus.
- Il footer è sempre visibile e mostra il path completo; se il path supera la larghezza, si tronca al centro (`Reference / … / Handle X`) e il testo completo è in `title`.
- La spunta è solo sul leaf selezionato. Il branch selezionato ha barra + tinta, non spunta.

## 5. `TargetPicker` (prodotto)

Apre dal click sulla cella `REACT TO` della riga preset. Sostituisce il valore della cella con il leaf scelto; il preset conserva `targetId`.

Stati:
| Stato | Comportamento |
|---|---|
| closed | la cella mostra il target corrente + chevron down |
| open | popover ancorato sopra la riga, focus sulla colonna del livello corrente |
| empty | nessun oggetto/cella: messaggio "No targets in this scene" + link "Pick a cell" |
| loading | lo scene resolver è in caricamento: skeleton a 3 righe nella prima colonna |
| error | scena non disponibile: messaggio + "Retry" |
| stale | target rimosso: cella `Target unavailable`, picker apre sul parent più vicino |

Apertura/chiusura:
- Click sulla cella, `Enter` o `Space` apre; `Esc`, click fuori o selezione di un leaf chiude.
- Il focus torna sempre alla cella `REACT TO` alla chiusura.
- Il picker non è modale: non blocca il canvas, non aggiunge scrim.

## 6. Tastiera

| Tasto | Azione |
|---|---|
| `↑` / `↓` | sposta il focus nella colonna attiva |
| `→` | apre il branch e porta il focus alla colonna successiva |
| `←` | torna alla colonna precedente, selezionando il parent |
| `Enter` | leaf → commit; branch → apre |
| `Home` / `End` | prima / ultima riga della colonna |
| `Esc` | chiude e ripristina il focus |
| digitare | (fase 2) filtro sulla colonna attiva |

## 7. Accessibilità

- Root: `role="dialog"`, `aria-label="Choose audio target"`.
- Ogni colonna: `role="listbox"`, `aria-labelledby` del proprio header; ogni riga `role="option"` con `aria-selected`; il focus logico è sulla riga attiva (`aria-activedescendant`).
- Il path è annunciato in una regione `aria-live="polite"` quando cambia la selezione.
- Target: riga 30×30, header 36, chiusura 28; nessun controllo sotto 24.
- La selezione non è affidata al solo colore: barra viola 2px + spunta + path testuale.
- Focus visibile: anello `ring` 2px sulla riga attiva; in Figma la riga selezionata è la rappresentazione statica.

## 8. Estensioni future (modularità)

1. **Nuovo oggetto** (es. una nuova scena o un layer di tipo `Text`): aggiungere un `kind` e il ramo in `children()` che restituisce i suoi layer/parametri. L1 mostra la scena, il resto è identico.
2. **Quarto livello** (es. `Scene → Group → Layer → Parametro`): il browser supporta N colonne; la larghezza cresce di 186 per colonna. Non superare 4 colonne sul viewport 1440: oltre, il picker si ancora a destra o si riduce a 3 colonne con breadcrumb.
3. **Nuove feature audio** (es. MIDI CC): un leaf in più nella colonna parametri; nessun cambio di layout.
4. **Ricerca**: input nella testata del picker, filtra l'albero e apre il primo match; non sostituisce le colonne.
5. **Multi-select**: non previsto ora; se arriva, il footer mostra `2 targets` e i leaf hanno checkbox, non spunta.

## 9. Master Figma

`Organism/TargetPicker` (02 Components → Masters/Containers)

| Variante | Contenuto target (A2) | Contenuto attuale 0.10.0 |
|---|---|---|
| `Context=Layer, Theme=Dark` | L1 `Scene 1` (selezionato), L2 `Chladni` (selezionato), L3 `Handle X` (spunta) | legacy: `Reference` / `Cell 3·5` / `Handle X` |
| `Context=Grid, Theme=Dark` | L1 `Scene 1`, L2 `Layout`, L3 `Columns` | `Grid` / `Layout` / `Columns` |
| stesse due in `Theme=Light` | paint da `ds/semantic-light` | idem |

- 560×386, radius 12, `popover` + `border`, ombra `Elevation/popover`.
- 3 colonne da 186, separatori 1px; header 36 (`muted`), riga 30; footer 40.
- Contenuto fisso per variante (limite del piano free: niente slot arbitrari). In codice il contenuto arriva dal resolver, non dal master.
- Uso: `Screen/Editor State=Target` (dark) e `Screen/Editor-Light State=Target` (light). Il trigger è la cella `REACT TO`, con `ring` viola e chevron up.
- **A2**: aggiornare le 4 varianti a `Scene → Layer/Grid → Parametro`, rinominare `Context=Cell` in `Context=Layer`, aggiornare L2 (layer) e path. La schermata `State=Target` e la light seguono il master.
