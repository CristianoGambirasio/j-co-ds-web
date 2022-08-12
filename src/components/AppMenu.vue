<template>
  <v-sheet id="body">
    <v-row style="height: 10vh;">
      <v-container id="meta">
        <v-row style="height: 50%;" class="ma-0 pa-0">
          <v-col cols="6" id="meta1" style="padding: 0px;" class="d-flex align-center text-truncate">
            <h5>{{metaTL}}</h5>
          </v-col>
          <v-col cols="6" id="meta2" style="padding: 0px;">
            <v-container v-if="online" style="padding: 7px;" fill-height>
              <v-btn depressed block style="background-color: green; padding: 0px; height: 100%;">
                ONLINE
                <v-icon>
                  mdi-access-point-check
                </v-icon>
              </v-btn>
            </v-container>
            <v-container v-else style="padding: 7px;" fill-height>
              <v-btn depressed block style="background-color: red; padding: 0px;" @click="connect()">
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
          <v-col cols="7" id="meta3" style="padding: 0px;" class="d-flex align-center">
            <h4>{{nDB}} DATABASES</h4>
          </v-col>
        </v-row>
      </v-container>
    </v-row>
    <v-row style="height: 7vh; padding-top: 4%;">
      <v-col cols="9">
        <h2 class="ml-n2" style="color: #7FCD91; font-size: 1.2vw;">DATABASE LIST:</h2>
      </v-col>
    </v-row>
    <v-row style="height: 12vh;">
      <v-text-field style="padding: 5px" background-color=#5B5656 v-model="search" label="Search..." flat dark solo
        hide-details clearable clear-icon="mdi-close-circle-outline"></v-text-field>
          <v-btn class="ml-1" height="25px" rounded depressed color=#5B5656 dark @click="getListDatabase()">
            <v-icon>mdi-refresh</v-icon>
          </v-btn>
      <v-dialog v-model="dialogDb" width="600">
        <template v-slot:activator="{ on }">
          <v-btn class="ml-1" v-on="on" height="25px" rounded depressed color=#5B5656 dark>
            <v-icon>mdi-plus</v-icon>
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
            <v-btn text @click="createDatabase(nameDB); getListDatabase(); dialogDb = false">
              Create
            </v-btn>
            <v-btn text @click="dialogDb = false">
              Close
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-dialog v-model="dialogDelDb" width="600">
        <template v-slot:activator="{ on }">
          <v-btn class="ml-1" v-on="on" height="25px" rounded depressed color=#5B5656 dark>
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </template>
        <v-card>
          <v-card-title>Deleting database</v-card-title>
          <v-card-text>
            <v-form>
              <v-text-field label="Name" v-model="nameDB" required type="text"></v-text-field>
            </v-form>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text @click="deleteDatabase(nameDB); getListDatabase(); dialogDelDb = false">
              Delete
            </v-btn>
            <v-btn text @click="dialogDelDb = false">
              Close
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-row>

    <v-row style="height: 71vh;">
      <v-col style="padding: 0px">
        <v-container style="max-height: 70vh; padding: 0px; padding-top: 10px">
          <v-treeview dark activatable hoverable :items="listDatabases" :load-children="getListCollection"
            :search='search' :filter='filter' item-key="name" open-on-click transition return-object
            active-class="activeNode" @update:active="showMetadata">
            <template v-slot:prepend="{item,open}">
              <v-icon>
                {{open ? iconOpen[item.type] : icon[item.type]}}
              </v-icon>
            </template>
            <template v-slot:append="{item}">
              <v-menu bottom :offset-x="true">
                <template v-slot:activator="{ on }">
                  <v-hover v-slot="{ hover }">
                    <v-btn dark icon v-on="on">
                      <v-icon v-if="hover">mdi-dots-vertical</v-icon>
                    </v-btn>
                  </v-hover>
                </template>

                <v-list>
                  <v-list-item>
                    <v-dialog v-if="item.type === 'database'" v-model="dialogDelDb0" width="250">
                      <template v-slot:activator="{ on }">
                        <v-btn v-on="on">
                          <v-icon>mdi-close</v-icon>
                          Delete Database
                        </v-btn>
                      </template>
                      <v-card>
                        <v-card-title>Are you sure?</v-card-title>
                        <v-card-actions>
                          <v-dialog v-model="dialogDelDb1" width="400">
                            <template v-slot:activator="{ on }">
                              <v-btn v-on="on">Yes</v-btn>
                            </template>
                            <v-card>
                              <v-card-title>Really?!</v-card-title>
                              <v-card-actions>
                                <v-btn @click="deleteDatabase(item.name); dialogDelDb0 = false; dialogDelDb1 = false">
                                  Delete database
                                </v-btn>
                                <v-spacer></v-spacer>
                                <v-btn @click="dialogDelDb0 = false; dialogDelDb1 = false">
                                  Cancel
                                </v-btn>
                              </v-card-actions>
                            </v-card>
                          </v-dialog>
                          <v-spacer></v-spacer>
                          <v-btn v-on="on" @click="dialogDelDb0 = false">
                            No
                          </v-btn>
                        </v-card-actions>
                      </v-card>
                    </v-dialog>
                  </v-list-item>

                  <v-list-item>
                    <v-dialog v-if="item.type === 'database'" v-model="dialogColl" width="700">
                      <template v-slot:activator="{ on }">
                        <v-btn v-on="on">
                          <v-icon>mdi-note-check</v-icon>
                          Create Collection
                        </v-btn>
                      </template>
                      <v-card>
                        <v-card-title>Creating new collection</v-card-title>
                        <v-card-text>
                          <v-form>
                            <v-text-field label='Database' v-model=item.name disabled></v-text-field>
                            <v-text-field label="Collection" v-model="nameColl" required type="text"></v-text-field>
                            <v-select label="Type" v-model="type" :items="items"></v-select>
                            <v-text-field v-if="type === 'Dynamic' || type === 'Virtual'" label="Url" v-model="listUrl"
                              required type="text">
                            </v-text-field>
                          </v-form>
                        </v-card-text>

                        <v-card-actions>
                          <v-spacer></v-spacer>
                          <v-btn v-if="type === 'Standard'" text
                            @click="createCollection(item.name, nameColl); getListDatabase(); dialogColl = false">
                            Create
                          </v-btn>
                          <v-btn v-else-if="type === 'Dynamic'" text
                            @click="createDynamicCollection(item.name, nameColl, listUrl); getListDatabase(); dialogColl = false">
                            Create
                          </v-btn>
                          <v-btn v-else text
                            @click="createVirtualCollection(nameDB, nameColl, listUrl); getListDatabase(); dialogColl = false">
                            Create
                          </v-btn>
                          <v-btn text @click="dialogColl = false">
                            Close
                          </v-btn>
                        </v-card-actions>
                      </v-card>
                    </v-dialog>
                  </v-list-item>

                  <v-list-item>
                    <v-dialog v-if="item.type === 'dynamic' || item.type === 'virtual'" v-model="dialogUrl" width="600">
                      <template v-slot:activator="{ on }">
                        <v-btn v-on="on">
                          <v-icon>mdi-file-link</v-icon>
                          Add Url
                        </v-btn>
                      </template>
                      <v-card>
                        <v-card-title>Adding Url</v-card-title>
                        <v-card-text>
                          <v-form>
                            <v-text-field label="Database" v-model=item.name disabled type="text"></v-text-field>
                            <v-text-field label="Collection" v-model="nameColl" required type="text"></v-text-field>
                            <v-text-field label="Url" v-model="listUrl" required type="text"></v-text-field>
                          </v-form>
                        </v-card-text>

                        <v-card-actions>
                          <v-spacer></v-spacer>
                          <v-btn color="primary" text
                            @click="addUrl(nameDB, nameColl, listUrl); getListDatabase(); dialogUrl = false">
                            Add
                          </v-btn>
                          <v-btn color="primary" text @click="dialogUrl = false">
                            Close
                          </v-btn>
                        </v-card-actions>
                      </v-card>
                    </v-dialog>
                  </v-list-item>
                  <v-list-item>
                    <v-dialog v-model="dialogExp" width="600">
                      <template v-slot:activator="{ on }">
                        <v-btn v-on="on">
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
                            <v-text-field label="Database" v-model=item.name disabled type="text"></v-text-field>
                            <v-text-field label="Collection" v-model="nameColl" disabled type="text"></v-text-field>
                            <v-text-field label="File" hint="Without file extension" v-model="nameFile" required
                              type="text">
                            </v-text-field>
                          </v-form>
                        </v-card-text>

                        <v-card-actions>
                          <v-spacer></v-spacer>
                          <v-btn color="primary" text
                            @click="exportCollection(nameDB, nameColl, nameFile); getListDatabase(); dialogExp = false">
                            Download
                          </v-btn>
                          <v-btn color="primary" text @click="dialogExp = false">
                            Close
                          </v-btn>
                        </v-card-actions>
                      </v-card>
                    </v-dialog>
                  </v-list-item>
                </v-list>
              </v-menu>
            </template>
          </v-treeview>
        </v-container>
      </v-col>
    </v-row>
  </v-sheet>
</template>

<script>

import * as tool from '../functions/tools'

export default {
  data () {
    return {
      dialogDb: false,
      dialogDelDb: false,
      dialogDelDb0: false,
      dialogDelDb1: false,
      dialogDelDb2: false,
      dialogColl: false,
      dialogUrl: false,
      dialogExp: false,
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
      },
      listFunctions: [
        { text: 'Delete Database', nameDb: '' },
        { text: 'Create Collection', nameColl: '', nameUrl: '' },
        { text: 'Add Url', nameUrl: '' },
        { text: 'Export Collection', nameFile: '' }
      ]
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
        // Get Collection
        if (tool.arrayEquals(command, [0, 2, 0, 7])) {
          const colls = JSON.parse(text)
          this.listDatabases.forEach(database => {
            if (database.name === colls.database) {
              const collection = colls.replace('\n', '')
              const collectionJSON = {}
              collectionJSON.name = collection.split(' ')[0]
              collectionJSON.type = collection.split(' ')[1]
            }
          })
        }
        // Delete Database
        if (tool.arrayEquals(command, [0, 1, 0, 5])) {
          const db = JSON.parse(text)
          const databaseJSON = {}
          databaseJSON.name = db
          this.listDatabases.forEach(database => {
            if (database.name === databaseJSON.name) {
              this.listDatabases.pull(database)
            }
          })
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
      return this.handleResponse()
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
    },

    deleteDatabase (nameDb) {
      this.connection.send('DELETE_DATABASE###' + nameDb)
      this.handleResponse()
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

/*
* {
  outline: 1px solid lime;
}
*/

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
