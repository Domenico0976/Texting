# 00-global — regole globali

## 1. Purpose
Regole che valgono su ogni schermata: shell, stati, feedback, tastiera, accessibilità.

## 2. What it shows — shell
- Rail icone 56px (Editor, Library, Settings in alto; help in basso), sempre visibile.
- Header 44px nel main: breadcrumb progetto a sinistra, mode switch `Design | Animate`, azioni a destra (undo, redo, command palette).
- Editor: sidebar 264 (layers) + canvas + inspector 296 con rail verticale 48; la toolbar verticale 48 sta in alto a sinistra del canvas.
- Canvas content: default ink #202020, paper #E8E5E8, empty cell #FFFFFF, line #2C2C2C; è contenuto del progetto, non token UI.
- Animate: sidebar Scenes/Layers, canvas con ghost, inspector Motion, `TimelineDock` 322 in basso (al posto dell'AudioDock).
- Library e Settings: rail + main (niente sidebar, niente inspector).
- Superfici: `background` (app) · `card` (pannelli) · `popover` (flottanti) · `canvas-backdrop` (canvas).

## 3. Data
- Progetto: `{ id, name, updatedAt, thumbnail, grid{cols,rows}, glyph, look{ink,paper,grain}, audio{cells[],preset}, dirty }`.
- Preferenze: `{ theme, reducedMotion, audioInput, units, shortcuts }` (locale).
- Mancante: nome progetto → "Untitled grid"; thumbnail → placeholder MiniGrid; data → "edited just now".

## 4. States
- **Full:** dati presenti.
- **Empty:** nessun progetto o nessun glifo — spiega il passo successivo con una CTA.
- **Loading:** skeleton `secondary` + etichetta "Loading …".
- **Error:** toast con causa + retry; nessun dialog bloccante.
- **Partial:** inspector mostra solo i controlli pertinenti alla selezione; "Advanced" collassato.

## 5. Actions
- Globale: ⌘K palette, ⌘S save, ⌘Z undo, ⇧⌘Z redo, ⇧? shortcut sheet.
- Editor: B brush, E erase, V select, spazio pan, 1–9 brush size.
- Ogni azione distruttiva ha undo via toast (5 s).

## 6. UX Rules
- Un solo indicatore attivo per slot (nav attiva = fill accent + label foreground; niente doppio highlight).
- Il canvas è l'unico elemento colorato: il chrome resta neutro.
- Nessun controllo si nasconde: si raggruppa (tabs) e si collassa (Advanced).
- L'audio è un **dock inferiore persistente** (collassabile), mai una scheda: collapsed 56px, expanded 322px, e il contenuto sopra si ridimensiona (842/576/676).
- In Animate l'AudioDock è sostituito dal **TimelineDock** 322: scene strip, tools, ruler, tracce, clip, playhead; l'audio si carica dalla barra della timeline.
- Testo mai sopra `selection`; usare `selection-solid` + `selection-foreground`.
- Bordi `border` mai come unico indicatore: usare `input` o `ring`.

## 7. Perception & affordance
- Rail: icone riconoscibili (lucide), tooltip col nome, stato attivo pieno.
- Inspector: titoli di sezione in Label 11 uppercase; righe label/valore allineate; slider con valore numerico sempre visibile.
- Canvas: hover sul bordo cella, flash al paint, outline viola 1.5px sulla selezione.
- Menu contestuale: si apre sul puntatore, si chiude con Esc o click fuori, voci con shortcut a destra.

## 8. Flow & feedback
- Trigger → feedback immediato (< 100 ms): hover, press, paint flash.
- Transienti: spinner solo per operazioni > 400 ms.
- Successo: toast 3 s, non bloccante. Errore: toast con azione "Retry".
- Navigazione: rail conserva lo stato del progetto aperto; tornare da Library riapre l'ultimo editor.

## 9. Pannelli fluttuanti e footer sticky

**Footer sticky.** Il pannello reactivity è una colonna: header fisso, corpo che scorre, footer
**fuori dallo scroll**. Se il pannello non entra nella pagina, il corpo scorre e il footer resta
ancorato al bordo inferiore del pannello (44 px, invariato). Mai dentro il contenitore scrollabile:
un footer che scorre via lascia l'utente senza "enabled" e "reset".

- Struttura: `header → divider → Content (scroll) → footer` come fratelli, non annidati.
- Il corpo scrollabile ha il fade di 12 px sul bordo inferiore quando c'è contenuto oltre.
- Con pannello ridimensionato, il footer resta a 44 px: si accorcia il corpo, non il footer.

**Pannelli fluttuanti: resizable, non agganciabili.**

| Regola | Valore |
|---|---|
| Ridimensionamento | maniglia all'angolo in basso a destra + sui bordi; min 320×360, max = viewport − 24 |
| Snap ai bordi | **vietato**: nessuna zona di aggancio, nessun auto-dock, nessun magnete |
| Posizione | libera nel canvas; il pannello ricorda l'ultima posizione per progetto |
| Ordine di sovrapposizione | **la timeline sta sopra i pannelli** per default |
| Click su un pannello | il pannello **sale sopra la timeline** e diventa interagibile; la timeline resta visibile ai bordi |
| Click sul canvas o su un altro pannello | il pannello torna sotto la timeline |
| Trascinamento | il pannello in drag sale sopra tutto, e resta sopra a fine drag |

- La timeline non si sposta: cambia solo lo z-index. Nessun "collasso" automatico della timeline.
- Un solo pannello "sopra" alla volta: alzare il secondo abbassa il primo (una pila, non un mucchio).
- Il pannello sopra riceve focus tastiera; Esc non lo chiude (chiude solo i popover interni).
- Il resize non deve mai coprire il footer: il corpo si accorcia, il footer resta.

**Perché.** La timeline è il contesto (tempo, tracce) e deve restare leggibile; il pannello è lo
strumento che si sta usando. Portare lo strumento davanti al contesto solo quando lo si tocca evita che
il contesto scompaia del tutto (il difetto delle dock che coprono il lavoro).
