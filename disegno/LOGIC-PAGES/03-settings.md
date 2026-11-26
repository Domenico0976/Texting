# 03-settings — Settings

## 1. Purpose
Regolare preferenze locali che non appartengono a un progetto.

## 2. What it shows
1. Titolo "Settings" + sottotitolo "Preferences are local to this browser."
2. Gruppo **Appearance**: Theme (Light/Dark/System), Reduce motion, Density.
3. Gruppo **Canvas**: Audio input, Units, Show FPS readout.
4. Gruppo **Account**: Storage (local only), Keyboard shortcuts.

## 3. Data
- Preferenze locali; nessun account, nessun server.
- Mancante: dispositivo audio non disponibile → select mostra "No input found" + link alle istruzioni di sistema.

## 4. States
- **Full:** valori correnti visibili.
- **Empty:** N/A (le preferenze hanno sempre un default).
- **Error:** permesso microfono negato → riga con messaggio e CTA "Open system settings".

## 5. Actions
- Cambiare tema (applica immediatamente, nessun salvataggio esplicito).
- Attivare reduce motion (disattiva flash, breathe, transizioni).
- Scegliere input audio, unità, FPS.

## 6. UX Rules
- Nessun pulsante "Save": le modifiche sono immediate e reversibili.
- Ogni riga ha una sola decisione; le etichette restano a sinistra, il controllo a destra.
- Theme e Reduce motion sono le prime due voci (le più usate).

## 7. Perception & affordance
- Scopo percepito: "posso adattare lo strumento".
- Controlli standard shadcn: segmented per scelte brevi, select per liste, switch per booleani.

## 8. Flow & feedback
- Cambio tema → l'intera UI si aggiorna in < 100 ms.
- Reduce motion → il canvas smette immediatamente le animazioni.
- Nessun toast: la modifica è visibile.
