# CONTRAST-MATRIX — Fragment / Shape Editor UI

Generated: 2026-11-25 · source of truth for **every** foreground × surface pair allowed in the UI.
Rule (G11): a pair that is not in this file cannot be used by a component. Text ≥ 4.5:1, UI/indicator ≥ 3:1 (WCAG 2.2 AA, 1.4.3 + 1.4.11).

Tokens: `ds/semantic` = **Dark** values (default theme) · `ds/semantic-light` = **Light** values (parallel collection — the Free Figma plan allows 1 mode per collection; recorded as EXC-1 in BRIEF §12b).
Violet is the **selection/indicator** accent, never a text colour on a neutral surface.

| Mode | Foreground | Surface | Use | Ratio | Verdict | Note |
|---|---|---|---|---|---|---|
| dark | foreground | background | text | 18.97:1 | PASS | 18.97 vs 4.5 |
| dark | foreground | card | text | 17.18:1 | PASS | 17.18 vs 4.5 |
| dark | foreground | popover | text | 17.18:1 | PASS | 17.18 vs 4.5 |
| dark | foreground | muted | text | 14.50:1 | PASS | 14.50 vs 4.5 |
| dark | muted-foreground | background | text | 7.85:1 | PASS | 7.85 vs 4.5 |
| dark | muted-foreground | card | text | 7.11:1 | PASS | 7.11 vs 4.5 |
| dark | muted-foreground | popover | text | 7.11:1 | PASS | 7.11 vs 4.5 |
| dark | muted-foreground | muted | text | 6.00:1 | PASS | 6.00 vs 4.5 |
| dark | primary-foreground | primary | text | 17.18:1 | PASS | 17.18 vs 4.5 |
| dark | secondary-foreground | secondary | text | 14.50:1 | PASS | 14.50 vs 4.5 |
| dark | accent-foreground | accent | text | 14.50:1 | PASS | 14.50 vs 4.5 |
| dark | destructive-foreground | destructive | text | 6.85:1 | PASS | 6.85 vs 4.5 |
| dark | destructive | background | text | 6.85:1 | PASS | 6.85 vs 4.5 |
| dark | destructive | card | text | 6.21:1 | PASS | 6.21 vs 4.5 |
| dark | selection-foreground | selection-solid | text | 5.70:1 | PASS | 5.70 vs 4.5 |
| dark | selection-solid | background | ui | 3.47:1 | PASS | 3.47 vs 3 |
| dark | selection | background | ui | 4.68:1 | PASS | 4.68 vs 3 |
| dark | selection | card | ui | 4.23:1 | PASS | 4.23 vs 3 |
| dark | ring | background | ui | 4.68:1 | PASS | 4.68 vs 3 |
| dark | ring | card | ui | 4.23:1 | PASS | 4.23 vs 3 |
| dark | ring | popover | ui | 4.23:1 | PASS | 4.23 vs 3 |
| dark | input | card | ui | 3.52:1 | PASS | 3.52 vs 3 |
| dark | input | popover | ui | 3.52:1 | PASS | 3.52 vs 3 |
| dark | sidebar-foreground | sidebar | text | 17.18:1 | PASS | 17.18 vs 4.5 |
| dark | muted-foreground | sidebar | text | 7.11:1 | PASS | 7.11 vs 4.5 |
| dark | sidebar-accent-foreground | sidebar-accent | text | 14.50:1 | PASS | 14.50 vs 4.5 |
| light | foreground | background | text | 19.80:1 | PASS | 19.80 vs 4.5 |
| light | foreground | card | text | 19.80:1 | PASS | 19.80 vs 4.5 |
| light | foreground | popover | text | 19.80:1 | PASS | 19.80 vs 4.5 |
| light | foreground | muted | text | 18.16:1 | PASS | 18.16 vs 4.5 |
| light | muted-foreground | background | text | 7.81:1 | PASS | 7.81 vs 4.5 |
| light | muted-foreground | card | text | 7.81:1 | PASS | 7.81 vs 4.5 |
| light | muted-foreground | popover | text | 7.81:1 | PASS | 7.81 vs 4.5 |
| light | muted-foreground | muted | text | 7.17:1 | PASS | 7.17 vs 4.5 |
| light | primary-foreground | primary | text | 17.18:1 | PASS | 17.18 vs 4.5 |
| light | secondary-foreground | secondary | text | 16.44:1 | PASS | 16.44 vs 4.5 |
| light | accent-foreground | accent | text | 16.44:1 | PASS | 16.44 vs 4.5 |
| light | destructive-foreground | destructive | text | 4.77:1 | PASS | 4.77 vs 4.5 |
| light | destructive | background | text | 4.77:1 | PASS | 4.77 vs 4.5 |
| light | destructive | card | text | 4.77:1 | PASS | 4.77 vs 4.5 |
| light | selection-foreground | selection-solid | text | 5.70:1 | PASS | 5.70 vs 4.5 |
| light | selection-solid | background | ui | 5.70:1 | PASS | 5.70 vs 3 |
| light | selection | background | ui | 5.70:1 | PASS | 5.70 vs 3 |
| light | selection | card | ui | 5.70:1 | PASS | 5.70 vs 3 |
| light | ring | background | ui | 5.70:1 | PASS | 5.70 vs 3 |
| light | ring | card | ui | 5.70:1 | PASS | 5.70 vs 3 |
| light | ring | popover | ui | 5.70:1 | PASS | 5.70 vs 3 |
| light | input | card | ui | 4.74:1 | PASS | 4.74 vs 3 |
| light | input | popover | ui | 4.74:1 | PASS | 4.74 vs 3 |
| light | border | background | ui-decorative | 1.26:1 | DECORATIVE | non indicatore unico |
| light | border | card | ui-decorative | 1.26:1 | DECORATIVE | non indicatore unico |
| dark | border | background | ui-decorative | 1.26:1 | DECORATIVE | non indicatore unico |
| dark | border | card | ui-decorative | 1.33:1 | DECORATIVE | non indicatore unico |
| dark | foreground | accent | target picker — label selezionata | 14.50:1 | PASS | 14.50 vs 4.5 |
| dark | muted-foreground | accent | target picker — meta/valore | 6.00:1 | PASS | 6.00 vs 4.5 |
| dark | selection | accent | target picker — barra/spunta (UI) | 3.57:1 | PASS | 3.57 vs 3 |
| light | foreground | accent | target picker — label selezionata | 18.16:1 | PASS | 18.16 vs 4.5 |
| light | muted-foreground | accent | target picker — meta/valore | 7.17:1 | PASS | 7.17 vs 4.5 |
| light | selection | accent | target picker — barra/spunta (UI) | 5.23:1 | PASS | 5.23 vs 3 |

## Uso nella timeline (0.10.0)
- Label clip: `foreground` su `muted` (14.50 dark / 18.16 light).
- Clip selezionato: `foreground` su `accent`; bordo `selection` su `accent` (3.57 / 5.23).
- Playhead e loop: `selection` su `background` (4.68 / 5.70).
- Scene tab attiva: `foreground` su `accent`, underline `selection` su `accent`.
- Tutte le coppie sono già elencate sopra; la timeline non introduce nuovi token.

## Canvas content (0.12.0)
- Default canvas: ink **#202020** on paper **#E8E5E8** (ratio ~13:1); empty cell #FFFFFF; line #2C2C2C. These are **project content**, not UI tokens: the user can change them, and they are not governed by the UI pair matrix.
- The UI selection/focus over the canvas uses `selection` / `ring` (violet), already in the matrix.

## Esclusioni documentate
- `border` non è mai l'unico indicatore di stato o di controllo: i bordi che identificano un controllo interattivo usano `input` (3.52:1 dark / 4.74:1 light) e il focus usa `ring` (violet).
- `selection` è un indicatore, non un colore di testo: il testo sopra la selezione usa `foreground` (su tinta 8%) o `selection-foreground` su `selection-solid`. Nel target picker la barra/spunta viola è un indicatore (3.57:1 dark / 5.23:1 light) e la label usa `foreground` su `accent` (14.50 / 18.16).
- Il colore del canvas (ink/paper del progetto) è **contenuto dell'utente**, non un token UI: non è soggetto a questo file ma al contrasto scelto dall'utente nel progetto.
