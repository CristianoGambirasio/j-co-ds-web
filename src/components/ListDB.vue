<template>
  <v-sheet id="body">
    <v-row style="height: 7vh;">
      <v-col cols="8">
        <h2 style="color: #7FCD91; font-size: 1.2vw;">DATABASE LIST:</h2>
      </v-col>
      <v-col cols="4">
        <v-btn
        max-width=""
        rounded
        depressed
        color=#5B5656
        dark
          @click="getListDatabase()"
          >
            <v-icon>
              mdi-refresh
            </v-icon>
        </v-btn>
      </v-col>
    </v-row>
    <v-row style="height: 6vh;">
      <v-text-field
        style="padding: 10px;"
        background-color=#5B5656
        v-model="search"
        label="Search..."
        flat
        dark
        solo
        hide-details
        clearable
        clear-icon="mdi-close-circle-outline"
      ></v-text-field>
    </v-row>
    <v-row style="height: 71vh;">
    <v-col style="padding: 0px;">
      <v-container style="max-height: 70vh; padding: 0px; padding-top: 10px;" class="overflow-y-auto">
        <v-treeview
            dark
            :items="listDatabases"
            :load-children="getListCollection"
            :search='search'
            :filter='filter'
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
      </v-container>
    </v-col>
    </v-row>
    <v-row style="height: 10vh;">
      <v-container id="meta">
        <v-row style="height: 5vh;">
          <v-col cols="6" id="meta1">
            {{online}}
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
      online: false,
      searchKeySensitive: true,
      search: null,
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
  computed: {
    filter () {
      return this.searchKeySensitive
        ? (item, search, textKey) => item[textKey].indexOf(search) > -1
        : undefined
    }
  },
  mounted () {
    this.connection = new WebSocket('ws://' + window.location.hostname + ':3000', this.id)
    this.connection.onopen = () => {
      this.ping()
      this.getListDatabase()
      this.handleResponse()
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
        if (!tool.arrayEquals(command, [0, 0, 0, 2])) {
          console.log('Command ' + command + ' recived')
        }
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
        if (tool.arrayEquals(command, [0, 0, 0, 2])) {
          if (text === '') {
            this.online = true
          } else {
            this.online = false
          }
        }
      }
    },
    getListDatabase () {
      this.listDatabases = []
      this.connection.send('LIST_DATABASE')
    },

    async getListCollection (item) {
      return await new Promise(resolve => {
        this.connection.send('LIST_COLLECTIONS###' + item.name)
        const finished = resolve
        this.handleResponse(finished)
      })
    },
    ping () {
      this.connection.send('PING')
      setInterval(() => {
        if (this.connection.readyState === 2 || this.connection.readyState === 3) {
          this.online = false
          console.log('Web Socket is closed')
        } else {
          this.connection.send('PING')
        }
      }
      , 1000)
    }
  }
}
</script>

<style>
#meta{
  padding: 0px;
}

#meta1{
  background-color: #5B5656
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
  background-color: #4D4646;
}

.v-treeview-node__root{
  padding-left: 0px;
}

.v-treeview-node__level{
  width: 15px;
}

::-webkit-scrollbar {
  width: 10px;
}

::-webkit-scrollbar-track {
  background: #4D4646
}

::-webkit-scrollbar-thumb {
  background: #7FCD91
}

</style>
