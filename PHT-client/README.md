# PHT-client - Home Temperature Monitoring

App React per visualizzare i dati storici di temperatura da Firebase Realtime Database.

## Funzionalità

- **Ultima temperatura**: Mostra l'ultima temperatura rilevata con timestamp formattato (oggi/ieri/data)
- **Grafico storico**: Visualizza l'andamento della temperatura nel tempo
- **Selezione periodo**: Scegli tra Oggi, 24 ore, 3 giorni, 7 giorni o 30 giorni (default: 3 giorni)
- **Aggiornamento in tempo reale**: I dati si aggiornano automaticamente quando vengono aggiunte nuove misurazioni
- **PWA (Progressive Web App)**: Installabile su dispositivi mobile e desktop, funziona offline
- **Colori dinamici**: Visualizzazione con colori adattati alla temperatura e stagione
- **Design moderno**: Interfaccia pulita e responsive

## Configurazione Firebase

Prima di avviare l'app, devi configurare Firebase:

1. Vai su [Firebase Console](https://console.firebase.google.com/)
2. Crea un nuovo progetto o seleziona uno esistente
3. Abilita **Realtime Database**
4. Copia le credenziali del progetto
5. Modifica il file `src/firebase.js` inserendo i tuoi dati:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

## Formato dati

I dati devono essere salvati nella collection `temperatures` con il seguente formato:

```json
{
  "temperatures": {
    "uniqueId1": {
      "timestamp": "2025-11-02T10:30:00.000Z",
      "value": "22.5"
    },
    "uniqueId2": {
      "timestamp": "2025-11-02T11:00:00.000Z",
      "value": "23.1"
    }
  }
}
```

## Installazione

```bash
npm install
```

## Sviluppo

```bash
npm run dev
```

## Build per produzione

```bash
npm run build
```

## Deploy su Firebase Hosting

1. Installa Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Accedi a Firebase:
```bash
firebase login
```

3. Inizializza Firebase nel progetto:
```bash
firebase init
```
- Seleziona **Hosting**
- Scegli il tuo progetto Firebase
- Usa `dist` come directory pubblica
- Configura come Single Page App (Yes)
- Non sovrascrivere index.html

4. Builda e deploya:
```bash
npm run build
firebase deploy
```

## Tecnologie utilizzate

- React + Vite
- Firebase Realtime Database
- Recharts (grafici)
- date-fns (gestione date)
- vite-plugin-pwa (Progressive Web App)

## PWA - Progressive Web App

L'app è configurata come PWA e può essere installata su dispositivi mobile e desktop.

### Icone PWA

Prima del deploy, sostituisci i file placeholder nella cartella `public/` con le tue icone:
- `pwa-192x192.png` - Icona 192x192 per Android
- `pwa-512x512.png` - Icona 512x512 per Android e splash screen
- `apple-touch-icon.png` - Icona 180x180 per iOS

Puoi usare strumenti come [PWA Builder](https://www.pwabuilder.com/imageGenerator) per generare le icone.

### Installazione PWA

Dopo il deploy:
- **Android/Chrome**: Clicca su "Aggiungi a schermata Home" nel menu del browser
- **iOS/Safari**: Tap sul pulsante condividi e seleziona "Aggiungi a schermata Home"
- **Desktop**: Clicca sull'icona di installazione nella barra degli indirizzi

