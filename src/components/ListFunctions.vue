<template>
  <v-row>
    <v-dialog v-model="dialog" width="600">
      <template v-slot:activator="{ on }">
        <v-btn v-on="on">
          <v-icon left>mdi-plus</v-icon>
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
          <v-btn text @click="createDatabase(nameDB); dialog = false">
            Create
          </v-btn>
          <v-btn text @click="dialog = false">
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    &nbsp;&nbsp;

    <v-menu offset-y>
      <template v-slot:activator="{ on }">
        <v-btn v-on="on">
          <v-icon left>mdi-plus</v-icon>
          Create Collection
        </v-btn>
      </template>
      <v-list>
        <v-list-item>
          <v-dialog v-model="dialog1" width="600">
            <template v-slot:activator="{ on }">
              <v-btn v-on="on">
                <v-icon left>mdi-plus</v-icon>
                Standard
              </v-btn>
            </template>
            <v-card>
              <v-card-title>Creating new collection</v-card-title>
              <v-card-text>
                <v-form>
                  <v-text-field label="Database name" v-model="nameDB" required type="text"></v-text-field>
                  <v-text-field label="Collection name" v-model="nameColl" required type="text"></v-text-field>
                </v-form>
              </v-card-text>

              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="primary" text @click="createCollection(nameDB, nameColl); dialog1 = false">
                  Create
                </v-btn>
                <v-btn color="primary" text @click="dialog = false">
                  Close
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-list-item>

        <v-list-item>
          <v-dialog v-model="dialog2" width="600">
            <template v-slot:activator="{ on }">
              <v-btn v-on="on">
                <v-icon left>mdi-plus</v-icon>
                Dynamic
              </v-btn>
            </template>
            <v-card>
              <v-card-title>Creating new dynamic collection</v-card-title>
              <v-card-text>
                <v-form>
                  <v-text-field label="Database name" v-model="nameDB" required type="text"></v-text-field>
                  <v-text-field label="Collection name" v-model="nameColl" required type="text"></v-text-field>
                  <v-text-field label="Urls list" v-model="listUrl" required type="text"></v-text-field>
                </v-form>
              </v-card-text>

              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="primary" text
                  @click="createDynamicCollection(nameDB, nameColl, listUrl); dialog2 = false">
                  Create
                </v-btn>
                <v-btn color="primary" text @click="dialog2 = false">
                  Close
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-list-item>

        <v-list-item>
          <v-dialog v-model="dialog3" width="600">
            <template v-slot:activator="{ on }">
              <v-btn v-on="on">
                <v-icon left>mdi-plus</v-icon>
                Virtual
              </v-btn>
            </template>
            <v-card>
              <v-card-title>Creating new virtual collection</v-card-title>
              <v-card-text>
                <v-form>
                  <v-text-field label="Database name" v-model="nameDB" required type="text"></v-text-field>
                  <v-text-field label="Collection name" v-model="nameColl" required type="text"></v-text-field>
                  <v-text-field label="Urls list" v-model="listUrl" required type="text"></v-text-field>
                </v-form>
              </v-card-text>

              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="primary" text
                  @click="createVirtualCollection(nameDB, nameColl, listUrl); dialog3 = false">
                  Create
                </v-btn>
                <v-btn color="primary" text @click="dialog3 = false">
                  Close
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-list-item>
      </v-list>
    </v-menu>

    &nbsp;&nbsp;

    <v-dialog v-model="dialog4" width="600">
      <template v-slot:activator="{ on }">
        <v-btn v-on="on">
          <v-icon left>mdi-plus</v-icon>
          Add Url
        </v-btn>
      </template>
      <v-card>
        <v-card-title>Adding Url</v-card-title>
        <v-card-text>
          <v-form>
            <v-text-field label="Database name" v-model="nameDB" required type="text"></v-text-field>
            <v-text-field label="Collection name" v-model="nameColl" required type="text"></v-text-field>
            <v-text-field label="Url list" v-model="listUrl" required type="text"></v-text-field>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="addUrl(nameDB, nameColl, listUrl); dialog4 = false">
            Create
          </v-btn>
          <v-btn color="primary" text @click="dialog4 = false">
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    &nbsp;&nbsp;

    <v-dialog v-model="dialog5" width="600">
      <template v-slot:activator="{ on }">
        <v-btn v-on="on">
          <v-icon left>mdi-plus</v-icon>
          Export Collection
        </v-btn>
      </template>
      <v-card>
        <v-card-title>Exporting collection</v-card-title>
        <v-card-text>
          <v-form>
            <v-text-field label="Database name" v-model="nameDB" required type="text"></v-text-field>
            <v-text-field label="Collection name" v-model="nameColl" required type="text"></v-text-field>
            <v-text-field label="Offset" hint="Default is 0" v-model="offset" required type="text"></v-text-field>
            <v-text-field label="Limit" hint="Default is -1" v-model="limit" required type="text"></v-text-field>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="getCollection(nameDB, offset, limit, nameColl); dialog5 = false">
            Download
          </v-btn>
          <v-btn color="primary" text @click="dialog5 = false">
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
      listUrl: '',
      limit: '',
      offset: '',
      id: Math.floor(Math.random() * 10),
      connection: null,
      listDatabases: [],
      dialog: false,
      dialog1: false,
      dialog2: false,
      dialog3: false,
      dialog4: false,
      dialog5: false
    }
  },
  mounted () {
    this.connection = new WebSocket('ws://' + window.location.hostname + ':3000', this.id)
    this.connection.onopen = () => {
      this.getListDatabase()
      this.handleResponse()
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
    }
  }
}

</script>

<style>
</style>
