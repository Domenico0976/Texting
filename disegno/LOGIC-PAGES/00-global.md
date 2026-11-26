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
