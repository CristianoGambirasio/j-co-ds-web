<template>
  <v-sheet id="body">
    <v-row style="height: 10vh;">
      <v-container fluid id="metadata" style="padding: 0;">
        <v-row style="height: 10vh;">
          <v-col id="meta1" cols="3">
            <h4>{{meta1}}</h4>
          </v-col>
          <v-col id="meta2" cols="3">
            <h4>{{meta2}}</h4>
          </v-col>
          <v-col id="meta3" cols="3">
            <h4>{{meta3}}</h4>
          </v-col>
          <v-col id="meta4" cols="3">
            <h4>{{meta4}}</h4>
          </v-col>
        </v-row>
      </v-container>
    </v-row>
    <v-row style="height: 84vh;">
      <v-container fluid class="overflow-y-auto" style="max-height: 84vh; padding: 0;">
      <v-container fluid v-for="doc in documentsLoaded" :key="doc.id" id="cards" class="overflow-y-auto" >
        <json-viewer :value="doc" boxed theme="json-viewer-theme"></json-viewer>
      </v-container>
    </v-container>
    </v-row>
    <v-row style="height: 6vh;">
      <v-container fluid class="text-center" id="footer">
      <v-pagination
        v-model="page"
        :length="nPages"
        :total-visible="10"
        @input="buildWorkspace"
    > </v-pagination>
    </v-container>
    </v-row>
  </v-sheet>
</template>

<script>
import { returnWS } from '@/functions/connection'
import Vue from 'vue'
import JsonViewer from 'vue-json-viewer'
import * as com from '../functions/communication'

Vue.use(JsonViewer)

export default {
  data () {
    return {
      connection: null,
      page: 1,
      dbSelected: null,
      collSelected: null,
      documentsLoaded: [],
      numDoc: 5,
      nPages: 0,
      meta1: null,
      meta2: null,
      meta3: null,
      meta4: null
    }
  },
  created () {
    this.$root.$refs.Workspace = this
  },
  mounted () {
    this.connection = returnWS()
  },
  methods: {
    getCollection: com.getCollection,
    handleResponse: com.handleResponse,
    getCollectionCount: com.getCollectionCount,

    reconnect () {
      this.connection = returnWS()
    },

    updateParam (db, coll, obj) {
      this.page = 1
      if (db !== null && coll !== null) {
        this.dbSelected = db
        this.collSelected = coll
        this.buildWorkspace(obj)
      } else {
        this.documentsLoaded = []
      }
    },
    async buildWorkspace (obj) {
      if (this.dbSelected !== null && this.collSelected !== null) {
        console.log(this.dbSelected)
        const res = await this.getCollection(this.dbSelected, this.collSelected, this.numDoc, (this.page - 1) * this.numDoc)
        this.documentsLoaded = res.documents
        this.nPages = Math.ceil((await this.getCollectionCount(this.dbSelected, this.collSelected)) / this.numDoc)
        this.showMetadata(obj)
      }
    },
    async showMetadata (value) {
      if (value.length === 0) {
        this.active = false
      } else {
        this.active = true
      }
      let countCollection
      if (value.length > 0 && (value[0].type === 'static' || 'virtual' || 'dynamic')) {
        countCollection = await this.getCollectionCount(value[0].db, value[0].name)
      }

      if (value.length === 0) {
        this.meta1 = null
        this.meta2 = null
      } else if (value[0].type === 'static') {
        this.meta2 = 'TYPE: STATIC'
        this.meta1 = 'NAME: ' + value[0].name
        this.meta3 = 'Documents: ' + countCollection
      } else if (value[0].type === 'dynamic') {
        this.meta2 = 'TYPE: DYNAMIC'
        this.meta1 = 'NAME: ' + value[0].name
        this.meta3 = 'Documents: ' + countCollection
        // this.metaDL = 'Frequency: ' + value[0].frequency
      } else if (value[0].type === 'virtual') {
        this.meta2 = 'TYPE: VIRTUAL'
        this.meta1 = 'NAME: ' + value[0].name
        this.meta3 = 'Documents: ' + countCollection
        // Gestione database | Stile select
        // Prova
      }
    }
  }
}
</script>

<style scoped>
/* * {
  outline: 1px solid lime;
} */
h4{
  color: white;
  padding: 8px;
}
#metadata{
  background-color: #4D4646;
}
#footer{
  background-color: #F5EAEA;
  padding: 0;
}
#body{
  background-color: #F5EAEA;
  display: flex;
  flex-direction: column;
  height: 100vh;
}
#cards{
  padding-bottom: 0;
  width: 100%;
}
::-webkit-scrollbar {
  width: 10px;
}

::-webkit-scrollbar-track {
  background: #F5EAEA
}

::-webkit-scrollbar-thumb {
  background: #7FCD91
}
</style>
<style lang="scss">
.v-pagination__item {
    margin: 5px !important;
}
.v-pagination__navigation{
  margin: 5px !important
}
  .json-viewer-theme {
  background: lightgray;
  color: #525252;
  font-family: Consolas, Menlo, Courier, monospace;

  .jv-ellipsis {
    color: #999;
    background-color: #eee;
    display: inline-block;
    line-height: 0.9;
    font-size: 0.9em;
    padding: 0px 4px 2px 4px;
    border-radius: 3px;
    vertical-align: 2px;
    cursor: pointer;
    user-select: none;
  }
  .jv-button {
    color: black;
    background-color: #eee;
    border-radius: 10px;
  }
  .jv-key {
    font-weight: bold;
  }
}
</style>
