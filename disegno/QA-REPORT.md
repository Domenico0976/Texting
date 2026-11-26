# QA-REPORT — Fragment / Shape Editor UI

Data: 2026-11-25 · file Figma `gmorvNrypDXH59DHWP5chr` · dsVersion 0.2.0

## G0–G23 (stato)

| Gate | Esito | Evidenza / nota |
|---|---|---|
| G4 paint binding | PASS | tutti i fill/stroke dei componenti sono variabili `ds/*`; il colore del progetto è contenuto (fuori scope) |
| G8 asset validation | PASS | 37 icone verificate prima della creazione, registrate in `icons/manifest.json` |
| G9 map | PASS | `CANVAS-MAP.md` elenca 22 master + 4 screen set |
| G11 contrast | PASS | `CONTRAST-MATRIX.md`: 0 FAIL testuali; `border` dichiarato decorativo |
| G12 auto-layout | PASS con EXC | tutte le sezioni, celle, righe, schermate sono auto-layout; overlay canvas (toolbar, zoom, hint, menu) assoluti e registrati |
| G13 harness | PASS | `HARNESS.md` compilato; EXC-1/EXC-2 registrate |
| G14 board | PASS con EXC-2 | un board per pagina, sezioni figlie, ordine = navigazione; GRID sostituito da stack verticale |
| G15 screens as components | PASS | Screen/Editor, Library, Settings, Overlay sono COMPONENT_SET; i flow usano istanze |
| G16 governance | PASS | `DS-CHANGELOG.md` 0.2.0 con classi C1/C3/C4 |
| G17 icons | PASS | `Section/ICONS` in 01 Foundations, `Icon/<name>` con Size 16/20, nessun asse colore |
| G18 catalog | PASS | `disegno/catalog/design-systems.md` + `templates.md` generati; shadcn/ui scelto dall'utente |
| G19 session boot | PASS | `TASK.md`, modalità NEW dichiarata, reference inventariate |
| G20 project truth | PASS | BRIEF §2 MVP/KPI + 5 flow; ogni schermata deriva da un flow |
| G21 skill routing | PASS | set attivo: disegno (object) + frontend-design (stage 7, non caricata); registrato in `SKILLS.md` |
| G22 code firewall | PASS | nessun file prodotto scritto; solo output Figma + `disegno/` |
| G23 acceptance | PENDING | decisione utente al termine della review |

## Test visivi
- Editor Full: rail, sidebar con albero, header, canvas 7×7, toolbar, zoom, inspector su Look — verificato via screenshot.
- Editor Empty: presente (hint "Nothing drawn yet").
- Library Full/Empty/Loading: presenti.
- Settings: presente.
- Overlay Export/Command palette: presenti.
- Light: token + specimen in Foundations (EXC-1).

## Difetti noti / da rifinire
Vedi `AUDIT-2026-11-25.md` §6 per la lista aggiornata con gravità. In sintesi: B1 schermate light, B2 Dialog/Palette come master, B3 flussi Griglia e Libreria, B4 Focus residui, B5/B6 cosmetici.
Chiusi in audit: label menu contestuali, vista celle nell'albero, switch 32×24, binding spacing/radius, Button Focus, Input Error, stati vuoti promossi a master, variante Editor/Audio + flusso.

## Azioni prima di PHASE 7
- Decidere se EXC-1 va chiusa con un piano Figma paid (schermate light complete).
- Accettazione progetto (G23) e `ACCEPTANCE.md`.
