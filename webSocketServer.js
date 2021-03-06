const net = require('net')
const WebSocket = require('ws')
const wss = new WebSocket.Server({ port: 3000 }) // creation of a WebSocket Server for the communication with the WebAppnp
const encoder = new TextEncoder()
const client = net.connect(17017, 'localhost')

// Connection with J-CO-DS-Server

// WebApp Connection handling
wss.on('connection', function (ws) {
  console.log('Web-App connessa\n')
  console.log(ws.protocol)

  // Message from WebApp handling
  ws.on('message', async (data) => {
    const message = data.toString()
    const command = message.split('###')[0]
    console.log('Recived command: ' + command)
    const idws = ws.protocol
    if (command == 'LIST_DATABASE') {
      reqListDatabase(idws)
    }
    if (command == 'LIST_COLLECTIONS') {
      const dbName = message.split('###')[1]
      reqListCollection(dbName, idws)
    }
  })
})

// JCODS Server Response
async function getResponse (idws) {
  client.once('data', function (data) {
    console.log('prova')
    bytes = data
    bytes = bytes.subarray(4)
    if (Buffer.compare(bytes.subarray(0, 4), Buffer.from([0, 1, 0, 2])) == 0) {
      console.log('LIST DATABASE: ')
      wss.clients.forEach((client) => {
        if (client.protocol == idws) {
          client.send(bytes)
        }
      })
    }
    if (Buffer.compare(bytes.subarray(0, 4), Buffer.from([0, 2, 0, 2])) == 0) {
      console.log('LIST_COLLECTION')
      wss.clients.forEach((client) => {
        if (client.protocol == idws) {
          client.send(bytes)
        }
      })
    }
    console.log(bytes.subarray(12).toString())
  })
}

// Communication with JCODS Server functions
async function reqListDatabase (idws) {
  const commandCode = new Uint8Array(toBytesCommandCode('00010001'))
  // Params:
  const objParam = {}
  // Popolare i parametri (Es: objParams.name = name etc)
  // const reqParam = encoder.encode(JSON.stringify(objParams)) //Se ci sono parametri
  const reqParam = new Uint8Array(0) // Perchè non ci sono parametri

  // Body:
  const objBody = {}
  // Popolare il body
  // const reqBody = encoder.encode(JSON.stringify(objBody)) //Se c'è il body
  const reqBody = new Uint8Array(0) // Perchè non c'è body

  // Calcolo dimensione paramtri (serve nell'header del messaggio)
  const sizeParam = new Uint8Array(toBytesInt32(0))
  const sizeBody = new Uint8Array(toBytesInt32(0))

  // Costruzione messaggio
  const message = new Uint8Array(16 + reqParam.length + reqBody.length) // Creo un Array di lunghezza 16(header) + lunghezza reqParam + lunghezza reqBody

  // Scrittura messaggio, set prende come primo input cosa inserire e come secondo l'offset
  message.set(commandCode)// I primi 8 bit contengono il comando
  message.set(sizeParam, 8)// I successivi 4 contengono la dimensione dei parametri
  message.set(sizeBody, 8 + 4)// I successivi 4 contengono la dimensione del body
  message.set(reqParam, 8 + 4 + 4)// poi si scrivono i parametri (se ci sono)
  message.set(reqBody, 8 + 4 + 4 + reqParam.length)// Con offset 16 (header) + la lunghezza dei parametri si scrive il body (se c'è)

  client.write(message)
  await getResponse(idws)
}

async function reqListCollection (nameDB, idws) {
  const commandCode = new Uint8Array(toBytesCommandCode('00020001'))
  const objParam = {}
  objParam.database = nameDB

  const reqParam = encoder.encode(JSON.stringify(objParam))
  const reqBody = new Uint8Array(0)

  const sizeParam = new Uint8Array(toBytesInt32(reqParam.length))
  const sizeBody = new Uint8Array(toBytesInt32(0))

  const message = new Uint8Array(16 + reqParam.length + reqBody.length)
  message.set(commandCode)
  message.set(sizeParam, 8)
  message.set(sizeBody, 8 + 4)
  message.set(reqParam, 8 + 4 + 4)
  message.set(reqBody, 8 + 4 + 4 + reqParam.length)

  client.write(message)
  await getResponse(idws)
}

// Util function
const toBytesInt32 = (num) => { // Converte un int in ArrayBuffer(4)
  const arr = new ArrayBuffer(4)
  const view = new DataView(arr)
  view.setUint32(0, num, false)
  return arr
}

const toBytesCommandCode = (code) => { // Converte un comando di 8 cifre come string in ArrayBuffer(8)
  const byteArray = new Uint8Array(8)
  for (let i = 0; i < 4; i++) {
    byteArray[i + 4] = parseInt(code.substr(i * 2, 2), 16)
  }
  return byteArray
}
