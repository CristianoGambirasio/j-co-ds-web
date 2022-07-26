<template>
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
          <v-card-text label="Name" id="nameDB" type="text"></v-card-text>
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" text @click="createDatabase('nameDB')">
          Create
        </v-btn>
        <v-btn color="primary" text @click="dialog = false">
          Close
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>

import * as tool from '../functions/tools'

export default {
  data () {
    return {
      id: Math.floor(Math.random() * 10),
      connection: null,
      listDatabases: [],
      dialog: false
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
          this.listDatabases.push(db)
        }
      }
    }
  },
  getListDatabase () {
    this.listDatabases = []
    this.connection.send('LIST_DATABASE')
    this.handleResponse()
  },

  createDatabase (item) {
    this.connection.send('CREATE_DATABASE###' + item)
    this.handleResponse()
  }
}

</script>
