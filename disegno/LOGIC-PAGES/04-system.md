# 04-system — Overlay (export, command palette)

## 1. Purpose
Completare un'azione senza perdere il contesto: esportare il lavoro, eseguire un comando, vedere le scorciatoie.

## 2. What it shows
- **Export dialog** (480px): titolo + chiusura, Format (PNG/SVG/WebM), Resolution, Include paper texture, Cancel / Export.
- **Command palette** (560px): input con focus, lista risultati con shortcut, hint di navigazione (↑↓ / ↵ / esc).
- Scrim `overlay` sopra la schermata corrente.

## 3. Data
- Export: formato, scala (0.5–3×), inclusione texture.
- Palette: comandi + parametri dell'inspector (es. "Set ink colour", "Load audio…").

## 4. States
- **Full:** risultati con gruppo "Parametri" e "Comandi".
- **Empty:** "No results for «xyz»" + suggerimento.
- **Loading:** non applicabile (locale).
- **Error export:** toast con causa e "Retry"; il dialog resta aperto.

## 5. Actions
- Esc / click sullo scrim → chiude.
- Invio → esegue la voce selezionata.
- Export → genera il file e mostra toast; nessun blocco dell'editor.

## 6. UX Rules
- Il pannello non supera mai l'80% dell'altezza; la lista scrolla.
- Il focus parte nell'input della palette e nel primo controllo utile del dialog.
- Le voci distruttive non compaiono nella palette senza conferma.

## 7. Perception & affordance
- Scrim al 40–60% segnala il blocco dell'interazione sottostante.
- Elevazione `dialog` distingue il pannello dal resto.

## 8. Flow & feedback
- Apertura < 120 ms con fade; chiusura con Esc o Invio.
- Dopo l'export: toast "Exported grid.png" con azione "Show file".
