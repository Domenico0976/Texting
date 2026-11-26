# intake.md — Shape Editor UI (Figma)

## 1. Input
| Fonte | Stato | Note |
|---|---|---|
| Figma file | ✅ bridge attivo | "Texting" · `gmorvNrypDXH59DHWP5chr` · Page 1 · frame `REFERENCES` 834×501, 5 immagini |
| Reference 1 (1:4) | ✅ letta | Knowledge Base — rail icone + sidebar albero Folders/Files, tile cartelle, tabella file |
| Reference 2 (1:7) | ✅ letta | Vetted/Lanternfish — rail + sidebar con sotto-sezioni, breadcrumb, board a 3 colonne con card, toggle, badge count |
| Reference 3 (1:10) | ✅ letta | Overlay — sola sidebar: search con `kbd /`, voce attiva piena, item 40px |
| Reference 4 (1:13) | ✅ letta | Editor 3D tipo Figma — menu contestuale flottante con shortcut, pannello properties a sezioni, toolbar segmentata, selezione viola |
| Reference 5 (1:16) | ✅ letta | Editor 3D avatar — pannello sinistro righe label+valore+slider, tab Object/Surface/Landscape, griglia preset a destra |
| Codebase | ✅ letto | Vite + React 18 + Tailwind 4 + three. `controls/main.json` = 12 sezioni / ~90 controlli; `controls-ui.tsx` = pannello raw; `cell-audio-panel.tsx` = pannello flottante debug |
| Design system | ⏳ da scegliere | richiesta: shadcn/ui, light + dark, accessibile |

## 2. Cosa è il prodotto (dedotto dal codice, da confermare in BRIEF)
Editor di griglie modulari 3D: si disegna un glifo su una griglia N×M, si scolpisce forma/tratto/materiale, e una cella può essere resa reattiva all'audio (level/kick/bass/BPM → scala). Tre look predefiniti (Main, Dense Riso, Midnight Minimal). Oggi la UI è uno scaffold: switcher varianti, pannello controlli grezzo, pannello audio debug.

## 3. DNA visivo estratto (unico, condiviso dalle 5 reference)
`near-black #0b0b0d · surface #141416 · border #26262a (1px) · text #ededef / muted #a1a1aa / faint #71717a · accent selezione #7c5cff · Inter 12–13px UI, 11px label, 15–16 titolo sezione · radius 6/8/10/12/pill · elevazione solo su popover/menu (shadow 0 8px 24px rgba(0,0,0,.45) + border) · icona 16px stroke 1.5 · densità alta, hairline ovunque, nessun gradiente decorativo`

## 4. Struttura ricorrente nelle reference (scheletro di prodotto)
```
┌ rail 56 ┬ sidebar 240–288 ┬──────── content ────────┬ properties 240–288 ┐
│ icone    │ search + nav    │ toolbar flottante top   │ sezioni collassabili│
│          │ albero/lista    │ canvas / board          │ righe label+valore  │
│          │                 │ menu contestuale        │ slider + swatch     │
└──────────┴─────────────────┴─────────────────────────┴─────────────────────┘
```
Varianti osservate: rail+sidebar con breadcrumb e board a card (ref 2), rail+sidebar con tabella/tile (ref 1), sola sidebar (ref 3), editor con pannello destro a gruppi (ref 4), editor con pannello sinistro a righe e preset a destra (ref 5).

## 5. Vincoli
- Design system shadcn/ui (neutral/zinc), token semantici, light + dark come **mode** Figma.
- Accessibilità WCAG 2.2 AA: 44×44 target (touch), contrasto 4.5:1 testo / 3:1 icone, focus visibile, reduced motion.
- Il canvas 3D è l'unico elemento che mostra colore libero (è contenuto, non chrome UI).
- Nessun controllo può sparire: i ~90 parametri vanno raggruppati e progressive-disclosed, non eliminati.

## 6. Aperti (bloccanti)
- MVP + KPI (R1)
- Piano Figma free/paid → budget pagine
- Conferma file target ("Texting") e dove vivono le pagine nuove
- Ampiezza set schermate (solo editor vs editor + libreria + settings)
