# BRIEF — Fragment (Shape Editor UI)

> Prodotto al termine di PHASE 2. Contratto con l'utente: nulla passa al design finché questo documento non copre l'80–90% del prodotto finito.

**Artifact home:** `disegno/tickets/shape-editor-ui/BRIEF.md`
**Blocking open items:** 0
**Canvas language:** en (tutta la UI e tutti i testi del canvas in inglese; il prodotto è già in inglese)

## 0. Interview log (rounds R1–R5)

| Round | Question | Answer (user's words) | Status | Blocking? |
|---|---|---|---|---|
| R1 Scope | Set minimo di schermate | "Editor + libreria + settings" | answered | yes |
| R1 Scope | MVP | Editor (canvas + inspector), libreria progetti, settings | answered | yes |
| R1 Scope | KPI | "Task success su 5 test utente" | answered | yes |
| R1 Scope | Task del test | cella audio-reattiva · look→export · griglia non quadrata · gestione libreria · disegna→modella→salva (5 selezionati) | answered | yes |
| R2 Source of truth | Piattaforma | Figma, bridge attivo, file "Texting" | answered | yes |
| R2 Source of truth | Conflitto tra fonti | reference (stile) + codice (comportamento reale dei controlli); il codice vince sui nomi/parametri, la reference vince sullo stile | answered | no |
| R3 Flows & states | Inspector | "Inspector a schede + selezione" | answered | yes |
| R4 Visual DNA | Accento | "Mono shadcn + selezione viola" | answered | yes |
| R4 Visual DNA | Tema default | "Dark default", light come mode | answered | yes |
| R5 Structure | Piano Figma | "Free (3 pagine)" → 01 Foundations / 02 Components / 03 UI | answered | yes |
| R5 Structure | File target | "Qui, in Texting" — REFERENCES resta su Page 1 come archivio | answered | yes |
| R5 Tools | Icon set | proposto in PHASE 3 (lucide, 24px, stroke 1.5) | open (non-blocking) | no |
| R4 Language | Lingua UI | en (assunzione loggata, prodotto già in inglese) | open (non-blocking) | no |

## 0.1 Canonical masters and section map

**Canonical masters section:** `02 Components` (page), blocco `Masters` — un solo posto per i master riutilizzabili.

**Section-to-ladder map (piano free, 3 pagine):**

| Page | Block | Ladder level | Contents |
|---|---|---|---|
| 01 Foundations | `Foundations/Color` | tokens | primitive + semantiche, light/dark mode |
| 01 Foundations | `Foundations/Type` | tokens | Inter, scala 11–20, pesi 400/500/600, line-height |
| 01 Foundations | `Foundations/Spacing` | tokens | scala 2/4/6/8/12/16/24/32 + radius 4/6/8/10/12/pill |
| 01 Foundations | `Foundations/Elevation` | tokens | popover/menu/dialog shadow, focus ring |
| 01 Foundations | `Foundations/Icons` | primitives | `Icon/<name>` COMPONENT_SET, size 16/20, nessun asse colore |
| 02 Components | `Masters/Controls` | atoms+molecules | Button, IconButton, Input, Select, Combobox, Slider, Switch, Checkbox, Radio, Segmented, Tabs, Badge, Kbd, Tooltip |
| 02 Components | `Masters/Navigation` | molecules+organisms | NavRailItem, NavItem, Breadcrumb, TabBar, TreeRow, CommandItem, ContextMenuItem |
| 02 Components | `Masters/Containers` | organisms | Panel, PanelSection, InspectorRow, PropertyGroup, Card, TableRow, EmptyState, Toast |
| 02 Components | `Masters/Overlays` | organisms | Popover, DropdownMenu, ContextMenu, Dialog, Sheet, CommandPalette |
| 02 Components | `Specs` | contracts | spec card per ogni master (does/receives/allows/states) |
| 03 UI | `Screens/Editor` | L4 screens | Editor-Full, Editor-Empty, Editor-Selection |
| 03 UI | `Screens/Library` | L4 | Library-Full, Library-Empty, Library-Loading |
| 03 UI | `Screens/Settings` | L4 | Settings-Full |
| 03 UI | `Screens/System` | L4 | Export dialog, audio drawer, shortcut sheet, error/offline, permission |
| 03 UI | `Flows` | flow | 5 processi, colonne sinistra→destra, istanze delle schermate |
| 03 UI | `Responsive` | studies | 1440 → 1280 → 1024 (rail compressa), con numeri |

**Source of truth (R2):** codice per comportamento/parametri (`controls/main.json`), reference per stile; conflitto → documentato in `BRIEF §12`.
**Icon set:** proposto in PHASE 3 — lucide (outline, 24px grid, stroke 1.5, ISC) come raccomandato; alternativa tabler / material-symbols. Mai misto.
**Auto-layout exceptions (closed list):** overlay flottanti ancorati al canvas (toolbar, zoom, menu contestuale) · badge count ancorati a un'icona · nodi decorativi del canvas 3D · crop fissi delle thumbnail. Tutto il resto è auto-layout.
**Contrast matrix:** da generare in PHASE 3, prima del primo atomo.
**Structure decision (R5):** default ladder approvato, tradotto in 3 pagine free.
**Visual DNA (R4):** `#0a0a0a bg · #171717 surface · #262626 border (dark: white/10) · #fafafa text · #a3a3a3 muted · #8b5cf6 selection · Inter · hairline denso, nessun gradiente decorativo` — confermato dall'utente: yes

## 1. Identity
- **Name:** Fragment (repo: Shape Editor / grid-shaper)
- **Type:** desktop creative tool — editor di griglie modulari 3D con reazione audio
- **One-line purpose:** disegnare un glifo su una griglia, modellarne forma e materiale, e far reagire una cella all'audio in tempo reale.

## 2. Goals & success criteria
- **MVP:** editor completo (canvas + inspector a schede + navigazione progetto), libreria progetti, settings. Con questi tre un utente crea, salva e ritrova un lavoro.
- **North-star KPI:** 5 test utente, ognuno esegue 5 task senza aiuto — target ≥ 4/5 task completati per utente.
- **UX track:** **Convention** — convenzioni degli editor professionali (Figma/Blender/After Effects): rail icone + pannello + canvas + inspector. Innovation ammessa solo dove il prodotto è unico (audio-per-cella).
- **Register:** funzionale, denso, scuro, tipografia piccola e precisa; nessuna decorazione, il canvas è l'unico elemento colorato.
- **Core-constraint block:** UI approvata = 3 schermate + overlay, componenti shadcn, light/dark. UX = 5 flow con stato pieno/vuoto. Obiettivo = task success. Ogni funzione che richiede backend (persistenza progetti, export file, input audio) va tracciata in `missing-backends.md` e non simulata silenziosamente.
- **Budgets (HS9):** bundle iniziale ≤ 450 KB gzip (three.js incluso) · thumbnail ≤ 80 KB · font ≤ 1 famiglia (Inter, 2 pesi, subset latin) · animazioni UI concorrenti ≤ 3 (il canvas 3D è contenuto, non motion di UI).
- **Harness:** `disegno/HARNESS.md` aperto con HA1–HA11 / HS1–HS9 a PENDING — yes
- **Goal 1:** un utente nuovo capisce in ≤ 10 s che il canvas è disegnabile e che l'inspector cambia con la selezione.
- **Success looks like:** nessun parametro è irraggiungibile; ogni pannello ha uno stato vuoto che spiega cosa fare.

## 3. Users & jobs-to-be-done
| User | Job to be done | Pain today |
|---|---|---|
| Designer generativo / motion | Creare un pattern modulare e portarlo fuori come immagine | 90 controlli in una lista piatta, nessuna gerarchia |
| Creative coder | Collegare un parametro audio a una cella e vederla reagire | Il pannello audio è un overlay debug con stato tecnico |
| Utente che ritorna | Ritrovare un lavoro salvato e continuarlo | Non esiste libreria: si riparte da zero |

## 4. Features
**Must-have**
- Canvas 3D con toolbar flottante (tool: toggle/draw/erase/select), zoom, griglia.
- Inspector a schede: **Look · Grid · Motion · Audio · Export**, con "Advanced" collassato e visibilità pilotata dalla selezione (cella vs griglia vs progetto).
- Navigazione: rail icone (Editor, Library, Settings) + pannello contestuale (layers/celle/preset).
- Menu contestuali: canvas (cella/area), layer, toolbar.
- Libreria: griglia progetti con thumbnail, ricerca, azioni (apri, duplica, rinomina, elimina).
- Settings: tema (dark/light/system), riduzione motion, input audio, scorciatoie, unità.
- Export dialog: formato (PNG/SVG/WebM), scala, sfondo.
- Command palette (⌘K) con tutti i comandi e i parametri cercabili.

**Nice-to-have**
- Preset di look salvabili, confronto prima/dopo, tour delle scorciatoie.

## 5. User flows (key paths)
1. **Disegna → modella → salva:** Library → Editor (empty) → tool draw → glifo → tab Grid/Look → nome progetto → Save → conferma.
2. **Cella audio-reattiva:** Editor → seleziona cella piena → tab Audio → carica file → preset → enabled → feedback di reazione → Save.
3. **Look → export:** Editor → tab Look → preset → invert → tab Export → formato/scala → Export → toast.
4. **Griglia non quadrata:** Editor → tab Grid → columns/rows → padding/corners → canvas aggiornato → Save.
5. **Gestione libreria:** Library → ricerca → apri / duplica / rinomina / elimina → undo toast.

## 6. Needed pages / screens (justify each)
| Screen | Purpose | Why needed | Full | Empty |
|---|---|---|---|---|
| Editor | disegnare e modellare | è il prodotto | ✓ (con selezione cella) | ✓ (griglia nuova, nessun glifo) |
| Library | ritrovare i lavori | flow 5 lo richiede | ✓ | ✓ (primo progetto) + loading |
| Settings | preferenze e accessibilità | flow trasversale | ✓ | — |
| Export dialog | portare fuori il risultato | flow 3 | ✓ | ✓ (errore formato) |
| Audio drawer | configurare la reazione | flow 2 (oggi overlay debug) | ✓ | ✓ (nessuna cella selezionata) |
| Command palette | raggiungere ogni parametro | risolve i 90 controlli | ✓ | ✓ (nessun risultato) |
| Context menu | azioni rapide | richiesta esplicita | ✓ | — |
| Shortcut sheet | scopribilità | supporto ai test | ✓ | — |

## 7. Non-goals (anti-constraints)
- Onboarding/marketing, auth, account, billing, team, commenti, presenza collaborativa.
- **Nessun modello multi-oggetto**: il progetto ha una sola griglia; il pannello Scene elenca griglia, celle e target audio, non "livelli" creabili. Aggiungere forme/livelli è una feature nuova, fuori scope.
- Layout mobile: strumento desktop; minimo 1024, target 1440. Nessuna schermata mobile in 09 — la study documenta il degrado, non un'app.
- Nessuna eliminazione di parametri: i ~90 controlli vengono raggruppati e cercabili, non rimossi.
- Nessun colore libero nel chrome UI: solo token; il colore libero esiste solo dentro il canvas e nel color picker.

## 8. Data model outline
- **Project** `{ id, name, updatedAt, thumbnail, grid{cols, rows}, glyph, look{ink, paper, grain}, audio{cells[], preset}, dirty }`
- **Cell** `{ x, y, filled, audioConfig? }`
- **Preferences** `{ theme, reducedMotion, audioInput, shortcuts, units }`
- **Relationships:** Project 1—N Cell; Preferences è singleton locale.
- **Freshness:** locale, nessun realtime. Persistenza = localStorage/IndexedDB oggi assente → `missing-backends.md`.

## 9. Interactions
- **Canvas:** hover highlight sul bordo cella, flash al paint, selezione con outline viola 1.5px + fill 8%.
- **Inspector:** cambia con la selezione; nessuna selezione → inspector di progetto.
- **Feedback:** toast non bloccante per save/export/undo; errore inline per audio non caricabile.
- **Keyboard:** ⌘K palette, ⌘S save, space pan, B brush, E erase, V select, ⌘Z undo, ⇧⌘Z redo.
- **Reduced motion:** disattiva flash/breathe, il canvas rispetta `respectReducedMotion` (già presente nel codice).

## 10. References
- Visual refs: `REFERENCES` frame — Figma `1:13` (menu contestuale + inspector), `1:16` (pannello righe + preset), `1:10` (sidebar/search), `1:7` (rail + sotto-nav + board), `1:4` (tile + tabella).
- Design system: shadcn/ui (neutral), Tailwind v4 tokens, Lucide icons.
- Competitors: Figma, Spline, Blender (properties), Rive, After Effects (timeline non in scope).

## 11. Constraints
- **Tech:** React 18 + Vite + Tailwind 4 + three.js (esistente). Design in Figma con variabili light/dark.
- **Brand:** nessun brand esterno; il colore del progetto (ink/paper) è contenuto, non brand.
- **Responsive targets:** 1440 (primary), 1280, 1024 (rail 48, inspector collassabile). Nessun 390.
- **Accessibility:** WCAG 2.2 AA — contrasto 4.5:1, target 44×44 su touch, focus ring 2px visibile, ordine focus = ordine visivo, tastiera completa, `prefers-reduced-motion`.

## 12. Open questions
- Persistenza progetti: localStorage, IndexedDB o backend? → non blocca il design; tracciato in `missing-backends.md` con fallback "local only".
- Export reale (WebM/PNG) dipende dal canvas: nel design si mostra il dialog, il comportamento è flagged.

## 12b. Harness exceptions (recorded overrides only)
| ID | Rule | Scope | Reason | Review date |
|---|---|---|---|---|
| — | — | — | nessuna al momento | — |

## 13. Layer approvals (atomic build)
| Layer | Shown to user | Approved | Date |
|---|---|---|---|
| Tokens | | pending | |
| Atoms | | pending | |
| Molecules | | pending | |
| Organisms | | pending | |
| Screens | | pending | |
