const net = require('net')
const WebSocket = require('ws')
const encoder = new TextEncoder()
let isServerOn = false
let isOccupied = false
const pause = ms => new Promise(resolve => setTimeout(resolve, ms))
const consts = require('./src/functions/constants')

// creation of a WebSocket Server for the communication with the WebApp
const wss = new WebSocket.Server({ port: 3000 })

// Connection with J-CO-DS-Server
// comunication with j-co-ds server
let client = net.connect(17017, 'localhost', () => {
  isServerOn = true
})

client.on('error', onError)

/*
client.on('connect', function(){
  // client.write(Buffer.from([]))
  stopUpdate('test', 'd2')
})

client.on('data', function(data){
  console.log(new Uint8Array(data).toString())
  client.end()
}) */

// WebApp Connection handling different users
wss.on('connection', function (ws) {
  console.log('Web-App connessa con ID: ' + ws.protocol + '\n')

  if (!isServerOn) {
    wss.clients.forEach((client) => {
      client.close() // Allow connection only if the server is on
    })
  }

  client.on('error', error => {
    const err = new Uint8Array(consts.WS_PING_ERROR_RESPONSE) //Send an error message to the WebApp
    wss.clients.forEach((WSclient) => {
      WSclient.send(err)
      WSclient.close()
    })
    onError
  })

  // Message from WebApp handling
  ws.on('message', async function sendDataToServer (data) {
    if (!isOccupied) {
      isOccupied = true
      const message = data.toString()
      // '###' separate the command parameters
      const command = message.split('###')[0]
      if (command !== consts.WS_PING) {
        console.log('Recived command: ' + command)
      }
      const idws = ws.protocol
      if (command == consts.WS_LIST_DATABASE) {
        reqListDatabase(idws)
      } else if (command == consts.WS_LIST_COLLECTION) {
        const dbName = message.split('###')[1]
        reqListCollection(dbName, idws)
      } else if (command == consts.WS_LIST_URL) {
        const dbName = message.split('###')[1]
        const collName = message.split('###')[2]
        reqListUrl(dbName, collName, idws)
      } else if (command == consts.WS_CREATE_DATABASE) {
        const dbName = message.split('###')[1]
        createDatabase(dbName, idws)
      } else if (command == consts.WS_CREATE_COLLECTION) {
        const dbName = message.split('###')[1]
        const collName = message.split('###')[2]
        createCollection(dbName, collName, idws)
      } else if (command == consts.WS_CREATE_DYNAMIC_COLLECTION) {
        const dbName = message.split('###')[1]
        const collName = message.split('###')[2]
        const urlList = message.split('###')[3]
        createDynamicCollection(dbName, collName, urlList, idws)
      } else if (command == consts.WS_CREATE_VIRTUAL_COLLECTION) {
        const dbName = message.split('###')[1]
        const collName = message.split('###')[2]
        const urlList = message.split('###')[3]
        createVirtualCollection(dbName, collName, urlList, idws)
      } else if (command == consts.WS_ADD_URL) {
        const dbName = message.split('###')[1]
        const collName = message.split('###')[2]
        const urlList = message.split('###')[3]
        addUrl(dbName, collName, urlList, idws)
      } else if (command == consts.WS_GET_COLLECTION) {
        const dbName = message.split('###')[1]
        const collName = message.split('###')[2]
        const limit = message.split('###')[3]
        const offset = message.split('###')[4]
        getCollection(dbName, collName, limit, offset, idws)
      } else if (command == consts.WS_GET_COLLECTION_COUNT) {
        const db = message.split('###')[1]
        const collection = message.split('###')[2]
        getCollectionCount(idws, db, collection)
      } else if (command == consts.WS_DELETE_DATABASE) {
        const dbName = message.split('###')[1]
        deleteDatabase(dbName, idws)
      } else if (command == consts.WS_DELETE_COLLECTION) {
        const dbName = message.split('###')[1]
        const collName = message.split('###')[2]
        deleteCollection(dbName, collName, idws)
      } else if (command == consts.WS_REMOVE_URL) {
        const dbName = message.split('###')[1]
        const collName = message.split('###')[2]
        const index = message.split('###')[3]
        removeUrl(dbName, collName, index, idws)
      } else if (command == consts.WS_SAVE_COLLECTION) {
        const dbName = message.split('###')[1]
        const collName = message.split('###')[2]
        const docs = message.split('###')[3]
        const append = message.split('###')[4]
        saveCollection(dbName, collName, docs, append, idws)
      } else if (command == consts.WS_SET_FREQUENCY) {
        const dbName = message.split('###')[1]
        const collName = message.split('###')[2]
        const index = message.split('###')[3]
        const freq = message.split('###')[4]
        setFrequency(dbName, collName, index, freq, idws)
      } else if (command == consts.WS_SET_UPDATE_TYPE) {
        const dbName = message.split('###')[1]
        const collName = message.split('###')[2]
        const index = message.split('###')[3]
        const type = message.split('###')[4]
        setUpdateType(dbName, collName, index, type, idws)
      } else if (command == consts.WS_STOP_UPDATE) {
        const dbName = message.split('###')[1]
        const collName = message.split('###')[2]
        stopUpdate(dbName, collName, idws)
      } else if (command == consts.WS_PING) {
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
  const commandCode = new Uint8Array(toBytesCommandCode(consts.LIST_DATABASE))
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
  const commandCode = new Uint8Array(toBytesCommandCode(consts.LIST_COLLECTION))
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

async function reqListUrl (nameDb, nameColl, idws) {
  const commandCode = new Uint8Array(toBytesCommandCode(consts.LIST_URL))
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
  const commandCode = new Uint8Array(toBytesCommandCode(consts.CREATE_DATABASE))
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
  const commandCode = new Uint8Array(toBytesCommandCode(consts.CREATE_COLLECTION))
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
  const commandCode = new Uint8Array(toBytesCommandCode(consts.CREATE_DYNAMIC_COLLECTION))
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
  const commandCode = new Uint8Array(toBytesCommandCode(consts.CREATE_VIRTUAL_COLLECTION))
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
  const commandCode = new Uint8Array(toBytesCommandCode(consts.ADD_URL))
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
  const commandCode = new Uint8Array(toBytesCommandCode(consts.GET_COLLECTION_COUNT))

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
  const commandCode = new Uint8Array(toBytesCommandCode(consts.GET_COLLECTION))
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
  const commandCode = new Uint8Array(toBytesCommandCode(consts.DELETE_DATABASE))
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
  const commandCode = new Uint8Array(toBytesCommandCode(consts.DELETE_COLLECTION))
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

async function removeUrl (nameDb, nameColl, index, idws) {
  const commandCode = new Uint8Array(toBytesCommandCode(consts.REMOVE_URL))
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
  const commandCode = new Uint8Array(toBytesCommandCode(consts.SAVE_COLLECTION))
  const objParam = {}
  const objBody = {}

  objParam.database = nameDb
  objParam.collection = nameColl
  objParam.append = append
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

async function setFrequency (nameDb, nameColl, index, freq, idws) {
  const commandCode = new Uint8Array(toBytesCommandCode(consts.SET_FREQUENCY))
  const objParam = {}
  objParam.database = nameDb
  objParam.name = nameColl
  objParam.index = parseInt(index)
  objParam.frequency = parseInt(freq)

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

async function setUpdateType (nameDb, nameColl, indx, type, idws) {
  const commandCode = new Uint8Array(toBytesCommandCode(consts.SET_UPDATE_TYPE))
  const objParam = {}
  objParam.database = nameDb
  objParam.name = nameColl
  objParam.index = parseInt(indx)
  objParam.type = parseInt(type)

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

async function stopUpdate (nameDb, nameColl, idws) {
  const commandCode = new Uint8Array(toBytesCommandCode(consts.STOP_UPDATE))
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

async function ping (idws) {
  const commandCode = new Uint8Array(toBytesCommandCode(consts.PING))

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
  const chunks = []
  client.on('data', function readResponse (data) {
    chunks.push(data)
    if (data.length < 65536) {
      let res = Buffer.concat(chunks)
      res = res.subarray(16)
      let textRes = ''
      for (let i = 0; i < res.length; i++) {
        textRes += String.fromCharCode(res[i])
      }
      if (isJsonString(textRes) || Buffer.compare(data.subarray(4, 8), Buffer.from([0, 0, 0, 2])) == 0) { // Check if the response is ping or a valid JSON
        let bytes = Buffer.concat(chunks)
        bytes = bytes.subarray(4) // the 4 first byte are equals to 0
        if (Buffer.compare(bytes.subarray(0, 4), Buffer.from(consts.LIST_DATABASE_RESPONSE)) == 0) {
          console.log('LIST DATABASE: ')
          // if there are more clients connected
          wss.clients.forEach((client) => {
            if (client.protocol == idws) {
              client.send(bytes)
            }
          })
        } else if (Buffer.compare(bytes.subarray(0, 4), Buffer.from(consts.LIST_COLLECTION_RESPONSE)) == 0) {
          console.log('LIST_COLLECTION: ')
          wss.clients.forEach((client) => {
            if (client.protocol == idws) {
              client.send(bytes)
            }
          })
        } else if (Buffer.compare(bytes.subarray(0, 4), Buffer.from(consts.LIST_URL_RESPONSE)) == 0) {
          console.log('LIST_URL: ')
          wss.clients.forEach((client) => {
            if (client.protocol == idws) {
              client.send(bytes)
            }
          })
        } else if (Buffer.compare(bytes.subarray(0, 4), Buffer.from(consts.CREATE_DATABASE_RESPONSE)) == 0) {
          console.log('CREATE_DATABASE')
          wss.clients.forEach((client) => {
            if (client.protocol == idws) {
              client.send(bytes)
            }
          })
        } else if (Buffer.compare(bytes.subarray(0, 4), Buffer.from(consts.CREATE_COLLECTION_RESPONSE)) == 0) {
          console.log('CREATE_COLLECTION')
          wss.clients.forEach((client) => {
            if (client.protocol == idws) {
              client.send(bytes)
            }
          })
        } else if (Buffer.compare(bytes.subarray(0, 4), Buffer.from(consts.CREATE_DYNAMIC_COLLECTION_RESPONSE)) == 0) {
          console.log('CREATE_DYNAMIC_COLLECTION')
          wss.clients.forEach((client) => {
            if (client.protocol == idws) {
              client.send(bytes)
            }
          })
        } else if (Buffer.compare(bytes.subarray(0, 4), Buffer.from(consts.CREATE_VIRTUAL_COLLECTION_RESPONSE)) == 0) {
          console.log('CREATE_VIRTUAL_COLLECTION')
          wss.clients.forEach((client) => {
            if (client.protocol == idws) {
              client.send(bytes)
            }
          })
        } else if (Buffer.compare(bytes.subarray(0, 4), Buffer.from(consts.ADD_URL_RESPONSE)) == 0) {
          console.log('ADD_URL')
          wss.clients.forEach((client) => {
            if (client.protocol == idws) {
              client.send(bytes)
            }
          })
        } else if (Buffer.compare(bytes.subarray(0, 4), Buffer.from(consts.GET_COLLECTION_RESPONSE)) == 0) {
          console.log('GET_COLLECTION')
          wss.clients.forEach((client) => {
            if (client.protocol == idws) {
              client.send(bytes)
            }
          })
        } else if (Buffer.compare(bytes.subarray(0, 4), Buffer.from(consts.GET_COLLECTION_COUNT_RESPONSE)) == 0) {
          console.log('GET_COLLECTION_COUNT')
          wss.clients.forEach((client) => {
            if (client.protocol == idws) {
              client.send(bytes)
            }
          })
        } else if (Buffer.compare(bytes.subarray(0, 4), Buffer.from(consts.DELETE_DATABASE_RESPONSE)) == 0) {
          console.log('DELETE_DATABASE')
          wss.clients.forEach((client) => {
            if (client.protocol == idws) {
              client.send(bytes)
            }
          })
        } else if (Buffer.compare(bytes.subarray(0, 4), Buffer.from(consts.DELETE_COLLECTION_RESPONSE)) == 0) {
          console.log('DELETE_COLLECTION')
          wss.clients.forEach((client) => {
            if (client.protocol == idws) {
              client.send(bytes)
            }
          })
        } else if (Buffer.compare(bytes.subarray(0, 4), Buffer.from(consts.REMOVE_URL_RESPONSE)) == 0) {
          console.log('REMOVE_URL')
          wss.clients.forEach((client) => {
            if (client.protocol == idws) {
              client.send(bytes)
            }
          })
        } else if (Buffer.compare(bytes.subarray(0, 4), Buffer.from(consts.SAVE_COLLECTION_RESPONSE)) == 0) {
          console.log('SAVE_COLLECTION')
          wss.clients.forEach((client) => {
            if (client.protocol == idws) {
              client.send(bytes)
            }
          })
        } else if (Buffer.compare(bytes.subarray(0, 4), Buffer.from(consts.SET_FREQUENCY_RESPONSE)) == 0) {
          console.log('SET_FREQUENCY')
          wss.clients.forEach((client) => {
            if (client.protocol == idws) {
              client.send(bytes)
            }
          })
        } else if (Buffer.compare(bytes.subarray(0, 4), Buffer.from(consts.SET_UPDATE_TYPE_RESPONSE)) == 0) {
          console.log('SET_UPDATE_TYPE')
          wss.clients.forEach((client) => {
            if (client.protocol == idws) {
              client.send(bytes)
            }
          })
        } else if (Buffer.compare(bytes.subarray(0, 4), Buffer.from(consts.STOP_UPDATE_RESPONSE)) == 0) {
          console.log('STOP_UPDATE')
          wss.clients.forEach((client) => {
            if (client.protocol == idws) {
              client.send(bytes)
            }
          })
        } else if (Buffer.compare(bytes.subarray(0, 4), Buffer.from(consts.PING_RESPONSE)) == 0) {
        // PING
          wss.clients.forEach((client) => {
            if (client.protocol == idws) {
              client.send(bytes)
            }
          })
        }
        if (Buffer.compare(bytes.subarray(0, 4), Buffer.from(consts.PING_RESPONSE)) !== 0) {
          console.log(bytes.subarray(12).toString())
        }
        isOccupied = false
        client.removeListener('data', readResponse) // Stop listening if the last chunk is recived
      }
    }
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

function isJsonString (str) {
  try {
    JSON.parse(str)
  } catch (e) {
    return false
  }
  return true
}

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
