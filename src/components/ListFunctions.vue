<template>
  <v-col cols="auto">
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
          <v-btn color="primary" text @click="createDatabase(nameDB)">
            Create
          </v-btn>
          <v-btn color="primary" text @click="dialog = false">
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    &nbsp;&nbsp;

    <v-dialog v-model="dialog1" width="600">
      <template v-slot:activator="{ on }">
        <v-btn v-on="on">
          <v-icon left>mdi-plus</v-icon>
          Create Collection
        </v-btn>
      </template>
      <v-card>
        <v-card-title>Creating new collection</v-card-title>
        <v-card-text>
          <v-form>
            <v-select
            label="Tipologia"
            :items="select"
            item-value="text"
            ></v-select>
            <v-text-field label="Database name" v-model="nameDB" required type="text"></v-text-field>
            <v-text-field label="Collection name" v-model="nameColl" required type="text"></v-text-field>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="createCollection(nameDB, nameColl)">
            Create
          </v-btn>
          <v-btn color="primary" text @click="dialog1 = false">
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    &nbsp;&nbsp;

    <v-dialog v-model="dialog2" width="600">
      <template v-slot:activator="{ on }">
        <v-btn v-on="on">
          <v-icon left>mdi-plus</v-icon>
          Create Dynamic Collection
        </v-btn>
      </template>
      <v-card>
        <v-card-title>Creating new dynamic collection</v-card-title>
        <v-card-text>
          <v-form>
            <v-text-field label="Database name" v-model="nameDB" required type="text"></v-text-field>
            <v-text-field label="Collection name" v-model="nameColl" required type="text"></v-text-field>
            <v-text-field label="Url name" v-model="nameUrl" required type="text"></v-text-field>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="createDynamicCollection(nameDB, nameColl, nameUrl)">
            Create
          </v-btn>
          <v-btn color="primary" text @click="dialog2 = false">
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-col>
</template>

<script>

import * as tool from '../functions/tools'

export default {
  data () {
    return {
      nameDB: '',
      nameColl: '',
      nameUrl: '',
      id: Math.floor(Math.random() * 10),
      connection: null,
      listDatabases: [],
      dialog: false,
      dialog1: false,
      dialog2: false,
      select: [
        { text: 'Standard' },
        { text: 'Dynamic' },
        { text: 'Virtual' }
      ]
    }
  },
  mounted () {
    this.connection = new WebSocket('ws://' + window.location.hostname + ':3000', this.id)
    this.connection.onopen = () => {
      this.getListDatabase()
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
        console.log(text)
        // DB List response
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
              const collection = colls.replace('\n', '') // la risposta del server contiene degli \n che vengono rimossi
              const collectionJSON = {}
              collectionJSON.name = collection.split(' ')[0]
              collectionJSON.type = collection.split(' ')[2]
              collectionJSON.url = collection.split(' ')[1]
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

    createDynamicCollection (nameDB, nameColl, nameUrl) {
      this.connection.send('CREATE_COLLECTION###' + nameDB + '###' + nameColl + '###' + nameUrl)
      this.handleResponse()
    }
  }
}

</script>
