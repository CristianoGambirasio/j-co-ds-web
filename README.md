# j-co-ds-web

## Utilizzo della web app
La web app utilizza un server locale (webSocketServer) come intermediario per la comunicazione tra web app e J-CO-DS Server.
Sarà quindi necessario mandare in esecuzione webSocketServer.js e compilare il progetto Vue oltre all'avvio di J-CO-DS Server

- Avviare J-CO-DS Server

- Avviare webSocketServer
```
node webSocketServer.js
```

- Compilare e caricare il progetto vue
```
npm run serve
```

Una volta che la web app è stata compilata, partirà sulla porta 8080 di localhost
