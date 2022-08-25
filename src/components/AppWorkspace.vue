<template>
  <v-sheet id="body">
    <v-container class="overflow-y-auto" style="max-height: 100vh; padding: 0;">
      <v-container v-for="doc in documentsLoaded" :key="doc.id" id="cards" class="overflow-y-auto" >
        <json-viewer :value="doc" boxed theme="json-viewer-theme"></json-viewer>
      </v-container>
    </v-container>
      <v-container class="text-center" id="footer">
      <v-pagination
        v-model="page"
        :length="5"
        circle
        @input="buildWorkspace"
    > </v-pagination>
    </v-container>
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
#footer{
  position: absolute;
  align-self: center;
  bottom: 0;
  align-items: center;
  padding: 0;
  background-color: #F5EAEA;
}
#body{
  background-color: #F5EAEA;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
#cards{
  padding: 5px;
  padding-bottom: 0;
  width: 100%;
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
