<template>
  <v-sheet id="body">
      <v-row style="height: 10vh; padding: 0;">
        <v-container fluid id="metadata" style="padding: 0;">
          <v-row style="height: 10vh; padding: 0;">
            <v-col id="meta1" cols="6" style="align-self: center; padding: 0; padding-left: 5px;">
              <h4 v-if="selected">{{metaNameColl}}@<span>{{metaNameDb}}</span></h4>
              <h5 v-if="selected">{{metaTypeColl}} collection</h5>
            </v-col>
            <v-col id="meta2" cols="4" style="align-self: center; justify-self: center; padding: 0;">
            </v-col>
            <v-col id="meta3" cols="1" style="align-self: center; text-align: end; padding: 0;">
              <v-row style="justify-content: center; padding: 0;">
                <h4>{{countCollection}}</h4>
              </v-row>
              <v-row style="justify-content: center; padding: 0;">
                <h5 v-if="selected">DOCUMENTS</h5>
              </v-row>
            </v-col>
            <v-col id="settings" cols="1" style="align-self:center; text-align: center; padding: 0">
              <v-dialog v-model="openSettings" fullscreen hide-overlay scrollable transition="dialog-bottom-transition">
                <v-card tile style="background-color: #F5EAEA;">
                  <v-toolbar color="#41B3D3" flat dark>
                    <v-btn style="font-weight: bolder;" icon dark @click="resetSettings()"><v-icon color="#4D4646">mdi-close</v-icon></v-btn>
                    <v-toolbar-title color="#4D4646">Settings</v-toolbar-title>
                    <v-spacer></v-spacer>
                    <v-toolbar-items>
                      <v-btn style="font-weight: bolder; font-size:medium;" color="#4D4646" dark text @click="saveSettings()">SAVE</v-btn>
                    </v-toolbar-items>
                  </v-toolbar>
                  <v-card-text style="padding: 0;">
                    <v-form v-model="formValid">
                      <v-row style="align-content:center; padding:0;">
                        <v-col cols="2" style="align-self: center">
                          <h5 style="color: #363633">Number of document per page:</h5>
                        </v-col>
                        <v-col cols="auto">
                          <v-text-field outlined v-model="settingNumDoc" style="width: 50px; text-align: center;" class="centered-input text--darken-3 mt-3"></v-text-field>
                        </v-col>
                      </v-row>
                      <v-divider></v-divider>
                    </v-form>
                  </v-card-text>
                  <div style="flex: 200 1 auto;"></div>
                </v-card>
              </v-dialog>
              <v-btn icon x-large color="white" @click.stop="openSettings=!openSettings"><v-icon>mdi-cog-outline</v-icon></v-btn>
            </v-col>
          </v-row>
        </v-container>
      </v-row>
      <v-row style="height: calc(100% - 10vh - 50px);">
        <v-container v-if="$root.loading" style="padding: 0;align-self: center;" class="text-center">
          <v-progress-circular
          :size="100"
          :width="8"
          color="#41B3D3"
          indeterminate
          ></v-progress-circular>
          <br />
          <br />
          <h3 style="color: #4D4646">Loading documents...</h3>
        </v-container>
        <v-container v-else fluid class="overflow-y-auto" style="max-height: calc(100vh - 10vh - 50px); padding: 0;">
          <v-container fluid v-for="doc in documentsLoaded" :key="doc.id" id="cards">
            <json-viewer :value="doc" boxed theme="json-viewer-theme"></json-viewer>
          </v-container>
        </v-container>
      </v-row>
      <template>
        <v-footer padless style="height: 50px;" id="footer">
          <v-container  fluid class="text-center" style="padding: 0;">
            <v-pagination v-if="!$root.loading" v-model="page" :length="nPages" :total-visible="10" @input="buildWorkspace" color="#41B3D3"> </v-pagination>
          </v-container>
        </v-footer>
      </template>
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
      openSettings: false,
      connection: null,
      page: 1,
      dbSelected: null,
      collSelected: null,
      documentsLoaded: [], // numDoc documents loadaded of the selected page
      listUrls: [], // List of urls of the selected collection
      numDoc: 5, // Number of doc showed in each page
      settingNumDoc: 5,
      nPages: 0,
      metaNameColl: null,
      metaNameDb: null,
      metaTypeColl: null,
      meta4: null,
      countCollection: null,
      showDynamicFunctions: false,
      selected: false
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
    getListUrl: com.getListUrl,

    reconnect () {
      this.connection = returnWS()
    },

    updateParam (db, coll, obj) {
      this.page = 1
      if (db !== null && coll !== null) {
        this.selected = true
        this.dbSelected = db
        this.collSelected = coll
        this.buildWorkspace(obj)
      } else {
        this.selected = false
        this.countCollection = null
        this.documentsLoaded = []
        this.nPages = 0
        this.meta1 = null
        this.meta2 = null
        this.meta3 = null
        this.meta4 = null
      }
    },
    async buildWorkspace (obj) {
      if (this.dbSelected !== null && this.collSelected !== null) {
        if (!obj[0]) {
          console.log('Changed page')
        } else if (obj[0].type === 'static') {
          this.countCollection = await this.getCollectionCount(this.dbSelected, this.collSelected)
          this.nPages = Math.ceil(this.countCollection / this.numDoc)
          this.showMetadata(obj)
        } else if (obj[0].type === 'virtual') {
          this.countCollection = (await this.getListUrl(this.dbSelected, this.collSelected)).length
          this.nPages = Math.ceil(this.countCollection / this.numDoc)
          this.showMetadata(obj)
        } else if (obj[0].type === 'dynamic') {
          this.countCollection = (await this.getListUrl(this.dbSelected, this.collSelected)).length // Da sistemare
          this.nPages = Math.ceil(this.countCollection / this.numDoc)
          this.showMetadata(obj)
        }
        const res = await this.getCollection(this.dbSelected, this.collSelected, this.numDoc, (this.page - 1) * this.numDoc)
        this.documentsLoaded = res.documents
      }
    },
    async showMetadata (value) {
      this.metaNameColl = value[0].name
      this.metaNameDb = value[0].db
      this.metaTypeColl = (value[0].type)[0].toUpperCase() + (value[0].type).substring(1)
    },
    async saveSettings () {
      this.openSettings = false
      this.numDoc = this.settingNumDoc
      this.updateParam(null, null)
    },
    resetSettings () {
      this.openSettings = false
      this.settingNumDoc = this.numDoc
    }
  }
}
</script>

<style scoped>
/** {
  outline: 1px solid lime;
}*/
h4{
  color: white;
  font-size: 4vh;
}
h5{
  color: #61D2DC;
  font-size: 2vh;
}
span{
  color: #61D2DC;
  font-size: 3vh;
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
  height: 100%;
  width: 100%;
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
  background: #61D2DC
}
.centered-input input {
  text-align: center
}
</style>
<style lang="scss">
.v-pagination__item {
    margin: 5px !important;
}
.v-pagination__navigation{
  margin: 5px !important
}
.v-toolbar__title{
  color: #4D4646;
  font-weight: bolder;
}
.json-viewer-theme {
  background: lightgray;
  color: #363633;
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
  .jv-key {
    font-weight: bold;
  }
}
.jv-node.toggle{
  margin-left: 0px !important
}

.jv-node .jv-node{padding-left: 20px;}
</style>
