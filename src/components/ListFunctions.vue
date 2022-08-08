<template>
  <v-row fixed>
    <v-dialog v-model="dialogDb" width="600" id="topbar-dialog">
      <template v-slot:activator="{ on }">
        <v-btn v-on="on" id="topbar-btn">
          <v-icon>mdi-database-check</v-icon>
          Create Database
        </v-btn>
      </template>
      <v-card>
        <v-card-title>Creating new database</v-card-title>
        <v-card-text>
          <v-form>
            <v-text-field label="Name" v-model="nameDB" required type="text"></v-text-field>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="createDatabase(nameDB); dialogDb = false">
            Create
          </v-btn>
          <v-btn text @click="dialogDb = false">
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    &nbsp;&nbsp;

    <v-dialog v-model="dialogColl" width="700" id="topbar-dialog">
      <template v-slot:activator="{ on }">
        <v-btn v-on="on" id="topbar-btn">
          <v-icon>mdi-note-check</v-icon>
          Create Collection
        </v-btn>
      </template>
      <v-card>
        <v-card-title>Creating new collection</v-card-title>
        <v-card-text>
          <v-form>
            <v-select label="Type" v-model="type" :items="items"></v-select>
            <v-text-field label="Database" v-model="nameDB" required type="text"></v-text-field>
            <v-text-field label="Collection" v-model="nameColl" required type="text"></v-text-field>
            <v-text-field v-if="type === 'Dynamic' || type === 'Virtual'" label="Url" v-model="listUrl" required
              type="text">
            </v-text-field>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn v-if="type === 'Standard'" text @click="createCollection(nameDB, nameColl); dialogColl = false">
            Create
          </v-btn>
          <v-btn v-else-if="type === 'Dynamic'" text
            @click="createDynamicCollection(nameDB, nameColl, listUrl); dialogColl = false">
            Create
          </v-btn>
          <v-btn v-else text @click="createVirtualCollection(nameDB, nameColl, listUrl); dialogColl = false">
            Create
          </v-btn>
          <v-btn text @click="dialogColl = false">
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    &nbsp;&nbsp;

    <v-dialog v-model="dialogUrl" width="600" id="topbar-dialog">
      <template v-slot:activator="{ on }">
        <v-btn v-on="on" id="topbar-btn">
          <v-icon>mdi-file-link</v-icon>
          Add Url
        </v-btn>
      </template>
      <v-card>
        <v-card-title>Adding Url</v-card-title>
        <v-card-text>
          <v-form>
            <v-text-field label="Database" v-model="nameDB" required type="text"></v-text-field>
            <v-text-field label="Collection" v-model="nameColl" required type="text"></v-text-field>
            <v-text-field label="Url" v-model="listUrl" required type="text"></v-text-field>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="addUrl(nameDB, nameColl, listUrl); dialogUrl = false">
            Add
          </v-btn>
          <v-btn color="primary" text @click="dialogUrl = false">
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    &nbsp;&nbsp;

    <v-dialog v-model="dialogExp" width="600" id="topbar-dialog">
      <template v-slot:activator="{ on }">
        <v-btn v-on="on" id="topbar-btn">
          <v-icon>mdi-database-export</v-icon>
          Export Collection
        </v-btn>
      </template>
      <v-card>
        <v-card-title>
          Exporting collection
          <v-btn absolute right depressed plain light @click=" dialogExp=false" style="color: red">
            <v-icon absolute right>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          <v-form>
            <v-text-field label="Database" v-model="nameDB" required type="text"></v-text-field>
            <v-text-field label="Collection" v-model="nameColl" required type="text"></v-text-field>
            <v-text-field label="File" hint="Without file extension" v-model="nameFile" required type="text">
            </v-text-field>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="exportCollection(nameDB, nameColl, nameFile); dialogExp = false">
            Download
          </v-btn>
          <v-btn color="primary" text @click="dialogExp = false">
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script>

import * as tool from '../functions/tools'

export default {
  data () {
    return {
      nameDB: '',
      nameColl: '',
      nameFile: '',
      listUrl: '',
      limit: '-1',
      offset: '0',
      type: '',
      id: Math.floor(Math.random() * 10),
      connection: null,
      listDatabases: [],
      dialogDb: false,
      dialogColl: false,
      dialogUrl: false,
      dialogExp: false,
      items: ['Standard', 'Dynamic', 'Virtual']
    }
  },
  methods: {
    handleResponse () {
      this.connection.onmessage = async (message) => {
        const dataBuffer = await message.data.arrayBuffer()
        let data = new Uint8Array(dataBuffer)
        const command = data.slice(0, 4)
        data = data.slice(12)
        const text = String.fromCharCode(...data)
        if (!tool.arrayEquals(command, [0, 0, 0, 2])) {
          console.log('Command ' + command + ' recived')
        }
        // List Databases
        if (tool.arrayEquals(command, [0, 1, 0, 2])) {
          const db = JSON.parse(text)
          db.databases.forEach(database => {
            const databaseJSON = {}
            databaseJSON.name = database
            databaseJSON.type = 'database'
            databaseJSON.children = []
            this.listDatabases.push(databaseJSON)
          })
        }
        // Create Database
        if (tool.arrayEquals(command, [0, 1, 0, 3])) {
          const db = JSON.parse(text)
          const databaseJSON = {}
          databaseJSON.name = db
          databaseJSON.type = 'database'
          databaseJSON.children = []
          this.listDatabases.push(databaseJSON)
        }
        // Create Collection
        if (tool.arrayEquals(command, [0, 2, 0, 3])) {
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
        if (tool.arrayEquals(command, [0, 2, 0, 23])) {
          const colls = JSON.parse(text)
          this.listDatabases.forEach(database => {
            if (database.name === colls.database) {
              const collection = colls.replace('\n', '')
              const collectionJSON = {}
              collectionJSON.name = collection.split(' ')[0]
              collectionJSON.type = collection.split(' ')[1]
              collectionJSON.url = collection.split(' ')[2]
              database.children.push(collectionJSON)
            }
          })
        }
        // Create Virtual Collection
        if (tool.arrayEquals(command, [0, 2, 0, 13])) {
          const colls = JSON.parse(text)
          this.listDatabases.forEach(database => {
            if (database.name === colls.database) {
              const collection = colls.replace('\n', '')
              const collectionJSON = {}
              collectionJSON.name = collection.split(' ')[0]
              collectionJSON.type = collection.split(' ')[1]
              collectionJSON.url = collection.split(' ')[2]
              database.children.push(collectionJSON)
            }
          })
        }
        // Add Url
        if (tool.arrayEquals(command, [0, 3, 0, 1])) {
          const colls = JSON.parse(text)
          this.listDatabases.forEach(database => {
            if (database.name === colls.database) {
              const collection = colls.replace('\n', '')
              const collectionJSON = {}
              collectionJSON.name = collection.split(' ')[0]
              collectionJSON.type = collection.split(' ')[1]
              collectionJSON.url.push(collection.split(' ')[2])
              database.children.push(collectionJSON)
            }
          })
        }
      }
    },
    getListDatabase () {
      this.listDatabases = []
      this.connection.send('LIST_DATABASE')
      this.handleResponse()
    },

    createDatabase (nameDB) {
      this.connection.send('CREATE_DATABASE###' + nameDB)
      this.handleResponse()
    },

    createCollection (nameDB, nameColl) {
      this.connection.send('CREATE_COLLECTION###' + nameDB + '###' + nameColl)
      this.handleResponse()
    },

    createDynamicCollection (nameDB, nameColl, listUrl) {
      this.connection.send('CREATE_DYNAMIC_COLLECTION###' + nameDB + '###' + nameColl + '###' + listUrl)
      this.handleResponse()
    },

    createVirtualCollection (nameDB, nameColl, listUrl) {
      this.connection.send('CREATE_VIRTUAL_COLLECTION###' + nameDB + '###' + nameColl + '###' + listUrl)
      this.handleResponse()
    },

    addUrl (nameDB, nameColl, listUrl) {
      this.connection.send('ADD_URL###' + nameDB + '###' + nameColl + '###' + listUrl)
      this.handleResponse()
    },

    getCollection (nameDb, nameColl, limit, offset) {
      this.connection.send('GET_COLLECTION###' + nameDb + '###' + nameColl + '###' + limit + '###' + offset)
      this.handleResponse()
    },

    exportCollection (nameDb, nameColl, nameFile) {
      const coll = this.getCollection(nameDb, nameColl, this.limit, this.offset)
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(coll))
      const downloadAnchorNode = document.createElement('a')
      downloadAnchorNode.setAttribute('href', dataStr)
      downloadAnchorNode.setAttribute('download', nameFile + '.json')
      document.body.appendChild(downloadAnchorNode) // required for firefox
      downloadAnchorNode.click()
      downloadAnchorNode.remove()
    }
  }
}

</script>

<style scoped>

.v-btn__content {
  display: flex;
  flex-direction: column;
}

#topbar-btn {
  background-color: lightgreen;
  height: 75px;
  width: fit-content;
}
</style>
