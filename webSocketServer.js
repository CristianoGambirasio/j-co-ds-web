const net = require('net')
const WebSocket = require('ws')
// creation of a WebSocket Server for the communication with the WebApp
const wss = new WebSocket.Server({ port: 3000 })
const encoder = new TextEncoder()

let isServerOn = false
// comunication with j-co-ds server
let client = net.connect(17017, 'localhost', () => {
  isServerOn = true
})
let isOccupied = false

const pause = ms => new Promise(resolve => setTimeout(resolve, ms))

client.on('error', onError)

function onError () {
  isServerOn = false
  console.log('No connection with the server')
  setTimeout(() => {
    console.log('Trying reconnecting...')
    client = new net.connect(17017, 'localhost', () => {
      console.log('Riconnesso al server')
      isServerOn = true
    })
    client.on('error', onError)
  }, 10000)
}

/*
client.on('connect', function(){
  client.write(Buffer.from([0, 0, 0, 0, 0, 2, 0, 9, 0, 0, 0, 52, 0, 0, 1, 87, 123, 34, 100, 97, 116, 97, 98, 97, 115, 101, 34, 58, 34, 112, 114, 111, 118, 97, 34, 44, 34, 99, 111, 108, 108, 101, 99, 116, 105, 111, 110, 34, 58, 34, 103, 34, 44, 34, 97, 112, 112, 101, 110, 100, 34, 58, 102, 97, 108, 115, 101, 125, 123, 34, 100, 111, 99, 117, 109, 101, 110, 116, 115, 34, 58, 91, 123, 34, 116, 121, 112, 101, 34, 58, 49, 44, 34, 117, 114, 108, 34, 58, 34, 97, 112, 105, 46, 103, 101, 111, 110, 97, 109, 101, 115, 46, 111, 114, 103, 47, 102, 105, 110, 100, 78, 101, 97, 114, 98, 121, 80, 108, 97, 99, 101, 78, 97, 109, 101, 74, 83, 79, 78, 63, 102, 111, 114, 109, 97, 116, 116, 101, 100, 61, 116, 114, 117, 101, 38, 108, 97, 116, 61, 52, 53, 46, 52, 38, 108, 110, 103, 61, 57, 46, 53, 38, 117, 115, 101, 114, 110, 97, 109, 101, 61, 112, 97, 111, 108, 111, 102, 111, 115, 99, 105, 38, 115, 116, 121, 108, 101, 61, 102, 117, 108, 108, 34, 125, 44, 123, 34, 116, 121, 112, 101, 34, 58, 50, 44, 34, 117, 114, 108, 34, 58, 34, 104, 116, 116, 112, 58, 47, 47, 97, 112, 105, 46, 103, 101, 111, 110, 97, 109, 101, 115, 46, 111, 114, 103, 47, 101, 97, 114, 116, 104, 113, 117, 97, 107, 101, 115, 74, 83, 79, 78, 63, 102, 111, 114, 109, 97, 116, 116, 101, 100, 61, 116, 114, 117, 101, 38, 110, 111, 114, 116, 104, 61, 52, 52, 46, 49, 38, 115, 111, 117, 116, 104, 61, 45, 57, 46, 57, 38, 101, 97, 115, 116, 61, 45, 50, 50, 46, 52, 38, 119, 101, 115, 116, 61, 53, 53, 46, 50, 38, 117, 115, 101, 114, 110, 97, 109, 101, 61, 112, 97, 111, 108, 111, 102, 111, 115, 99, 105, 38, 115, 116, 121, 108, 101, 61, 102, 117, 108, 108, 34, 125, 44, 123, 34, 114, 101, 115, 34, 58, 34, 47, 110, 102, 55, 56, 45, 110, 106, 54, 98, 46, 106, 115, 111, 110, 63, 34, 44, 34, 116, 121, 112, 101, 34, 58, 51, 44, 34, 112, 97, 114, 97, 109, 115, 34, 58, 34, 36, 108, 105, 109, 105, 116, 61, 49, 48, 34, 125, 93, 125]))
})

client.on('data', function(data){
  console.log(new Uint8Array(data).toString())
})
*/

// Connection with J-CO-DS-Server

// WebApp Connection handling different users
wss.on('connection', function (ws) {
  console.log('Web-App connessa con ID: ' + ws.protocol + '\n')

  if (!isServerOn) {
    wss.clients.forEach((client) => {
      client.close()
    })
  }

  client.on('error', error => {
    const err = new Uint8Array([0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 1])
    wss.clients.forEach((client) => {
      client.send(err)
      client.close()
    })
    onError
  })

  // Message from WebApp handling
  ws.on('message', async function sendDataToServer (data) {
    if (!isOccupied) {
      isOccupied = true
      const message = data.toString()
      // '###' separano i parametri del comando
      const command = message.split('###')[0]
      if (command !== 'PING') {
        console.log('Recived command: ' + command)
      }
      const idws = ws.protocol
      if (command == 'LIST_DATABASE') {
        reqListDatabase(idws)
      } else if (command == 'LIST_COLLECTIONS') {
        const dbName = message.split('###')[1]
        reqListCollection(dbName, idws)
      } else if (command == 'LIST_URL') {
        const dbName = message.split('###')[1]
        const collName = message.split('###')[2]
        reqListUrl(dbName, collName, idws)
      } else if (command == 'CREATE_DATABASE') {
        const dbName = message.split('###')[1]
        createDatabase(dbName, idws)
      } else if (command == 'CREATE_COLLECTION') {
        const dbName = message.split('###')[1]
        const collName = message.split('###')[2]
        createCollection(dbName, collName, idws)
      } else if (command == 'CREATE_DYNAMIC_COLLECTION') {
        const dbName = message.split('###')[1]
        const collName = message.split('###')[2]
        const urlList = message.split('###')[3]
        createDynamicCollection(dbName, collName, urlList, idws)
      } else if (command == 'CREATE_VIRTUAL_COLLECTION') {
        const dbName = message.split('###')[1]
        const collName = message.split('###')[2]
        const urlList = message.split('###')[3]
        createVirtualCollection(dbName, collName, urlList, idws)
      } else if (command == 'ADD_URL') {
        const dbName = message.split('###')[1]
        const collName = message.split('###')[2]
        const urlList = message.split('###')[3]
        addUrl(dbName, collName, urlList, idws)
      } else if (command == 'GET_COLLECTION') {
        const dbName = message.split('###')[1]
        const collName = message.split('###')[2]
        const limit = message.split('###')[3]
        const offset = message.split('###')[4]
        getCollection(dbName, collName, limit, offset, idws)
      } else if (command == 'GET_COLLECTION_COUNT') {
        const db = message.split('###')[1]
        const collection = message.split('###')[2]
        getCollectionCount(idws, db, collection)
      } else if (command == 'DELETE_DATABASE') {
        const dbName = message.split('###')[1]
        deleteDatabase(dbName, idws)
      } else if (command == 'DELETE_COLLECTION') {
        const dbName = message.split('###')[1]
        const collName = message.split('###')[2]
        deleteCollection(dbName, collName, idws)
      } else if (command == 'REMOVE_URL') {
        const dbName = message.split('###')[1]
        const collName = message.split('###')[2]
        const index = message.split('###')[3]
        removeUrl(dbName, collName, index, idws)
      } else if (command == 'SAVE_COLLECTION') {
        const dbName = message.split('###')[1]
        const collName = message.split('###')[2]
        const docs = message.split('###')[3]
        const append = message.split('###')[4]
        saveCollection(dbName, collName, docs, append, idws)
      } else if (command == 'SET_FREQUENCY') {
        const dbName = message.split('###')[1]
        const collName = message.split('###')[2]
        const index = message.split('###')[3]
        const freq = message.split('###')[4]
        setFrequency(dbName, collName, index, freq, idws)
      } else if (command == 'PING') {
        ping(idws)
      }
    } else {
      await pause(100)
      sendDataToServer(data)
    }
  })
})

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

  client.write(message) // send to j-co-ds server the message
  await getResponse(idws) //
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

async function reqListUrl(nameDb, nameColl, idws) {
  const commandCode = new Uint8Array(toBytesCommandCode('00030005'))
  const objParam = {}
  objParam.database = nameDb
  objParam.name = nameColl

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

async function createDatabase (nameDB, idws) {
  console.log(nameDB)
  const commandCode = new Uint8Array(toBytesCommandCode('00010003'))
  const objParam = {}
  objParam.name = nameDB

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
  console.log(message)

  client.write(message)
  await getResponse(idws)
}

async function createCollection (nameDB, nameColl, idws) {
  const commandCode = new Uint8Array(toBytesCommandCode('00020003'))
  const objParam = {}
  objParam.database = nameDB
  objParam.name = nameColl

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

async function createDynamicCollection (nameDB, nameColl, listUrl, idws) {
  const commandCode = new Uint8Array(toBytesCommandCode('00020023'))
  const objParam = {}
  objParam.database = nameDB
  objParam.name = nameColl
  objParam.url = []
  objParam.url = listUrl.split(',')

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

async function createVirtualCollection (nameDB, nameColl, listUrl, idws) {
  const commandCode = new Uint8Array(toBytesCommandCode('00020013'))
  const objParam = {}
  objParam.database = nameDB
  objParam.name = nameColl
  objParam.url = []
  objParam.url = listUrl.split(',')

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

async function addUrl (nameDB, nameColl, listUrl, idws) {
  const commandCode = new Uint8Array(toBytesCommandCode('00030001'))
  const objParam = {}
  objParam.database = nameDB
  objParam.name = nameColl
  objParam.url = []
  objParam.url = listUrl.split(',')

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

async function getCollectionCount (idws, db, collection) {
  const commandCode = new Uint8Array(toBytesCommandCode('0002000b'))

  const objParam = {}
  objParam.database = db
  objParam.collection = collection

  const reqParam = new Uint8Array(encoder.encode(JSON.stringify(objParam)))
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

async function getCollection (nameDb, nameColl, lim, offs, idws) {
  const commandCode = new Uint8Array(toBytesCommandCode('00020007'))
  const objParam = {}
  objParam.database = nameDb
  objParam.collection = nameColl
  objParam.limit = parseInt(lim)
  objParam.offset = parseInt(offs)

  const reqParam = new Uint8Array(encoder.encode(JSON.stringify(objParam)))
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

async function deleteDatabase (nameDb, idws) {
  const commandCode = new Uint8Array(toBytesCommandCode('00010005'))
  const objParam = {}
  objParam.name = nameDb

  const reqParam = new Uint8Array(encoder.encode(JSON.stringify(objParam)))
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

async function deleteCollection (nameDb, nameColl, idws) {
  const commandCode = new Uint8Array(toBytesCommandCode('00020005'))
  const objParam = {}
  objParam.database = nameDb
  objParam.name = nameColl

  const reqParam = new Uint8Array(encoder.encode(JSON.stringify(objParam)))
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

async function removeUrl(nameDb, nameColl, index, idws) {
  const commandCode = new Uint8Array(toBytesCommandCode('00030003'))
  const objParam = {}
  objParam.database = nameDb
  objParam.name = nameColl
  objParam.index = index

  const reqParam = new Uint8Array(encoder.encode(JSON.stringify(objParam)))
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

async function saveCollection (nameDb, nameColl, documents, append, idws) {
  const commandCode = new Uint8Array(toBytesCommandCode('00020009'))
  const objParam = {}
  const objBody = {}

  objParam.database = nameDb
  objParam.collection = nameColl
  objParam.append = false
  objBody.documents = []
  textDocuments = documents.split(',')
  objBody.documents.forEach((document) => {
    objBody.documents.push(JSON.parse(document))
  })

  const reqParam = new Uint8Array(encoder.encode(JSON.stringify(objParam)))
  const reqBody = new Uint8Array(encoder.encode(JSON.stringify(objBody)))

  const sizeParam = new Uint8Array(toBytesInt32(reqParam.length))
  const sizeBody = new Uint8Array(toBytesInt32(reqBody.length))

  const message = new Uint8Array(16 + reqParam.length + reqBody.length)
  message.set(commandCode)
  message.set(sizeParam, 8)
  message.set(sizeBody, 8 + 4)
  message.set(reqParam, 8 + 4 + 4)
  message.set(reqBody, 8 + 4 + 4 + reqParam.length)

  client.write(message)
  await getResponse(idws)
}

async function setFrequency (nameDb, nameColl, indx, freq, idws) {
  const commandCode = new Uint8Array(toBytesCommandCode('00040001'))
  const objParam = {}
  objParam.database = nameDb
  objParam.name = nameColl
  objParam.index = parseInt(indx)
  objParam.frequency = freq

  const reqParam = new Uint8Array(encoder.encode(JSON.stringify(objParam)))
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

async function ping (idws) {
  const commandCode = new Uint8Array(toBytesCommandCode('00000001'))

  const reqParam = new Uint8Array(0)
  const reqBody = new Uint8Array(0)

  const sizeParam = new Uint8Array(toBytesInt32(0))
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

// JCODS Server Response
async function getResponse (idws) {
  client.once('data', function (data) {
    bytes = data
    bytes = bytes.subarray(4) // the 4 first byte are equals to 0
    if (Buffer.compare(bytes.subarray(0, 4), Buffer.from([0, 1, 0, 2])) == 0) {
      console.log('LIST DATABASE: ')
      // if there are more clients connected
      wss.clients.forEach((client) => {
        if (client.protocol == idws) {
          client.send(bytes)
        }
      })
    } else if (Buffer.compare(bytes.subarray(0, 4), Buffer.from([0, 2, 0, 2])) == 0) {
      console.log('LIST_COLLECTION: ')
      wss.clients.forEach((client) => {
        if (client.protocol == idws) {
          client.send(bytes)
        }
      })
    } else if (Buffer.compare(bytes.subarray(0, 4), Buffer.from([0, 3, 0, 6])) == 0) {
      console.log('LIST_URL: ')
      wss.clients.forEach((client) => {
        if (client.protocol == idws) {
          client.send(bytes)
        }
      })
    } else if (Buffer.compare(bytes.subarray(0, 4), Buffer.from([0, 1, 0, 4])) == 0) {
      console.log('CREATE_DATABASE')
      wss.clients.forEach((client) => {
        if (client.protocol == idws) {
          client.send(bytes)
        }
      })
    } else if (Buffer.compare(bytes.subarray(0, 4), Buffer.from([0, 2, 0, 4])) == 0) {
      console.log('CREATE_COLLECTION')
      wss.clients.forEach((client) => {
        if (client.protocol == idws) {
          client.send(bytes)
        }
      })
    } else if (Buffer.compare(bytes.subarray(0, 4), Buffer.from([0, 2, 0, 24])) == 0) {
      console.log('CREATE_DYNAMIC_COLLECTION')
      wss.clients.forEach((client) => {
        if (client.protocol == idws) {
          client.send(bytes)
        }
      })
    } else if (Buffer.compare(bytes.subarray(0, 4), Buffer.from([0, 2, 0, 14])) == 0) {
      console.log('CREATE_VIRTUAL_COLLECTION')
      wss.clients.forEach((client) => {
        if (client.protocol == idws) {
          client.send(bytes)
        }
      })
    } else if (Buffer.compare(bytes.subarray(0, 4), Buffer.from([0, 3, 0, 2])) == 0) {
      console.log('ADD_URL')
      wss.clients.forEach((client) => {
        if (client.protocol == idws) {
          client.send(bytes)
        }
      })
    } else if (Buffer.compare(bytes.subarray(0, 4), Buffer.from([0, 2, 0, 8])) == 0) {
      console.log('GET_COLLECTION')
      wss.clients.forEach((client) => {
        if (client.protocol == idws) {
          client.send(bytes)
        }
      })
    } else if (Buffer.compare(bytes.subarray(0, 4), Buffer.from([0, 2, 0, 12])) == 0) {
      console.log('GET_COLLECTION_COUNT')
      wss.clients.forEach((client) => {
        if (client.protocol == idws) {
          client.send(bytes)
        }
      })
    } else if (Buffer.compare(bytes.subarray(0, 4), Buffer.from([0, 1, 0, 6])) == 0) {
      console.log('DELETE_DATABASE')
      wss.clients.forEach((client) => {
        if (client.protocol == idws) {
          client.send(bytes)
        }
      })
    } else if (Buffer.compare(bytes.subarray(0, 4), Buffer.from([0, 2, 0, 6])) == 0) {
      console.log('DELETE_COLLECTION')
      wss.clients.forEach((client) => {
        if (client.protocol == idws) {
          client.send(bytes)
        }
      })
    } else if (Buffer.compare(bytes.subarray(0, 4), Buffer.from([0, 3, 0, 4])) == 0) {
      console.log('REMOVE_URL')
      wss.clients.forEach((client) => {
        if (client.protocol == idws) {
          client.send(bytes)
        }
      })
    } else if (Buffer.compare(bytes.subarray(0, 4), Buffer.from([0, 2, 0, 10])) == 0) {
      console.log('SAVE_COLLECTION')
      wss.clients.forEach((client) => {
        if (client.protocol == idws) {
          client.send(bytes)
        }
      })
    } else if (Buffer.compare(bytes.subarray(0, 4), Buffer.from([0, 4, 0, 2])) == 0) {
      console.log('SET_FREQUENCY')
      wss.clients.forEach((client) => {
        if (client.protocol == idws) {
          client.send(bytes)
        }
      })
    } else if (Buffer.compare(bytes.subarray(0, 4), Buffer.from([0, 0, 0, 2])) == 0) {
      // PING
      wss.clients.forEach((client) => {
        if (client.protocol == idws) {
          client.send(bytes)
        }
      })
    }
    if (Buffer.compare(bytes.subarray(0, 4), Buffer.from([0, 0, 0, 2])) !== 0) {
      console.log(bytes.subarray(12).toString())
    }
    isOccupied = false
  })
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
