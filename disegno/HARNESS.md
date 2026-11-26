# HARNESS — Fragment / Shape Editor UI

Scope: UI chrome (rail, sidebar, header, canvas chrome, inspector, dialog, palette). The 3D canvas is user content.
Legend: PASS · FAIL (needs EXC) · PENDING (not yet verifiable) · N/A.
Budgets (HS9) are declared in `BRIEF.md` §2.

## HA — accessibility (WCAG 2.2 AA + Designers Italia)

| Rule | Status | Evidence |
|---|---|---|
| HA1 contrast text ≥ 4.5:1 | PASS | `CONTRAST-MATRIX.md`: 0 FAIL testuali, dark e light |
| HA2 non-text contrast ≥ 3:1 (controls, focus) | PASS | `input` 3.52/4.74 · `ring` 4.23–5.70 · `selection` 4.23–5.70 |
| HA3 focus visible, never removed | PASS | focus ring token dedicated, 2px violet, shown in Foundations |
| HA4 target size ≥ 24×24 (WCAG 2.2) / 44 touch | PASS (desktop) | IconButton 32×32, toolbar/rail 44×44, scene tab 32, clip 24, cella 44, rail 40→44; 44 touch reserved, desktop N/A |
| HA5 keyboard reachable, no trap | PENDING | interaction not prototyped; focus order defined in LOGIC-PAGES |
| HA6 reflow 320 / 400% zoom | PENDING | desktop tool, min width 1024 declared; study to run at 1280 |
| HA7 not colour alone | PASS | selected = fill + label weight + violet indicator; destructive = icon + label |
| HA8 reduced motion | PASS | setting `Reduce motion` present; canvas already honours `respectReducedMotion` |
| HA9 semantics/landmarks/heading order | PENDING | code-level; screen has one h1 per page in spec |
| HA10 consistent help/identity | PASS | rail stable across all screens, same position |
| HA11 error prevention & recovery | PASS | destructive actions separated (menu last row + destructive tone), undo toast specified |

## HS — sustainability

| Rule | Status | Evidence |
|---|---|---|
| HS1 purpose before pixels | PASS | BRIEF §2 MVP/KPI + 5 flows |
| HS2 lighter paths | PASS | local-only storage path; no account, no tracking |
| HS3 no dark patterns | PASS | no fake urgency, no forced flows |
| HS4 honest empty states | PASS | Library empty, Editor empty with next action |
| HS5 performance budget | PENDING | budget declared, measured in PHASE 7 |
| HS6 no autoplay media | PASS | audio requires explicit load + play |
| HS7 content longevity | PASS | plain tokens, no exotic fonts (Inter only) |
| HS8 accessible defaults | PASS | dark default still meets AA; light equally passed |
| HS9 declared budgets | PASS | see BRIEF §2 |

## Exceptions

| ID | Rule | Scope | Reason | Review |
|---|---|---|---|---|
| EXC-1 | Figma modes | token architecture | Free plan allows 1 mode per collection; light is a parallel collection (`ds/semantic-light`) + specimen instead of a native mode | 2027-01-31 |
| EXC-2 | G14 grid board | documentation boards | boards built as vertical auto-layout stacks (grid auto-placement unreliable with mixed heights); reading order preserved | 2027-01-31 |

## Conflict log
- `border` at 1.26:1 cannot be the sole indicator of an interactive control: resolved by `input` + `ring` tokens. No accessibility trade accepted.
- Canvas content default ink #202020 / paper #E8E5E8 is user content, not UI chrome: not subject to UI token contrast (ratio ~13:1 on the default pair), but the user can choose lower-contrast content; the UI keeps `ds/*` tokens.
- `Organism/GlyphGrid` has no Theme axis because it renders project content (ink/paper), not chrome; the content default is the same in dark and light app themes.
