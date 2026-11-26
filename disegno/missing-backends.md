# missing-backends — Fragment / Shape Editor

Nessuna di queste funzioni è simulata in modo silenzioso: ogni punto è marcato nell'interfaccia.

| Funzione | Cosa manca | Impatto UI | Fallback nel design |
|---|---|---|---|
| Persistenza progetti | nessun backend/storage schema | Library Full/Empty/Loading | localStorage/IndexedDB lato client (da implementare in PHASE 7) |
| Export file | conversione canvas → PNG/SVG/WebM | Overlay/Export | dialog completo; il pulsante resta attivo, l'esito è flagged come mock finché non esiste il render |
| Input audio | decodifica e analisi (già presente in `src/lib/audio.ts`) | Editor → tab Audio | il motore esiste lato client; nessuna API esterna necessaria |
| Thumbnail progetto | generazione immagine dal canvas | ProjectCard | MiniGrid statico con il look del progetto |
| Account | non previsto (non-goal) | Settings → Account | "Local only — no account" |
| Undo persistente | cronologia oltre la sessione | toast Undo | undo in-memory 5 s |
