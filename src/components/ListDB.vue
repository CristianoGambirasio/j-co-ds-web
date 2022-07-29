<template>
  <v-sheet id="body">
    <v-row style="height: 5vh;">
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
            activatable
            :items="listDatabases"
            :load-children="getListCollection"
            :search='search'
            :filter='filter'
            item-key="name"
            open-on-click
            transition
            return-object
            active-class="activeNode"
            @update:active="showMetadata"
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
        <v-row style="height: 50%;" class="ma-0 pa-0">
            <v-col cols="6" id="meta1" style="padding: 0px;" class="d-flex align-center text-truncate">
              <h5>{{metaTL}}</h5>
            </v-col>
            <v-col cols="6" id="meta2" style="padding: 0px;">
            <v-container v-if="online" style="padding: 7px;"  fill-height>
              <v-btn
              depressed
              block
              style="background-color: green; padding: 0px; height: 100%;"
              >
                ONLINE
                <v-icon>
                  mdi-access-point-check
                </v-icon>
              </v-btn>
            </v-container>
            <v-container v-else style="padding: 7px;" fill-height>
              <v-btn
              depressed
              block
              style="background-color: red; padding: 0px;"
              @click="connect()"
              >
                OFFLINE
                <v-icon>
                  mdi-access-point-remove
                </v-icon>
              </v-btn>
            </v-container>
            </v-col>
        </v-row>
        <v-row v-if="isActive" style="height: 50%;">
          <v-col cols="6" id="meta3" style="padding: 0px;" class="d-flex align-center text-truncate">
            <h5>{{metaBL}}</h5>
          </v-col>
          <v-col cols="6" id="meta4" style="padding: 0px;" class="d-flex align-center text-truncate">
            <h5>{{metaBR}}</h5>
          </v-col>
        </v-row>
        <v-row v-else style="height: 50%;">
          <v-col cols="6" id="meta3" style="padding: 0px;" class="d-flex align-center">
            <h4>{{nDB}} DATABASES</h4>
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
      metaTL: null,
      metaBL: null,
      metaBR: null,
      active: false,
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
    },
    isActive () {
      return this.active
    },
    nDB () {
      return this.listDatabases.length
    }
  },
  mounted () {
    this.connect()
  },
  methods: {
    connect () {
      this.connection = new WebSocket('ws://' + window.location.hostname + ':3000', this.id)
      this.connection.onopen = () => {
        console.log('Connecting...')
        this.ping()
        this.getListDatabase()
        this.handleResponse()
      }
    },
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
                collectionJSON.db = database.name
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
        if (tool.arrayEquals(command, [0, 2, 0, 12])) {
          console.log('recived')
          const res = JSON.parse(text)
          finished(res.count)
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
    async getCollectionCount (db, collection) {
      let countCollection
      await new Promise(resolve => {
        this.connection.send('GET_COLLECTION_COUNT###' + db + '###' + collection)
        const finish = resolve
        this.handleResponse(finish)
      }).then((value) => {
        countCollection = value
      })
      return countCollection
    },
    async showMetadata (value) {
      if (value.length === 0) {
        this.active = false
      } else {
        this.active = true
      }
      console.log(value)
      let countCollection
      if (value.length > 0 && (value[0].type === 'static' || 'virtual' || 'dynamic')) {
        countCollection = await this.getCollectionCount(value[0].db, value[0].name)
      }

      if (value.length === 0) {
        this.metaTL = null
        this.metaBL = null
      } else if (value[0].type === 'static') {
        this.metaTL = 'TYPE: STATIC'
        this.metaBL = 'NAME: ' + value[0].name
        this.metaBR = 'Documents: ' + countCollection
      } else if (value[0].type === 'dynamic') {
        this.metaTL = 'TYPE: DYNAMIC'
        this.metaBL = 'NAME: ' + value[0].name
        this.metaBR = 'Documents: ' + countCollection
      } else if (value[0].type === 'virtual') {
        this.metaTL = 'TYPE: VIRTUAL'
        this.metaBL = 'NAME: ' + value[0].name
        this.metaBR = 'Documents: ' + countCollection
        // Gestione database | Stile select
      }
    },
    ping () {
      /* let errMessageSent = false
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
      , 1000) */
    }
  }
}
</script>

<style>

.activeNode{
  background-color: #5B5656;
}

h5{
  color: white;
  padding: 8px;
}
#meta{
  padding: 0px;
  background-color: #5B5656
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
