<template>
  <v-sheet id="body">
    <v-row style="height: 5vh;">
      <v-col cols="6">
        Database List:
      </v-col>
      <v-col cols="6">
        <v-btn
          :loading="loading5"
          :color="blue"
          fab
          @click=" getListDatabase()"
          >
            <v-icon>
              mdi-refresh
            </v-icon>
        </v-btn>
      </v-col>
    </v-row>
    <v-row style="height: 77vh;">
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

export default {
  data () {
    return {
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
    this.connection = new WebSocket('ws://localhost:3000')
    this.connection.onopen = () => {
      this.getListDatabase()
    }
  },
  methods: {
    getListDatabase () {
      this.listDatabases = []
      this.connection.send('LIST_DATABASE')
      this.connection.onmessage = (message) => {
        const text = message.data
        const db = JSON.parse(JSON.parse(text))
        db.databases.forEach(database => {
          const databaseJSON = {}
          databaseJSON.name = database
          databaseJSON.type = 'database'
          databaseJSON.children = []
          this.listDatabases.push(databaseJSON)
        })
      }
    },

    async getListCollection (item) {
      this.connection.send('LIST_COLLECTIONS###' + item.name)
      return await new Promise(resolve => {
        this.connection.onmessage = (message) => {
          const text = message.data
          const coll = JSON.parse(JSON.parse(text))
          coll.collections.forEach(collection => {
            collection = collection.replace('\n', '') // la risposta del server contiene degli \n che vengono rimossi
            const collectionJSON = {}
            collectionJSON.name = collection.split(' ')[0]
            collectionJSON.type = collection.split(' ')[1]
            item.children.push(collectionJSON)
          })
          resolve()
        }
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
