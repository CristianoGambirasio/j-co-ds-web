<template>
  <v-sheet id="body">
    <v-row style="height: 10vh;">
      <v-container fluid id="metadata">
        Prova Metadata
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
        :length="5"
        circle
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
      numDoc: 5
    }
  },
  created () {
    this.$root.$refs.Workspace = this
  },
  mounted () {
    this.connection = returnWS()
    console.log(this.connection)
  },
  methods: {
    getCollection: com.getCollection,
    handleResponse: com.handleResponse,

    updateParam (db, coll) {
      this.page = 1
      if (db !== null && coll !== null) {
        this.dbSelected = db
        this.collSelected = coll
        this.buildWorkspace()
      } else {
        this.documentsLoaded = []
      }
    },
    async buildWorkspace () {
      if (this.dbSelected !== null && this.collSelected !== null) {
        console.log('AAA')
        const res = await this.getCollection(this.dbSelected, this.collSelected, this.numDoc, (this.page - 1) * this.numDoc)
        this.documentsLoaded = res.documents
        console.log('A' + this.documentsLoaded)
      }
    }
  }
}
</script>

<style scoped>
/* * {
  outline: 1px solid lime;
} */
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
