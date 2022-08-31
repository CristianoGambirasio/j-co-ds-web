<template>
  <v-sheet id="body">
    <v-row style="height: 8vh;">
      <v-container id="meta">
        <v-row style="height: 50%;" class="ma-0 pa-0">
          <v-col cols="12" id="meta2" style="padding: 0px;">
            <v-container v-if="online" style="padding: 7px;" fill-height>
              <v-btn depressed block style="background-color: green; padding: 0px; height: 100%;">
                ONLINE
                <v-icon>
                  mdi-access-point-check
                </v-icon>
              </v-btn>
            </v-container>
            <v-container v-else style="padding: 7px;" fill-height>
              <v-btn depressed block style="background-color: red; padding: 0px;" @click="reconnect()">
                OFFLINE
                <v-icon>
                  mdi-access-point-remove
                </v-icon>
              </v-btn>
            </v-container>
          </v-col>
        </v-row>
        <v-row style="height: 50%">
          <v-col cols="12" id="meta3" style="justify-content: center; padding: 0px" class="d-flex align-center">
            <h4 style="color: white;">{{nDB}} DATABASES</h4>
          </v-col>
        </v-row>
      </v-container>
    </v-row>
    <v-row style="height: 7vh; padding-top: 4%;">
      <v-col cols="9">
        <h2 class="ml-n2" style="color: #7FCD91; font-size: 1.2vw;">DATABASE LIST:</h2>
      </v-col>
    </v-row>
    <v-row style="height: 10vh;">
      <v-text-field style="padding: 5px" background-color=#5B5656 v-model="search" label="Search..." flat dark solo
        hide-details clearable clear-icon="mdi-close-circle-outline"></v-text-field>
    </v-row>

    <v-row style="height: 4vh">
      <template>
        <v-btn v-if="flag === false" fab small class="ml-1" height="25px" rounded depressed color=#5B5656 dark
          @click="getListDatabase();">
          <v-icon>mdi-refresh</v-icon>
        </v-btn>
        <v-dialog v-if="flag === false" v-model="dialogDb" width="600">
          <template v-slot:activator="{ on }">
            <v-btn fab small class="ml-1" v-on="on" height="25px" rounded depressed color=#5B5656 dark>
              <v-icon>mdi-plus</v-icon>
            </v-btn>
          </template>
          <v-card>
            <v-card-title>Creating new database</v-card-title>
            <v-card-text>
              <v-form>
                <v-text-field label="Name" v-model="nameDb" required type="text"></v-text-field>
              </v-form>
            </v-card-text>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn text @click="createDatabase(nameDb); getListDatabase(); dialogDb = false">
                Create
              </v-btn>
              <v-btn text @click="dialogDb = false">
                Close
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
        <v-btn fab small class="ml-1" height="25px" rounded depressed color=#5B5656 dark @click="flag = !flag">
          <v-icon>mdi-checkbox-multiple-marked</v-icon>
        </v-btn>
      </template>
    </v-row>
    <v-row style="height: 61vh">
      <v-col style="padding: 0px">
        <v-container v-if="flag === false" style="max-height: 61vh; padding: 0px; padding-top: 3px"
          class="overflow-y-auto">
          <c-treeview dark dense activatable hoverable :items="listDatabases" :load-children="getListCollection"
            :search='search' :filter='filter' item-key="name" open-on-click transition return-object
            active-class="activeNode" @update:active="buildWorkspace">
            <template v-slot:prepend="{item, open}">
              <v-icon>
                {{open ? iconOpen[item.type] : icon[item.type]}}
              </v-icon>
            </template>
            <template v-slot:append="{item, hover}">
              <v-menu bottom :offset-x="true">
                <template v-slot:activator="{ on }">
                  <v-btn dark icon v-on="on">
                    <v-icon v-if="hover">mdi-dots-vertical</v-icon>
                  </v-btn>
                </template>

                <v-list v-if="item.type === 'database'">
                  <v-list-item v-for="(el, i) in itemsDatabase" :key="i">
                    <v-dialog v-if="i === 0" v-model="dialogDelDb0" width="250">
                      <template v-slot:activator="{ on }">
                        <v-btn v-on="on">
                          <v-icon>{{ el.icon }}</v-icon>
                          {{ el.text }}
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
                                <v-btn
                                  @click="dialogDelDb0 = false; dialogDelDb1 = false; deleteDatabase(item.name); getListDatabase()">
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

                    <v-dialog v-if="i === 1" v-model="dialogColl" width="700">
                      <template v-slot:activator="{ on }">
                        <v-btn v-on="on">
                          <v-icon>{{ el.icon }}</v-icon>
                          {{ el.text }}
                        </v-btn>
                      </template>
                      <v-card>
                        <v-card-title>Creating new collection</v-card-title>
                        <v-card-text>
                          <v-form>
                            <v-text-field label='Database' v-model=item.name disabled type="text"></v-text-field>
                            <v-text-field label="Collection" v-model="nameColl" required type="text"></v-text-field>
                            <v-select label="Type" v-model="type" :items="collTypes"></v-select>
                            <v-text-field v-if="type === 'Dynamic' || type === 'Virtual'" label="Url" v-model="listUrl"
                              required type="text">
                            </v-text-field>
                          </v-form>
                        </v-card-text>

                        <v-card-actions>
                          <v-spacer></v-spacer>
                          <v-btn v-if="type === 'Static'" text
                            @click="dialogColl = false; createCollection(item.name, nameColl); getListDatabase()">
                            Create
                          </v-btn>
                          <v-btn v-else-if="type === 'Dynamic'" text
                            @click="dialogColl = false; createDynamicCollection(item.name, nameColl, listUrl); getListDatabase()">
                            Create
                          </v-btn>
                          <v-btn v-else text
                            @click="dialogColl = false; createVirtualCollection(item.name, nameColl, listUrl); getListDatabase()">
                            Create
                          </v-btn>
                          <v-btn text @click="dialogColl = false">
                            Close
                          </v-btn>
                        </v-card-actions>
                      </v-card>
                    </v-dialog>

                    <v-dialog v-if="i === 2" v-model="dialogImp" width="550">
                      <template v-slot:activator="{ on }">
                        <v-btn v-on="on">
                          <v-icon>{{ el.icon }}</v-icon>
                          {{ el.text }}
                        </v-btn>
                      </template>
                      <v-card>
                        <v-card-title>Importing collection</v-card-title>
                        <v-card-text>
                          <div class="upload-container">
                            <input type="file" id="file_upload" multiple />
                          </div>
                        </v-card-text>

                        <v-card-actions>
                          <v-spacer></v-spacer>
                          <v-btn class="upload-btn" color="primary" text
                            @click="dialogImp = false; importCollection(item.name); getListDatabase()">
                            Upload
                          </v-btn>
                          <v-btn color="primary" text @click="dialogImp = false">
                            Close
                          </v-btn>
                        </v-card-actions>
                      </v-card>
                    </v-dialog>
                  </v-list-item>
                </v-list>

                <v-list v-if="item.type === 'static'">
                  <v-list-item v-for="(el, i) in itemsCollection" :key="i">
                    <v-dialog v-if="i === 0" v-model="dialogDelColl0" width="250">
                      <template v-slot:activator="{ on }">
                        <v-btn v-on="on">
                          <v-icon>{{ el.icon }}</v-icon>
                          {{ el.text }}
                        </v-btn>
                      </template>
                      <v-card>
                        <v-card-title>Are you sure?</v-card-title>
                        <v-card-actions>
                          <v-dialog v-model="dialogDelColl1" width="400">
                            <template v-slot:activator="{ on }">
                              <v-btn v-on="on">Yes</v-btn>
                            </template>
                            <v-card>
                              <v-card-title>Really?!</v-card-title>
                              <v-card-actions>
                                <v-btn
                                  @click="dialogDelColl0 = false; dialogDelColl1 = false; deleteCollection(item.db, item.name); getListDatabase()">
                                  Delete collection
                                </v-btn>
                                <v-spacer></v-spacer>
                                <v-btn @click="dialogDelColl0 = false; dialogDelColl1 = false">
                                  Cancel
                                </v-btn>
                              </v-card-actions>
                            </v-card>
                          </v-dialog>
                          <v-spacer></v-spacer>
                          <v-btn v-on="on" @click="dialogDelColl0 = false">
                            No
                          </v-btn>
                        </v-card-actions>
                      </v-card>
                    </v-dialog>

                    <v-dialog v-if="i === 1" v-model="dialogImp" width="550">
                      <template v-slot:activator="{ on }">
                        <v-btn v-on="on">
                          <v-icon>{{ el.icon }}</v-icon>
                          {{ el.text }}
                        </v-btn>
                      </template>
                      <v-card>
                        <v-card-title>Importing collection</v-card-title>
                        <v-card-text>
                          <div class="upload-container">
                            <input type="file" id="file_upload" multiple />
                          </div>
                        </v-card-text>

                        <v-card-actions>
                          <v-spacer></v-spacer>
                          <v-dialog v-model="dialogImp1" width="400">
                            <template v-slot:activator="{ on }">
                              <v-btn v-on="on" class="upload-btn" color="primary" text>
                                Upload
                              </v-btn>
                            </template>
                            <v-card>
                              <v-card-title>Do you want to append this collection to the existing {{ item.name }}
                                collection?</v-card-title>
                              <v-card-actions>
                                <v-btn
                                  @click="append = true; dialogImp = false; dialogImp1 = false; importCollection(item.name); getListDatabase()">
                                  Yes
                                </v-btn>
                                <v-spacer></v-spacer>
                                <v-btn
                                  @click="append = false; dialogImp = false; dialogImp1 = false; importCollection(item.name); getListDatabase()">
                                  No
                                </v-btn>
                              </v-card-actions>
                            </v-card>
                          </v-dialog>
                          <v-btn color="primary" text @click="dialogImp = false">
                            Close
                          </v-btn>
                        </v-card-actions>
                      </v-card>
                    </v-dialog>

                    <v-dialog v-if="i === 2" v-model="dialogExp" width="600">
                      <template v-slot:activator="{ on }">
                        <v-btn v-on="on">
                          <v-icon>{{ el.icon }}</v-icon>
                          {{ el.text }}
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
                            <v-text-field label="Database" v-model=item.db disabled type="text"></v-text-field>
                            <v-text-field label="Collection" v-model=item.name disabled type="text"></v-text-field>
                            <v-text-field label="File" hint="Without file extension" v-model="nameFile" required
                              type="text">
                            </v-text-field>
                          </v-form>
                        </v-card-text>

                        <v-card-actions>
                          <v-spacer></v-spacer>
                          <v-btn color="primary" text
                            @click="dialogExp = false; exportCollection(item.db, item.name, nameFile)">
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

                <v-list v-if="item.type === 'dynamic'">
                  <v-list-item v-for="(el, i) in itemsCollection" :key="i">
                    <v-dialog v-if="i === 0" v-model="dialogDelColl0" width="250">
                      <template v-slot:activator="{ on }">
                        <v-btn v-on="on">
                          <v-icon>{{ el.icon }}</v-icon>
                          {{ el.text }}
                        </v-btn>
                      </template>
                      <v-card>
                        <v-card-title>Are you sure?</v-card-title>
                        <v-card-actions>
                          <v-dialog v-model="dialogDelColl1" width="400">
                            <template v-slot:activator="{ on }">
                              <v-btn v-on="on">Yes</v-btn>
                            </template>
                            <v-card>
                              <v-card-title>Really?!</v-card-title>
                              <v-card-actions>
                                <v-btn
                                  @click="dialogDelColl0 = false; dialogDelColl1 = false; deleteCollection(item.db, item.name); getListDatabase()">
                                  Delete collection
                                </v-btn>
                                <v-spacer></v-spacer>
                                <v-btn @click="dialogDelColl0 = false; dialogDelColl1 = false">
                                  Cancel
                                </v-btn>
                              </v-card-actions>
                            </v-card>
                          </v-dialog>
                          <v-spacer></v-spacer>
                          <v-btn v-on="on" @click="dialogDelColl0 = false">
                            No
                          </v-btn>
                        </v-card-actions>
                      </v-card>
                    </v-dialog>

                    <v-dialog v-if="i === 2" v-model="dialogExp" width="600">
                      <template v-slot:activator="{ on }">
                        <v-btn v-on="on">
                          <v-icon>{{ el.icon }}</v-icon>
                          {{ el.text }}
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
                            <v-text-field label="Database" v-model=item.db disabled type="text"></v-text-field>
                            <v-text-field label="Collection" v-model=item.name disabled type="text"></v-text-field>
                            <v-text-field label="File" hint="Without file extension" v-model="nameFile" required
                              type="text">
                            </v-text-field>
                          </v-form>
                        </v-card-text>

                        <v-card-actions>
                          <v-spacer></v-spacer>
                          <v-btn color="primary" text
                            @click="dialogExp = false; exportCollection(item.db, item.name, nameFile)">
                            Download
                          </v-btn>
                          <v-btn color="primary" text @click="dialogExp = false">
                            Close
                          </v-btn>
                        </v-card-actions>
                      </v-card>
                    </v-dialog>
                  </v-list-item>

                  <v-divider></v-divider>

                  <!--da modificare con manage url, usando addUrl e removeUrl e listUrl-->
                  <v-list-item v-for="(el, i) in itemsOtherCollection" :key="i">
                    <v-dialog v-if="i === 0" v-model="dialogUrl" width="500">
                      <template v-slot:activator="{ on }">
                        <v-btn v-on="on" @click="getListUrl(item.db, item.name)">
                          <v-icon>{{ el.icon }}</v-icon>
                          {{ el.text }}
                        </v-btn>
                      </template>
                      <v-card>
                        <v-card-title>Managing urls</v-card-title>
                        <v-card-text>
                          <v-list>
                            <v-list-item v-for="(url, i) in listUrls" :key="i">
                              {{ url }}
                            </v-list-item>
                          </v-list>
                        </v-card-text>

                        <v-card-actions>
                          <v-spacer></v-spacer>
                              <v-btn>
                                Add url
                              </v-btn>
                        </v-card-actions>
                      </v-card>
                    </v-dialog>

                    <v-dialog v-if="i === 1" v-model="dialogFreq" width="600">
                      <template v-slot:activator="{ on }">
                        <v-btn v-on="on">
                          <v-icon>{{ el.icon }}</v-icon>
                          {{ el.text }}
                        </v-btn>
                      </template>
                      <v-card>
                        <v-card-title>Set frequency</v-card-title>
                        <v-card-text>
                          <v-form>
                            <v-text-field label="Database" v-model=item.db disabled type="text"></v-text-field>
                            <v-text-field label="Collection" v-model=item.name disabled type="text"></v-text-field>
                            <v-text-field label="Frequency" v-model="frequency" required type="text"></v-text-field>
                          </v-form>
                        </v-card-text>

                        <v-card-actions>
                          <v-spacer></v-spacer>
                          <v-btn color="primary" text
                            @click="dialogFreq = false; setFrequency(item.db, item.name, index, frequency); getListDatabase()">
                            Set
                          </v-btn>
                          <v-btn color="primary" text @click="dialogFreq = false">
                            Close
                          </v-btn>
                        </v-card-actions>
                      </v-card>
                    </v-dialog>
                  </v-list-item>
                </v-list>

                <v-list v-if="item.type === 'virtual'">
                  <v-list-item v-for="(el, i) in itemsCollection" :key="i">
                    <v-dialog v-if="i === 0" v-model="dialogDelColl0" width="250">
                      <template v-slot:activator="{ on }">
                        <v-btn v-on="on">
                          <v-icon>{{ el.icon }}</v-icon>
                          {{ el.text }}
                        </v-btn>
                      </template>
                      <v-card>
                        <v-card-title>Are you sure?</v-card-title>
                        <v-card-actions>
                          <v-dialog v-model="dialogDelColl1" width="400">
                            <template v-slot:activator="{ on }">
                              <v-btn v-on="on">Yes</v-btn>
                            </template>
                            <v-card>
                              <v-card-title>Really?!</v-card-title>
                              <v-card-actions>
                                <v-btn
                                  @click="dialogDelColl0 = false; dialogDelColl1 = false; deleteCollection(item.db, item.name); getListDatabase()">
                                  Delete collection
                                </v-btn>
                                <v-spacer></v-spacer>
                                <v-btn @click="dialogDelColl0 = false; dialogDelColl1 = false">
                                  Cancel
                                </v-btn>
                              </v-card-actions>
                            </v-card>
                          </v-dialog>
                          <v-spacer></v-spacer>
                          <v-btn v-on="on" @click="dialogDelColl0 = false">
                            No
                          </v-btn>
                        </v-card-actions>
                      </v-card>
                    </v-dialog>

                    <v-dialog v-if="i === 1" v-model="dialogExp" width="600">
                      <template v-slot:activator="{ on }">
                        <v-btn v-on="on">
                          <v-icon>{{ el.icon }}</v-icon>
                          {{ el.text }}
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
                            <v-text-field label="Database" v-model=item.db disabled type="text"></v-text-field>
                            <v-text-field label="Collection" v-model=item.name disabled type="text"></v-text-field>
                            <v-text-field label="File" hint="Without file extension" v-model="nameFile" required
                              type="text">
                            </v-text-field>
                          </v-form>
                        </v-card-text>

                        <v-card-actions>
                          <v-spacer></v-spacer>
                          <v-btn color="primary" text
                            @click="dialogExp = false; exportCollection(item.db, item.name, nameFile)">
                            Download
                          </v-btn>
                          <v-btn color="primary" text @click="dialogExp = false">
                            Close
                          </v-btn>
                        </v-card-actions>
                      </v-card>
                    </v-dialog>
                  </v-list-item>

                  <v-divider></v-divider>

                  <!-- manage url da aggiungere-->
                  <v-list-item v-for="(el, i) in itemsOtherCollection" :key="i">
                    <v-dialog v-if="i === 0" width="250">
                    </v-dialog>
                  </v-list-item>
                </v-list>
              </v-menu>
            </template>
          </c-treeview>
        </v-container>
        <v-container v-else style="max-height: 61vh; padding: 0px; padding-top: 3px" class="overflow-y-auto">
          <v-treeview dark dense selectable activatable v-model="colls" :items="listDatabases"
            :load-children="getListCollection" :search='search' :filter='filter' item-key="name" open-on-click
            transition return-object active-class="activeNode">
            <template v-slot:prepend="{item, open}">
              <v-icon>
                {{open ? iconOpen[item.type] : icon[item.type]}}
              </v-icon>
            </template>
          </v-treeview>
          <v-row>
            <v-col cols="5">
              <v-btn small style="background-color: white" @click="flag = false; getListDatabase()">
                <v-icon>mdi-arrow-u-left-top</v-icon>
                Cancel
              </v-btn>
            </v-col>
            <v-col cols="2" class="ml-4">
              <v-btn v-if="!colls.length" disabled small style="background-color: red">
                <v-icon>mdi-close</v-icon>
                Delete
              </v-btn>
              <v-dialog v-else v-model="dialogColls" width="600">
                <template v-slot:activator="{ on }">
                  <v-btn small v-on="on" style="background-color: red">
                    <v-icon>mdi-close</v-icon>
                    Delete
                  </v-btn>
                </template>
                <v-card>
                  <v-card-title>
                    Are you sure that you want to delete these collections from: {{ colls[0].db }}?
                  </v-card-title>
                  <v-card-text>
                    <v-scroll-x-transition group hide-on-leave>
                      <v-chip v-for="(node, i) in colls" :key="i" color="grey" dark small class="ma-1">
                        {{ node.name }}
                      </v-chip>
                    </v-scroll-x-transition>
                  </v-card-text>

                  <v-card-actions>
                    <v-dialog v-model="dialogDelMoreColls" width="500">
                      <template v-slot:activator="{ on }">
                        <v-btn v-on="on">Yes</v-btn>
                      </template>
                      <v-card>
                        <v-card-title>Really?!</v-card-title>
                        <v-card-actions>
                          <v-btn
                            @click="dialogColls = false; dialogDelMoreColls = false; deleteMoreCollections(colls); getListDatabase(); flag = false">
                            Delete collections
                          </v-btn>
                          <v-spacer></v-spacer>
                          <v-btn @click="dialogDelMoreColls = false; dialogColls = false">
                            Cancel
                          </v-btn>
                        </v-card-actions>
                      </v-card>
                    </v-dialog>
                    <v-spacer></v-spacer>
                    <v-btn v-on="on" @click="dialogColls = false">
                      No
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-dialog>
            </v-col>
          </v-row>
        </v-container>
      </v-col>
    </v-row>
  </v-sheet>
</template>

<script>
import * as com from '../functions/communication'
import CTreeview from '@/functions/CTreeview.js'
import { connect, returnWS } from '../functions/connection.js'

export default {
  components: {
    CTreeview
  },
  data () {
    return {
      activeItem: null,
      dialogColls: false, // selectable treeview command
      dialogDelMoreColls: false, // selectable treeview command
      dialogDb: false,
      dialogDelDb: false,
      dialogDelDb0: false,
      dialogDelDb1: false,
      dialogDelDb2: false,
      dialogColl: false,
      dialogUrl: false,
      dialogAddUrl: false,
      dialogFreq: false,
      dialogExp: false,
      dialogImp: false,
      dialogImp1: false,
      dialogDelColl0: false,
      dialogDelColl1: false,
      metaTL: null,
      metaDL: null, // frquency info
      metaBL: null,
      metaBR: null,
      active: false,
      online: false,
      flag: false, // for the selectable treeview option
      type: '',
      nameDb: '',
      nameColl: '',
      nameUrl: '',
      nameFile: '',
      limit: -1,
      offset: 0,
      append: false,
      index: '',
      frequency: '',
      searchKeySensitive: true,
      search: null,
      id: Math.floor(Math.random() * 10),
      connection: null,
      listDatabases: [],
      listUrls: [],
      on: null,
      colls: [],
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
      itemsDatabase: [
        {
          text: 'Delete database',
          icon: 'mdi-close'
        },
        {
          text: 'Create collection',
          icon: 'mdi-note-check'
        },
        {
          text: 'Import collection',
          icon: 'mdi-arrow-down-circle'
        }
      ],
      itemsCollection: [
        {
          text: 'Delete collection',
          icon: 'mdi-close'
        },
        {
          text: 'Import collection',
          icon: 'mdi-arrow-down-circle'
        },
        {
          text: 'Export Collection',
          icon: 'mdi-database-export'
        }
      ],
      itemsOtherCollection: [
        {
          text: 'Manage url',
          icon: 'mdi-file-link'
        },
        {
          text: 'Set frequency',
          icon: 'mdi-update'
        }
      ],
      collTypes: ['Static', 'Dynamic', 'Virtual']
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
    connect()
    this.connection = returnWS()
    this.connection.onopen = () => {
      console.log('Connecting...')
      this.ping()
      this.getListDatabase()
      this.handleResponse()
    }
  },
  methods: {
    reconnect () {
      connect()
      this.connection = returnWS()
      this.$root.$refs.Workspace.reconnect()
      this.connection.onopen = () => {
        this.connection = returnWS()
        console.log('Connecting...')
        this.ping()
        this.getListDatabase()
        this.handleResponse()
      }
    },

    // Import communication function
    handleResponse: com.handleResponse,
    getListDatabase: com.getListDatabase,
    getListCollection: com.getListCollection,
    getListUrl: com.getListUrl,
    getCollectionCount: com.getCollectionCount,
    createDatabase: com.createDatabase,
    createCollection: com.createCollection,
    createDynamicCollection: com.createDynamicCollection,
    createVirtualCollection: com.createVirtualCollection,
    addUrl: com.addUrl,
    getCollection: com.getCollection,
    saveCollection: com.saveCollection,
    exportCollection: com.exportCollection,
    importCollection: com.importCollection,
    setFrequency: com.setFrequency,
    setUpdateType: com.setUpdateType,
    stopUpdate: com.stopUpdate,
    deleteDatabase: com.deleteDatabase,
    deleteCollection: com.deleteCollection,
    removeUrl: com.removeUrl,
    deleteMoreCollections: com.deleteMoreCollections,
    ping: com.ping,
    async buildWorkspace (value) {
      if (!value[0]) {
        this.emptyWorkspace()
      } else {
        this.$root.$refs.Workspace.updateParam(value[0].db, value[0].name, value)
      }
    },
    emptyWorkspace () {
      this.$root.$refs.Workspace.updateParam(null, null)
    },
    updateDynamicCollection () {
      this.setFrequency('test', 'd1', 0, 3600000)
      this.setUpdateType('test', 'd1', 0, 0)
      this.stopUpdate('test', 'd2')
    }
  }
}
</script>

<style scoped>

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
  width: 100%;
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

.upload-container {
  position: relative;
}

.upload-container input {
  border: 1px solid #92b0b3;
  background: #f1f1f1;
  outline: 2px dashed #92b0b3;
  outline-offset: -10px;
  padding: 100px 0px 100px 125px;
  text-align: center !important;
  width: 500px;
}

.upload-container input:hover {
  background: #ddd;
}

.upload-container:before {
  position: absolute;
  bottom: 50px;
  left: 150px;
  content: " (or) Drag and Drop files here. ";
  color: #3f8188;
  font-weight: 900;
}

.upload-btn {
  margin-left: 300px;
  padding: 7px 20px;
}

</style>
