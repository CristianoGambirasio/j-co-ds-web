import * as tool from './tools'
import * as consts from './constants'

export function getListDatabase () {
  this.listDatabases = []
  this.$root.$refs.Workspace.updateParam(null, null)
  this.connection.send(consts.WS_LIST_DATABASE)
  this.handleResponse()
};

export async function getListCollection (item) {
  this.colls = []
  return await new Promise(resolve => {
    this.connection.send(consts.WS_LIST_COLLECTION + '###' + item.name)
    const finished = resolve
    this.handleResponse(finished)
  })
};

export async function getListUrl (nameDb, nameColl) {
  this.listUrls = []
  let list
  await new Promise(resolve => {
    this.connection.send(consts.WS_LIST_URL + '###' + nameDb + '###' + nameColl)
    this.handleResponse(resolve)
  }).then((value) => {
    list = value
  })
  return list
};

export async function getCollectionCount (db, collection) {
  let countCollection
  await new Promise(resolve => {
    this.connection.send(consts.WS_GET_COLLECTION_COUNT + '###' + db + '###' + collection)
    const finishCount = resolve
    this.handleResponse(finishCount)
  }).then((value) => {
    countCollection = value
  })
  return countCollection
};

export function createDatabase (nameDb) {
  this.connection.send(consts.WS_CREATE_DATABASE + '###' + nameDb)
  this.handleResponse()
};

export function createCollection (nameDb, nameColl) {
  this.connection.send(consts.WS_CREATE_COLLECTION + '###' + nameDb + '###' + nameColl)
  this.handleResponse()
};

export function createDynamicCollection (nameDb, nameColl, listUrl) {
  this.connection.send(consts.WS_CREATE_DYNAMIC_COLLECTION + '###' + nameDb + '###' + nameColl + '###' + listUrl)
  this.handleResponse()
};

export function createVirtualCollection (nameDb, nameColl, listUrl) {
  this.connection.send(consts.WS_CREATE_VIRTUAL_COLLECTION + '###' + nameDb + '###' + nameColl + '###' + listUrl)
  this.handleResponse()
};

export function addUrl (nameDb, nameColl, listUrl) {
  this.connection.send(consts.WS_ADD_URL + '###' + nameDb + '###' + nameColl + '###' + listUrl)
  this.handleResponse()
};

export async function getCollection (nameDb, nameColl, limit, offset) {
  let documents
  await new Promise(resolve => {
    this.connection.send(consts.WS_GET_COLLECTION + '###' + nameDb + '###' + nameColl + '###' + limit + '###' + offset)
    const finish = resolve
    this.handleResponse(finish)
  }).then((value) => {
    documents = value
  })
  return documents
};

export function saveCollection (nameDb, nameColl, docs, append) {
  this.connection.send(consts.WS_SAVE_COLLECTION + '###' + nameDb + '###' + nameColl + '###' + docs + '###' + append)
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

export async function importCollection (item) {
  if (!item.db) {
    const fileInput = document.getElementById('file_upload').files[0]
    const nameC = fileInput.name.split('.')
    const nameColl = nameC[0]
    const fileread = new FileReader()
    await new Promise(resolve => {
      fileread.onload = function (e) {
        const content = e.target.result
        resolve(content)
      }
      fileread.readAsText(fileInput)
    }).then((res) => {
      this.saveCollection(item.name, nameColl, res, this.append)
    })
    this.handleResponse()
  } else {
    const fileInput = document.getElementById('file_upload').files[0]
    const nameC = fileInput.name.split('.')
    const nameColl = nameC[0]
    const fileread = new FileReader()
    await new Promise(resolve => {
      fileread.onload = function (e) {
        const content = e.target.result
        resolve(content)
      }
      fileread.readAsText(fileInput)
    }).then((res) => {
      if (!this.append) {
        this.saveCollection(item.db, nameColl, res, this.append)
      } else {
        this.saveCollection(item.db, item.name, res, this.append)
      }
    })
    this.handleResponse()
  }
};

export function setFrequency (nameDb, nameColl, index, frequency) {
  this.connection.send(consts.WS_SET_FREQUENCY + '###' + nameDb + '###' + nameColl + '###' + index + '###' + frequency)
  this.handleResponse()
};

export function setUpdateType (nameDb, nameColl, index, type) {
  this.connection.send(consts.WS_SET_UPDATE_TYPE + '###' + nameDb + '###' + nameColl + '###' + index + '###' + type)
  this.handleResponse()
};

export function stopUpdate (nameDb, nameColl) {
  this.connection.send(consts.WS_STOP_UPDATE + '###' + nameDb + '###' + nameColl)
  this.handleResponse()
};

export function deleteDatabase (nameDb) {
  this.connection.send(consts.WS_DELETE_DATABASE + '###' + nameDb)
  this.handleResponse()
};

export function deleteCollection (nameDb, nameColl) {
  this.connection.send(consts.WS_DELETE_COLLECTION + '###' + nameDb + '###' + nameColl)
  this.handleResponse()
};

export function deleteMoreCollections (colls) {
  for (let i = 0; i < colls.length; i++) {
    if (colls[i].type !== 'database') {
      console.log(colls[i].type)
      this.connection.send(consts.WS_DELETE_COLLECTION + '###' + colls[i].db + '###' + colls[i].name)
      this.handleResponse()
    }
  }
};

export function removeUrl (nameDb, nameColl, index) {
  this.connection.send(consts.WS_REMOVE_URL + '###' + nameDb + '###' + nameColl + '###' + index)
  this.handleResponse()
};

export function removeMoreUrls (nameDb, nameColl, indexes) {
  for (let i = 0; i < indexes.length; i++) {
    console.log(indexes[i])
    this.connection.send(consts.WS_REMOVE_URL + '###' + nameDb + '###' + nameColl + '###' + indexes[i])
    this.handleResponse()
  }
};

export function ping () {
  let errMessageSent = false
  this.connection.send(consts.WS_PING)
  setInterval(() => {
    if (this.connection === null || this.connection.readyState === 2 || this.connection.readyState === 3) {
      this.online = false
      if (!errMessageSent) {
        console.log('No connection')
      }
      errMessageSent = true
    } else {
      errMessageSent = false
      this.connection.send(consts.WS_PING)
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
    if (!tool.arrayEquals(command, consts.PING_RESPONSE)) {
      console.log('Command ' + command + ' recived')
    }
    // List Databases
    if (tool.arrayEquals(command, consts.LIST_DATABASE_RESPONSE)) {
      this.listDatabases = []
      const db = JSON.parse(text)
      db.databases.forEach(database => {
        const databaseJSON = {}
        databaseJSON.name = database
        databaseJSON.type = 'database'
        databaseJSON.children = []
        databaseJSON.id = databaseJSON.name
        this.listDatabases.push(databaseJSON)
      })
    }
    // List Collections
    if (tool.arrayEquals(command, consts.LIST_COLLECTION_RESPONSE)) {
      const colls = JSON.parse(text)
      this.listDatabases.forEach(database => {
        if (database.name === colls.database) {
          colls.collections.forEach(collection => {
            collection = collection.replace('\n', '') // la risposta del server contiene degli \n che vengono rimossi
            const collectionJSON = {}
            collectionJSON.name = collection.split(' ')[0]
            collectionJSON.type = collection.split(' ')[1]
            collectionJSON.db = database.name
            collectionJSON.id = collectionJSON.db + collectionJSON.name
            database.children.push(collectionJSON)
          })
        }
      })
      finished()
    }
    // List Urls
    if (tool.arrayEquals(command, consts.LIST_URL_RESPONSE)) {
      this.listUrls = []
      const urls = JSON.parse(text)
      urls.list.forEach(url => {
        url = url.replace('\n', '')
        this.listUrls.push(url)
      })
      finished(this.listUrls)
    }
    // Create Database
    if (tool.arrayEquals(command, consts.CREATE_DATABASE_RESPONSE)) {
      const db = JSON.parse(text)
      const databaseJSON = {}
      databaseJSON.name = db
      databaseJSON.type = 'database'
      databaseJSON.children = []
      this.listDatabases.push(databaseJSON)
    }
    // Create Collection
    if (tool.arrayEquals(command, consts.CREATE_COLLECTION_RESPONSE)) {
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
    if (tool.arrayEquals(command, consts.CREATE_DYNAMIC_COLLECTION_RESPONSE)) {
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
    if (tool.arrayEquals(command, consts.CREATE_VIRTUAL_COLLECTION_RESPONSE)) {
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
    if (tool.arrayEquals(command, consts.ADD_URL_RESPONSE)) {
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
    if (tool.arrayEquals(command, consts.GET_COLLECTION_RESPONSE)) {
      const res = JSON.parse(text)
      finished(res)
    }
    // Save Collection
    if (tool.arrayEquals(command, consts.SAVE_COLLECTION_RESPONSE)) {
      console.log('Imported')
    }
    // Delete Database
    if (tool.arrayEquals(command, consts.DELETE_DATABASE_RESPONSE)) {
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
    if (tool.arrayEquals(command, consts.DELETE_COLLECTION_RESPONSE)) {
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
    if (tool.arrayEquals(command, consts.REMOVE_URL_RESPONSE)) {
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
            }
          }
        }
      })
    }
    // Set Frequency
    if (tool.arrayEquals(command, consts.SET_FREQUENCY_RESPONSE)) {
      console.log('Frequency updated')
    }
    // Set Update Type
    if (tool.arrayEquals(command, consts.SET_UPDATE_TYPE_RESPONSE)) {
      console.log('Updated dynamic update type')
    }
    if (tool.arrayEquals(command, consts.STOP_UPDATE_RESPONSE)) {
      console.log('Stopped update')
    }
    // Ping
    if (tool.arrayEquals(command, consts.PING_RESPONSE)) {
      if (text === '') {
        this.online = true
      } else {
        this.online = false
      }
    }
    // Get collection count
    if (tool.arrayEquals(command, consts.GET_COLLECTION_COUNT_RESPONSE)) {
      const res = JSON.parse(text)
      finished(res.count)
    }
  }
}
