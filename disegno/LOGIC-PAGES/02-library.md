# 02-library — Library

## 1. Purpose
Ritrovare un progetto salvato, duplicarlo o eliminarlo, o crearne uno nuovo.

## 2. What it shows
1. Rail icone (Library attivo).
2. Titolo "Library" + CTA "New project".
3. Search "Search projects" con scorciatoia ⌘K.
4. Griglia di ProjectCard 4×2 (thumbnail, nome, meta "5×5 · Night · edited 2m ago", azioni).
5. Empty state centrato con icona, titolo, spiegazione e CTA.
6. Loading: etichetta + righe skeleton.

## 3. Data
- Progetti da storage locale (`missing-backends.md` finché non esiste persistenza).
- Mancante: thumbnail → MiniGrid placeholder; data → "edited just now"; nome → "Untitled grid".

## 4. States
- **Full:** 8 card, hover sulla card evidenzia bordo `input` e mostra azioni.
- **Empty:** nessun progetto → "No projects yet" + "Create a project".
- **Loading:** skeleton, nessuna azione attiva.
- **Error:** storage non disponibile → banner + "Retry"; nessun dato inventato.

## 5. Actions
- Aprire un progetto (click card).
- Duplicare / rinominare / eliminare dal menu della card (eliminazione con conferma + undo).
- Cercare (filtro immediato su nome).
- Creare nuovo progetto.

## 6. UX Rules
- La ricerca filtra al primo carattere; nessun bottone "cerca".
- L'eliminazione non usa il rosso come unico segnale: icona + label + posizione in fondo al menu.
- Le card hanno la stessa altezza; la griglia non cambia colonne sotto 1280.

## 7. Perception & affordance
- Scopo percepito: "qui ci sono i miei lavori".
- Card interamente cliccabile; il menu azioni è separato dal click principale.
- Empty state spiega cosa manca e come risolverlo.

## 8. Flow & feedback
- Open → transizione diretta all'editor con il progetto caricato.
- Duplicate → nuova card in testa con toast "Duplicated" + undo.
- Delete → card rimossa con animazione 150 ms + toast undo 5 s.
