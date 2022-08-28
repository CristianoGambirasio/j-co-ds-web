import * as tool from './tools'
// import WS from '../functions/connection.js'

export function getListDatabase () {
  this.listDatabases = []
  this.connection.send('LIST_DATABASE')
  this.handleResponse()
};

export async function getListCollection (item) {
  return await new Promise(resolve => {
    this.connection.send('LIST_COLLECTIONS###' + item.name)
    const finished = resolve
    this.handleResponse(finished)
  })
};

export function getListUrl (nameDb, nameColl) {
  this.listUrls = []
  this.connection.send('LIST_URL###' + nameDb + '###' + nameColl)
  this.handleResponse()
};

export async function getCollectionCount (db, collection) {
  let countCollection
  await new Promise(resolve => {
    this.connection.send('GET_COLLECTION_COUNT###' + db + '###' + collection)
    const finishCount = resolve
    this.handleResponse(finishCount)
  }).then((value) => {
    countCollection = value
  })
  return countCollection
};

export function createDatabase (nameDb) {
  this.connection.send('CREATE_DATABASE###' + nameDb)
  this.handleResponse()
};

export function createCollection (nameDb, nameColl) {
  this.connection.send('CREATE_COLLECTION###' + nameDb + '###' + nameColl)
  this.handleResponse()
};

export function createDynamicCollection (nameDb, nameColl, listUrl) {
  this.connection.send('CREATE_DYNAMIC_COLLECTION###' + nameDb + '###' + nameColl + '###' + listUrl)
  this.handleResponse()
};

export function createVirtualCollection (nameDb, nameColl, listUrl) {
  this.connection.send('CREATE_VIRTUAL_COLLECTION###' + nameDb + '###' + nameColl + '###' + listUrl)
  this.handleResponse()
};

export function addUrl (nameDb, nameColl, listUrl) {
  this.connection.send('ADD_URL###' + nameDb + '###' + nameColl + '###' + listUrl)
  this.handleResponse()
};

export async function getCollection (nameDb, nameColl, limit, offset) {
  let documents
  await new Promise(resolve => {
    this.connection.send('GET_COLLECTION###' + nameDb + '###' + nameColl + '###' + limit + '###' + offset)
    const finish = resolve
    this.handleResponse(finish)
  }).then((value) => {
    documents = value
  })
  return documents
};

export function saveCollection (nameDb, nameColl, docs, append) {
  this.connection.send('SAVE_COLLECTION###' + nameDb + '###' + nameColl + '###' + docs + '###' + append)
  this.handleResponse()
};

export async function exportCollection (nameDb, nameColl, nameFile) {
  const coll = await this.getCollection(nameDb, nameColl, this.limit, this.offset)
  console.log(coll.documents[0])
  const data = coll.documents
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data))
  const downloadAnchorNode = document.createElement('a')
  downloadAnchorNode.setAttribute('href', dataStr)
  downloadAnchorNode.setAttribute('download', nameFile + '.json')
  document.body.appendChild(downloadAnchorNode) // required for firefox
  downloadAnchorNode.click()
  downloadAnchorNode.remove()
};

export async function importCollection (nameDb) {
  // let intern
  const fileInput = document.getElementById('file_upload').files[0]
  const nameColl = fileInput.name.split('.')[0]
  const fileread = new FileReader()
  await new Promise(resolve => {
    fileread.onload = function (e) {
      const content = e.target.result
      // intern = JSON.parse(content)
      resolve(content)
    }
    fileread.readAsText(fileInput)
  }).then((res) => {
    this.saveCollection(nameDb, nameColl, res, this.append)
  })
};

export function setFrequency (nameDb, nameColl, index, frequency) {
  this.connection.send('SET_FREQUENCY###' + nameDb + '###' + nameColl + '###' + index + '###' + frequency)
  this.handleResponse()
};

export function deleteDatabase (nameDb) {
  this.connection.send('DELETE_DATABASE###' + nameDb)
  this.handleResponse()
};

export function deleteCollection (nameDb, nameColl) {
  this.connection.send('DELETE_COLLECTION###' + nameDb + '###' + nameColl)
  this.handleResponse()
};

export function removeUrl (nameDb, nameColl, index) {
  this.connection.send('REMOVE_URL###' + nameDb + '###' + nameColl + '###' + index)
  this.handleResponse()
};

export function deleteMoreCollections (colls) {
  for (let i = 0; i < colls.length; i++) {
    this.connection.send('DELETE_COLLECTION###' + colls[i].db + '###' + colls[i].name)
    this.handleResponse()
  }
};

export function ping () {
  let errMessageSent = false
  this.connection.send('PING')
  setInterval(() => {
    if (this.connection === null || this.connection.readyState === 2 || this.connection.readyState === 3) {
      // this.connection.close()
      this.online = false
      if (!errMessageSent) {
        console.log('No connection')
      }
      errMessageSent = true
    } else {
      errMessageSent = false
      this.connection.send('PING')
    }
  }
  , 1000)
};

export function handleResponse (finished) {
  this.connection.onmessage = async (message) => {
    const dataBuffer = await message.data.arrayBuffer()
    let data = new Uint8Array(dataBuffer)
    const command = data.slice(0, 4)
    data = data.slice(12)
    let text = ''
    for (let i = 0; i < data.length; i++) {
      text += String.fromCharCode(data[i])
    }
    // const text = String.fromCharCode(...data)
    if (!tool.arrayEquals(command, [0, 0, 0, 2])) {
      console.log('Command ' + command + ' recived')
    }
    // List Databases
    if (tool.arrayEquals(command, [0, 1, 0, 2])) {
      this.listDatabases = []
      const db = JSON.parse(text)
      db.databases.forEach(database => {
        const databaseJSON = {}
        databaseJSON.name = database
        databaseJSON.type = 'database'
        databaseJSON.children = []
        this.listDatabases.push(databaseJSON)
      })
    }
    // List Collections
    if (tool.arrayEquals(command, [0, 2, 0, 2])) {
      const colls = JSON.parse(text)
      this.listDatabases.forEach(database => {
        if (database.name === colls.database) {
          colls.collections.forEach(collection => {
            collection = collection.replace('\n', '') // la risposta del server contiene degli \n che vengono rimossi
            const collectionJSON = {}
            collectionJSON.name = collection.split(' ')[0]
            collectionJSON.type = collection.split(' ')[1]
            collectionJSON.db = database.name
            database.children.push(collectionJSON)
          })
        }
      })
      finished()
    }
    // List Urls
    if (tool.arrayEquals(command, [0, 3, 0, 6])) {
      this.listUrls = []
      const urls = JSON.parse(text)
      urls.list.forEach(url => {
        url = url.replace('\n', '')
        this.listUrls.push(url)
      })
    }
    // Create Database
    if (tool.arrayEquals(command, [0, 1, 0, 4])) {
      const db = JSON.parse(text)
      const databaseJSON = {}
      databaseJSON.name = db
      databaseJSON.type = 'database'
      databaseJSON.children = []
      this.listDatabases.push(databaseJSON)
    }
    // Create Collection
    if (tool.arrayEquals(command, [0, 2, 0, 4])) {
      const colls = JSON.parse(text)
      this.listDatabases.forEach(database => {
        if (database.name === colls.database) {
          const collection = colls.replace('\n', '') // la risposta del server contiene degli \n che vengono rimossi
          const collectionJSON = {}
          collectionJSON.name = collection.split(' ')[0]
          collectionJSON.type = collection.split(' ')[1]
          database.children.push(collectionJSON)
        }
      })
    }
    // Create Dynamic Collection
    if (tool.arrayEquals(command, [0, 2, 0, 24])) {
      const colls = JSON.parse(text)
      this.listDatabases.forEach(database => {
        if (database.name === colls.database) {
          const collection = colls.replace('\n', '')
          const collectionJSON = {}
          collectionJSON.name = collection.split(' ')[0]
          collectionJSON.type = collection.split(' ')[1]
          collectionJSON.urls = collection.split(' ')[2]
          database.children.push(collectionJSON)
        }
      })
    }
    // Create Virtual Collection
    if (tool.arrayEquals(command, [0, 2, 0, 14])) {
      const colls = JSON.parse(text)
      this.listDatabases.forEach(database => {
        if (database.name === colls.database) {
          const collection = colls.replace('\n', '')
          const collectionJSON = {}
          collectionJSON.name = collection.split(' ')[0]
          collectionJSON.type = collection.split(' ')[1]
          collectionJSON.urls = collection.split(' ')[2]
          database.children.push(collectionJSON)
        }
      })
    }
    // Add Url
    if (tool.arrayEquals(command, [0, 3, 0, 2])) {
      const colls = JSON.parse(text)
      this.listDatabases.forEach(database => {
        if (database.name === colls.database) {
          const collection = colls.replace('\n', '')
          const collectionJSON = {}
          collectionJSON.name = collection.split(' ')[0]
          collectionJSON.type = collection.split(' ')[1]
          collectionJSON.urls.push(collection.split(' ')[2])
          database.children.push(collectionJSON)
        }
      })
    }
    // Get Collection
    if (tool.arrayEquals(command, [0, 2, 0, 8])) {
      const res = JSON.parse(text)
      finished(res)
    }
    // Save Collection
    if (tool.arrayEquals(command, [0, 2, 0, 10])) {
      console.log('Imported')
    }
    // Delete Database
    if (tool.arrayEquals(command, [0, 1, 0, 6])) {
      const db = JSON.parse(text)
      const databaseJSON = {}
      databaseJSON.name = db
      this.listDatabases.forEach(database => {
        if (database.name === databaseJSON.name) {
          this.listDatabases.pull(database)
        }
      })
    }
    // Delete Collection
    if (tool.arrayEquals(command, [0, 2, 0, 6])) {
      const colls = JSON.parse(text)
      this.listDatabases.forEach(database => {
        if (database.name === colls.database) {
          const collection = colls.replace('\n', '') // la risposta del server contiene degli \n che vengono rimossi
          const collectionJSON = {}
          collectionJSON.name = collection.split(' ')[0]
          collectionJSON.type = collection.split(' ')[1]
          collectionJSON.urls = collection.split(' ')[2]
          database.children.pull(collectionJSON)
        }
      })
    }
    // Remove Url
    if (tool.arrayEquals(command, [0, 3, 0, 4])) {
      const coll = JSON.parse(text)
      this.listDatabases.forEach(database => {
        if (database.name === coll.database) {
          const collection = coll.replace('\n', '')
          const collectionJSON = {}
          collectionJSON.name = collection.split(' ')[0]
          collectionJSON.type = collection.split(' ')[1]
          collectionJSON.urls = collection.split(' ')[2]
          for (let i = 0; i < collectionJSON.urls.length; i++) {
            if (i === coll.index) {
              collectionJSON.urls.pull(i)
              console.log('Removed')
            }
          }
        }
      })
    }
    /* Set Frequency
        if (tool.arrayEquals(command, [0, 4, 0, 2])) {
          const colls = JSON.parse(text)
          this.listDatabases.forEach(database => {
            if (database.name === colls.database) {
              const collection = colls.replace('\n', '') // la risposta del server contiene degli \n che vengono rimossi
              const collectionJSON = {}
              collectionJSON.name = collection.split(' ')[0]
              collectionJSON.type = collection.split(' ')[1]
              collectionJSON.urls = collection.split(' ')[2]
              collectionJSON[this.index].frequency = collection.split[3]
            }
          })
        }
        */
    if (tool.arrayEquals(command, [0, 0, 0, 2])) {
      if (text === '') {
        this.online = true
      } else {
        this.online = false
      }
    }
    // Get collection count
    if (tool.arrayEquals(command, [0, 2, 0, 12])) {
      const res = JSON.parse(text)
      console.log(res)
      finished(res.count)
    }
  }
}
