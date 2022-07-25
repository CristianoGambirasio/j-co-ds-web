<template>
  <v-sheet id="body">
    <v-row style="height: 5vh;">
      <v-col cols="6">
        Database List:
      </v-col>
      <v-col cols="6">
        <v-btn
          fab
          @click="getListDatabase()"
          >
            <v-icon>
              mdi-refresh
            </v-icon>
        </v-btn>
      </v-col>
    </v-row>
    <v-row style="height: 77vh;">
    <v-col style="padding: 0px;">
        <v-treeview
            :items="listDatabases"
            :load-children="getListCollection"
            open-on-click
            item-key="name"
          transition
          >
          <template v-slot:prepend="{item,open}">
            <v-icon>
              {{open ? iconOpen[item.type] : icon[item.type]}}
            </v-icon>
          </template>
        </v-treeview>
    </v-col>
    </v-row>
    <v-row style="height: 10vh;">
      <v-container id="meta">
        <v-row style="height: 5vh;">
          <v-col cols="6" id="meta1">
          </v-col>
          <v-col cols="6" id="meta2">
          </v-col>
        </v-row>
        <v-row style="height: 5vh;">
          <v-col id="meta3">

          </v-col>
          <v-col id="meta4">

          </v-col>
        </v-row>
      </v-container>
    </v-row>
  </v-sheet>
</template>

<script>

import * as tool from '../functions/tools'

export default {
  data () {
    return {
      id: Math.floor(Math.random() * 10),
      connection: null,
      listDatabases: [],
      icon: {
        database: 'mdi-database',
        static: 'mdi-folder',
        dynamic: 'mdi-folder-sync',
        virtual: 'mdi-folder-search'
      },
      iconOpen: {
        database: 'mdi-database-eye',
        static: 'mdi-folder-outline',
        dynamic: 'mdi-folder-sync-outline',
        virtual: 'mdi-folder-search-outline'
      }
    }
  },
  mounted () {
    this.connection = new WebSocket('ws://' + window.location.hostname + ':3000', this.id)
    this.connection.onopen = () => {
      this.getListDatabase()
    }
  },
  methods: {
    handleResponse (finished) {
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
        // Collection List response
        if (tool.arrayEquals(command, [0, 2, 0, 2])) {
          const colls = JSON.parse(text)
          this.listDatabases.forEach(database => {
            if (database.name === colls.database) {
              colls.collections.forEach(collection => {
                collection = collection.replace('\n', '') // la risposta del server contiene degli \n che vengono rimossi
                const collectionJSON = {}
                collectionJSON.name = collection.split(' ')[0]
                collectionJSON.type = collection.split(' ')[1]
                database.children.push(collectionJSON)
              })
            }
          })
          finished()
        }
      }
    },
    getListDatabase () {
      this.listDatabases = []
      this.connection.send('LIST_DATABASE')
      this.handleResponse()
    },

    async getListCollection (item) {
      return await new Promise(resolve => {
        this.connection.send('LIST_COLLECTIONS###' + item.name)
        const finished = resolve
        this.handleResponse(finished)
      })
    }
  }
}
</script>

<style>
#meta{
  padding: 0px;
}

#meta1{
  background-color: aqua;
}

#meta2{
  background-color: blue;
}

#meta3{
  background-color: brown;
}

#meta4{
  background-color: salmon;
}

#body{
  background-color: lightgrey;
}

.v-treeview-node__root{
  padding-left: 0px;
}

.v-treeview-node__level{
  width: 15px;
}

</style>
