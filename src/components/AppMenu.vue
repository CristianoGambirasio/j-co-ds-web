<template>
  <v-sheet id="body">
    <v-row style="height: 5vh; padding: 2px; justify-content: center;">
      <v-col cols="auto" style="padding: 2px; font-size: medium;">
        <p style="color: white;">{{nDB}} DATABASES:</p>
      </v-col>
      <v-col style="padding: 0px" class="ml-7">
        <template>
          <!--Refresh button-->
          <v-tooltip v-if="flag===false" bottom open-delay=400>
            <template v-slot:activator="{ on, attrs}">
              <v-btn v-on="on" v-bind="attrs" tile small dense depressed text icon color="white"
                @click="getListDatabase();">
                <v-icon style="font-size: 22px">mdi-refresh</v-icon>
              </v-btn>
            </template>
            <span>refresh</span>
          </v-tooltip>
          <!--Create new database button-->
          <v-dialog v-if="flag === false" v-model="dialogDb" width="600">
            <template #activator="{ on: dialog }">
              <v-tooltip bottom open-delay=400>
                <template #activator="{ on: tooltip }">
                  <v-btn v-on="{ ...tooltip, ...dialog }" tile dense small depressed text icon color="white">
                    <v-icon style="font-size: 22px">mdi-plus</v-icon>
                  </v-btn>
                </template>
                <span>create a new database</span>
              </v-tooltip>
            </template>
            <v-card>
              <v-card-title>Creating new database</v-card-title>
              <v-card-text>
                <v-form v-model="formValid">
                  <v-text-field label="Name" v-model="nameDb"
                    :rules="[v => !!v || 'Insert DB name', v => dbNameCheck(v) || 'This name is already used']" required
                    type="text"></v-text-field>
                </v-form>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn text :disabled="!formValid"
                  @click="createDatabase(nameDb); getListDatabase(); dialogDb = false; resetForm();">
                  Create
                </v-btn>
                <v-btn text @click="resetForm(); dialogDb = false;">
                  Close
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
          <!--Selectable treeview button-->
          <v-tooltip bottom open-delay=400>
            <template v-slot:activator="{ on, attrs }">
              <v-btn v-on="on" v-bind="attrs" tile small dense depressed text icon color="white" @click="flag = !flag">
                <v-icon style="font-size: 22px">mdi-checkbox-multiple-marked</v-icon>
              </v-btn>
            </template>
            <span>menu for deleting more collections simultaneously</span>
          </v-tooltip>
        </template>
      </v-col>
    </v-row>
    <v-row style="height: 8vh;">
      <v-text-field style="padding: 2px" background-color=#5B5656 v-model="search" label="Search..." flat dark solo
        hide-details clearable clear-icon="mdi-close-circle-outline"></v-text-field>
    </v-row>

    <!--Treeview------------------------------------------------------------------>
    <v-row style="height: 73vh">
      <v-col style="padding: 0px">
        <v-container v-if="flag === false" style="max-height: 61vh; padding: 0px; padding-top: 3px"
          class="overflow-y-auto">
          <v-treeview dark dense activatable hoverable :items="listDatabases" :load-children="getListCollection"
            :search='search' :filter='filter' item-key="id" open-on-click transition return-object
            active-class="activeNode" @update:active="buildWorkspace">
            <template v-slot:prepend="{item, open}">
              <v-icon dense>
                {{open ? iconOpen[item.type] : icon[item.type]}}
              </v-icon>
            </template>
            <!--Three dots menu button-->
            <template v-slot:append="{item, hover}">
              <v-menu bottom :offset-x="true">
                <template v-slot:activator="{ on }">
                  <v-btn dark icon v-on="on">
                    <v-icon v-if="hover">
                      mdi-dots-vertical</v-icon>
                  </v-btn>
                </template>

                <!--Database buttons list-->
                <v-list v-if="item.type === 'database'">
                  <v-list-item v-for="(el, i) in itemsDatabase" :key="i">
                    <v-dialog v-if="i === 0" v-model="dialogDelDb0" width="250">
                      <template v-slot:activator="{ on }">
                        <v-btn v-on="on">
                          <v-icon light dense>{{ el.icon }}</v-icon>
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
                          <v-icon light dense>{{ el.icon }}</v-icon>
                          {{ el.text }}
                        </v-btn>
                      </template>
                      <v-card>
                        <v-card-title>Creating new collection</v-card-title>
                        <v-card-text>
                          <v-form v-model="formValid">
                            <v-text-field label='Database' v-model=item.name disabled type="text"></v-text-field>
                            <v-text-field label="Collection" v-model="nameColl"
                              :rules="[v => !!v || 'Insert a name', v => collNameCheck(v, item) || 'This name is already used']"
                              required type="text"></v-text-field>
                            <v-select label="Type" v-model="type" :items="collTypes"
                              :rules="[v => !!v || 'Select a collection type',]"></v-select>
                            <v-text-field v-if="type === 'Dynamic' || type === 'Virtual'" label="Url"
                              hint="To add more urls: write them separated by a ','" v-model="listUrl"
                              :rules="[ v => !!v || 'Insert an URL', v => noSpace(v) || 'Do not insert spaces before or after the ,']"
                              required type="text">
                            </v-text-field>
                          </v-form>
                        </v-card-text>

                        <v-card-actions>
                          <v-spacer></v-spacer>
                          <v-btn v-if="type === 'Static'" text :disabled="!formValid"
                            @click="dialogColl = false; createCollection(item.name, nameColl); getListDatabase(); resetForm();">
                            Create
                          </v-btn>
                          <v-btn v-else-if="type === 'Dynamic'" text :disabled="!formValid"
                            @click="dialogColl = false; createDynamicCollection(item.name, nameColl, listUrl); getListDatabase(); resetForm();">
                            Create
                          </v-btn>
                          <v-btn v-else text :disabled="!formValid"
                            @click="dialogColl = false; createVirtualCollection(item.name, nameColl, listUrl); getListDatabase(); resetForm();">
                            Create
                          </v-btn>
                          <v-btn text @click="resetForm(); dialogColl = false;">
                            Close
                          </v-btn>
                        </v-card-actions>
                      </v-card>
                    </v-dialog>

                    <v-dialog v-if="i === 2" v-model="dialogImp" width="550">
                      <template v-slot:activator="{ on }">
                        <v-btn v-on="on">
                          <v-icon light dense>{{ el.icon }}</v-icon>
                          {{ el.text }}
                        </v-btn>
                      </template>
                      <v-card>
                        <v-card-title>Importing collection</v-card-title>
                        <v-card-text>
                          <div class="upload-container">
                            <input type="file" id="file_upload" multiple @change="loaded()" />
                          </div>
                          <v-form v-model="formValid">
                            <v-text-field label='Collection name' v-model="nameColl" type="text" required
                              :rules="[v => !!v || 'Insert a name', v => collNameCheck(v, item) || 'This name is already used', importing || 'Import a file', rightType || 'Invalid file type, must be a .json']">
                            </v-text-field>
                          </v-form>
                        </v-card-text>

                        <v-card-actions>
                          <v-spacer></v-spacer>
                          <v-btn class="upload-btn" color="primary" text :disabled="!formValid"
                            @click="dialogImp = false; importCollection(item, nameColl); imported = false; getListDatabase(); resetForm();">
                            Upload
                          </v-btn>
                          <v-btn color="primary" text @click="dialogImp = false; resetForm();">
                            Close
                          </v-btn>
                        </v-card-actions>
                      </v-card>
                    </v-dialog>
                  </v-list-item>
                </v-list>

                <!--Static collection buttons list-->
                <v-list v-if="item.type === 'static'">
                  <v-list-item v-for="(el, i) in itemsCollection" :key="i">
                    <v-dialog v-if="i === 0" v-model="dialogDelColl0" width="250">
                      <template v-slot:activator="{ on }">
                        <v-btn v-on="on">
                          <v-icon light dense>{{ el.icon }}</v-icon>
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
                          <v-icon light dense>{{ el.icon }}</v-icon>
                          {{ el.text }}
                        </v-btn>
                      </template>
                      <v-card>
                        <v-card-title>Importing collection</v-card-title>
                        <v-card-text>
                          <div class="upload-container">
                            <input type="file" id="file_upload" multiple @change="loaded()" />
                          </div>
                          <br />
                          <p><b>Check the box if you want to append this collection to an existing one</b></p>
                          <v-row style="align: center">
                            <v-checkbox v-model="append" hide-details class="shrink mr-2 mt-0"></v-checkbox>
                            <v-text-field v-if="append" label="Collection name" v-model=item.name type="text" disabled
                              :rules="[v => !!v || 'Insert a name', v => collNameCheck(v, item) || 'This name is already used', importing || 'Import a file', rightType || 'Invalid file type, must be a .json']">
                            </v-text-field>
                            <v-text-field v-else label="Collection name" v-model="nameColl" type="text" required
                              :rules="[v => !!v || 'Insert a name', v => collNameCheck(v, item) || 'This name is already used', importing || 'Import a file', rightType || 'Invalid file type, must be a .json']">
                            </v-text-field>
                          </v-row>
                        </v-card-text>

                        <v-card-actions>
                          <v-spacer></v-spacer>
                          <v-btn class="upload-btn" color="primary" text :disabled="!formValid"
                            @click="dialogImp = false; importCollection(item, nameColl, append); imported = false; append = false; getListDatabase(); resetForm();">
                            Upload
                          </v-btn>
                          <v-btn color="primary" text @click="dialogImp = false; append = false; resetForm();">
                            Close
                          </v-btn>
                        </v-card-actions>
                      </v-card>
                    </v-dialog>

                    <v-dialog v-if="i === 2" v-model="dialogExp" width="600">
                      <template v-slot:activator="{ on }">
                        <v-btn v-on="on">
                          <v-icon light dense>{{ el.icon }}</v-icon>
                          {{ el.text }}
                        </v-btn>
                      </template>
                      <v-card>
                        <v-card-title>
                          Exporting collection
                        </v-card-title>
                        <v-card-text>
                          <v-form v-model="formValid">
                            <v-text-field label="Database" v-model=item.db disabled type="text"></v-text-field>
                            <v-text-field label="Collection" v-model=item.name disabled type="text"></v-text-field>
                            <v-text-field label="File" hint="Without file extension" v-model="nameFile"
                              :rules="[ v => !!v || 'Insert a name']" required type="text">
                            </v-text-field>
                            <v-row>
                              <v-col>
                                <v-text-field label="Limit" hint="Maximum number of documents to retrive (default = -1)"
                                  v-model="limit"></v-text-field>
                              </v-col>
                              <v-col>
                                <v-text-field label="Offset" hint="The first document to retrieve (default = 0)"
                                  v-model="offset"></v-text-field>
                              </v-col>
                            </v-row>
                          </v-form>
                        </v-card-text>

                        <v-card-actions>
                          <v-spacer></v-spacer>
                          <v-btn color="primary" text :disabled="!formValid"
                            @click="dialogExp = false; exportCollection(item.db, item.name, nameFile, limit, offset); resetForm();">
                            Download
                          </v-btn>
                          <v-btn color="primary" text @click="resetForm(); dialogExp = false">
                            Close
                          </v-btn>
                        </v-card-actions>
                      </v-card>
                    </v-dialog>
                  </v-list-item>
                </v-list>

                <!--Dynamic collection buttons list-->
                <v-list v-if="item.type === 'dynamic'">
                  <v-list-item v-for="(el, i) in itemsDynamicCollection" :key="i">
                    <v-dialog v-if="i === 0" v-model="dialogDelColl0" width="250">
                      <template v-slot:activator="{ on }">
                        <v-btn v-on="on">
                          <v-icon light dense>{{ el.icon }}</v-icon>
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
                          <v-icon light dense>{{ el.icon }}</v-icon>
                          {{ el.text }}
                        </v-btn>
                      </template>
                      <v-card>
                        <v-card-title>
                          Exporting collection
                        </v-card-title>
                        <v-card-text>
                          <v-form v-model="formValid">
                            <v-text-field label="Database" v-model=item.db disabled type="text"></v-text-field>
                            <v-text-field label="Collection" v-model=item.name disabled type="text"></v-text-field>
                            <v-text-field label="File" hint="Without file extension" v-model="nameFile"
                              :rules="[ v => !!v || 'Insert a name']" required type="text">
                            </v-text-field>
                            <v-row>
                              <v-col>
                                <v-text-field label="Limit" hint="Maximum number of documents to retrive (default = -1)"
                                  v-model="limit"></v-text-field>
                              </v-col>
                              <v-col>
                                <v-text-field label="Offset" hint="The first document to retrieve (default = 0)"
                                  v-model="offset"></v-text-field>
                              </v-col>
                            </v-row>
                          </v-form>
                        </v-card-text>

                        <v-card-actions>
                          <v-spacer></v-spacer>
                          <v-btn color="primary" text :disabled="!formValid"
                            @click="dialogExp = false; exportCollection(item.db, item.name, nameFile); resetForm();">
                            Download
                          </v-btn>
                          <v-btn color="primary" text @click="resetForm(); dialogExp = false">
                            Close
                          </v-btn>
                        </v-card-actions>
                      </v-card>
                    </v-dialog>

                    <v-dialog v-if="i === 2" v-model="dialogUrl" width="500">
                      <template v-slot:activator="{ on }">
                        <v-btn v-on="on" @click="getListUrl(item.db, item.name)">
                          <v-icon light dense>{{ el.icon }}</v-icon>
                          {{ el.text }}
                        </v-btn>
                      </template>
                      <v-card>
                        <v-card-title>Managing urls</v-card-title>
                        <v-card-text>
                          <v-list shaped>
                            <v-list-item-group v-model="urls" multiple>
                              <template v-for="(url, i) in listUrls">
                                <v-divider v-if="!url" :key="`divider-${i}`"></v-divider>

                                <v-list-item v-else :key="`url-${i}`" :value="url"
                                  active-class="deep-blue--text text--accent-4">
                                  <template v-slot:default="{ active }">
                                    <v-list-item-content>
                                      <v-list-item-title v-text="url"></v-list-item-title>
                                    </v-list-item-content>

                                    <v-list-item-action>
                                      <v-checkbox :input-value="active" color="deep-purple accent-4"></v-checkbox>
                                    </v-list-item-action>
                                  </template>
                                </v-list-item>
                              </template>
                            </v-list-item-group>
                          </v-list>
                        </v-card-text>

                        <v-card-actions>
                          <v-spacer></v-spacer>
                          <v-dialog v-model="dialogAddUrl" width="550">
                            <template v-slot:activator="{ on }">
                              <v-btn v-on="on">
                                Add url
                              </v-btn>
                            </template>
                            <v-card>
                              <v-card-title>Adding urls</v-card-title>
                              <v-card-text>
                                <v-form v-model="formValid">
                                  <v-text-field label="Database" v-model=item.db disabled type="text"></v-text-field>
                                  <v-text-field label="Collection" v-model=item.name disabled type="text">
                                  </v-text-field>
                                  <v-text-field label="Url list" hint="To add more urls: write them separated by a ','"
                                    v-model="nameUrl"
                                    :rules="[ v => !!v || 'Insert at least one URL', , v => noSpace(v) || 'Do not insert spaces before or after the ,']"
                                    required type="text">
                                  </v-text-field>
                                </v-form>
                              </v-card-text>

                              <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-btn color="primary" text :disabled="!formValid"
                                  @click="dialogAddUrl = false; addUrl(item.db, item.name, nameUrl); getListUrl(item.db, item.name); resetForm();">
                                  Add urls
                                </v-btn>
                                <v-btn color="primary" text
                                  @click="dialogAddUrl = false; getListUrl(item.db, item.name); resetForm()">
                                  Cancel
                                </v-btn>
                              </v-card-actions>
                            </v-card>
                          </v-dialog>
                          &nbsp;&nbsp;
                          <v-btn v-if="!urls.length" disabled>
                            Remove
                          </v-btn>
                          <v-dialog v-else v-model="dialogRemoveUrl" width="550">
                            <template v-slot:activator="{ on }">
                              <v-btn v-on="on">
                                Remove
                              </v-btn>
                            </template>
                            <v-card>
                              <v-card-title>Removing urls</v-card-title>

                              <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-btn color="primary" text
                                  @click="dialogRemoveUrl = false; removeMoreUrls(item.db, item.name, getIndex(urls)); getListUrl(item.db, item.name)">
                                  Remove urls
                                </v-btn>
                                <v-btn color="primary" text @cilck="dialogRemoveUrl = false">
                                  Cancel
                                </v-btn>
                              </v-card-actions>
                            </v-card>
                          </v-dialog>

                          &nbsp;&nbsp;
                          <v-btn @click="dialogUrl = false">
                            Cancel
                          </v-btn>
                        </v-card-actions>
                      </v-card>
                    </v-dialog>

                    <v-dialog v-if="i === 3" v-model="dialogFreq" width="600">
                      <template v-slot:activator="{ on }">
                        <v-btn v-on="on" @click="getListUrl(item.db, item.name)">
                          <v-icon light dense>{{ el.icon }}</v-icon>
                          {{ el.text }}
                        </v-btn>
                      </template>
                      <v-card>
                        <v-card-title>Set frequency</v-card-title>
                        <v-card-text>
                          <v-form v-model="formValid">
                            <v-text-field label="Database" v-model=item.db disabled type="text"></v-text-field>
                            <v-text-field label="Collection" v-model=item.name disabled type="text"></v-text-field>
                            <v-select v-model="urls" :items="listUrls" :menu-props="{ maxHeight: '400' }" label="Select"
                              hint="Select an url to modify his frequency-update" persistent-hint
                              :rules="[v => v.length > 0 || 'Select an URL']" required></v-select>
                            <v-row>
                              <v-col>
                                <v-text-field label="week" v-model="frequencyWeek"></v-text-field>
                              </v-col>
                              <v-col>
                                <v-text-field label="day" v-model="frequencyDay"></v-text-field>
                              </v-col>
                              <v-col>
                                <v-text-field label="hour" v-model="frequencyHour"
                                  :rules="[ msFrequency > 3600000 || 'The frequency is too low', msFrequency < 2147483647 || 'The frequency is too high' ]"
                                  required></v-text-field>
                              </v-col>
                            </v-row>
                          </v-form>
                        </v-card-text>
                        <v-card-actions>
                          <v-btn color="primary" text :disabled="!formValid"
                            @click="dialogFreq = false; setFrequency(item.db, item.name, getIndex(urls), msFrequency); getListDatabase(); resetForm();">
                            Set
                          </v-btn>
                          <v-btn color="primary" text @click="resetForm(); dialogFreq = false">
                            Close
                          </v-btn>
                        </v-card-actions>
                      </v-card>
                    </v-dialog>

                    <v-dialog v-if="i === 4" v-model="dialogStop" width="400">
                      <template v-slot:activator="{ on }">
                        <v-btn v-on="on" style="color: red">
                          <v-icon light dense>{{ el.icon }}</v-icon>
                          {{ el.text }}
                        </v-btn>
                      </template>
                      <v-card>
                        <v-card-title>Do you want to stop updating this collection automatically?</v-card-title>

                        <v-card-actions>
                          <v-btn color="primary" text @click="dialogStop = false; stopUpdate(item.db, item.name)">
                            yes
                          </v-btn>
                          <v-btn color="primary" text @click="dialogStop = false">
                            No
                          </v-btn>
                        </v-card-actions>
                      </v-card>
                    </v-dialog>
                  </v-list-item>
                </v-list>

                <!--Virtual collection buttons list-->
                <v-list v-if="item.type === 'virtual'">
                  <v-list-item v-for="(el, i) in itemsVirtualCollection" :key="i">
                    <v-dialog v-if="i === 0" v-model="dialogDelColl0" width="250">
                      <template v-slot:activator="{ on }">
                        <v-btn v-on="on">
                          <v-icon light dense>{{ el.icon }}</v-icon>
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
                          <v-icon light dense>{{ el.icon }}</v-icon>
                          {{ el.text }}
                        </v-btn>
                      </template>
                      <v-card>
                        <v-card-title>
                          Exporting collection
                        </v-card-title>
                        <v-card-text>
                          <v-form v-model="formValid">
                            <v-text-field label="Database" v-model=item.db disabled type="text"></v-text-field>
                            <v-text-field label="Collection" v-model=item.name disabled type="text"></v-text-field>
                            <v-text-field label="File" hint="Without file extension" v-model="nameFile"
                              :rules="[ v => !!v || 'Insert a name']" required type="text">
                            </v-text-field>
                            <v-row>
                              <v-col>
                                <v-text-field label="Limit" hint="Maximum number of documents to retrive (default = -1)"
                                  v-model="limit"></v-text-field>
                              </v-col>
                              <v-col>
                                <v-text-field label="Offset" hint="The first document to retrieve (default = 0)"
                                  v-model="offset"></v-text-field>
                              </v-col>
                            </v-row>
                          </v-form>
                        </v-card-text>

                        <v-card-actions>
                          <v-spacer></v-spacer>
                          <v-btn color="primary" text :disabled="!formValid"
                            @click="dialogExp = false; exportCollection(item.db, item.name, nameFile); resetForm();">
                            Download
                          </v-btn>
                          <v-btn color="primary" text @click="resetForm(); dialogExp = false">
                            Close
                          </v-btn>
                        </v-card-actions>
                      </v-card>
                    </v-dialog>

                    <v-dialog v-if="i === 2" v-model="dialogUrl" width="500">
                      <template v-slot:activator="{ on }">
                        <v-btn v-on="on" @click="getListUrl(item.db, item.name)">
                          <v-icon light dense>{{ el.icon }}</v-icon>
                          {{ el.text }}
                        </v-btn>
                      </template>
                      <v-card>
                        <v-card-title>Managing urls</v-card-title>
                        <v-card-text>
                          <v-list shaped>
                            <v-list-item-group v-model="urls" multiple>
                              <template v-for="(url, i) in listUrls">
                                <v-divider v-if="!url" :key="`divider-${i}`"></v-divider>

                                <v-list-item v-else :key="`url-${i}`" :value="url"
                                  active-class="deep-blue--text text--accent-4">
                                  <template v-slot:default="{ active }">
                                    <v-list-item-content>
                                      <v-list-item-title v-text="url"></v-list-item-title>
                                    </v-list-item-content>

                                    <v-list-item-action>
                                      <v-checkbox :input-value="active" color="deep-purple accent-4"></v-checkbox>
                                    </v-list-item-action>
                                  </template>
                                </v-list-item>
                              </template>
                            </v-list-item-group>
                          </v-list>
                        </v-card-text>

                        <v-card-actions>
                          <v-spacer></v-spacer>
                          <v-dialog v-model="dialogAddUrl" width="550">
                            <template v-slot:activator="{ on }">
                              <v-btn v-on="on">
                                Add url
                              </v-btn>
                            </template>
                            <v-card>
                              <v-card-title>Adding urls</v-card-title>
                              <v-card-text>
                                <v-form v-model="formValid">
                                  <v-text-field label="Database" v-model=item.db disabled type="text"></v-text-field>
                                  <v-text-field label="Collection" v-model=item.name disabled type="text">
                                  </v-text-field>
                                  <v-text-field label="Url list" hint="To add more urls: write them separated by a ','"
                                    v-model="nameUrl"
                                    :rules="[ v => !!v || 'Insert at least one URL', v => noSpace(v) || 'Do not insert spaces before or after the ,']"
                                    required type="text">
                                  </v-text-field>
                                </v-form>
                              </v-card-text>

                              <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-btn color="primary" text :disabled="!formValid"
                                  @click="dialogAddUrl = false; addUrl(item.db, item.name, nameUrl); getListUrl(item.db, item.name); resetForm();">
                                  Add urls
                                </v-btn>
                                <v-btn color="primary" text
                                  @click="dialogAddUrl = false; getListUrl(item.db, item.name); resetForm()">
                                  Cancel
                                </v-btn>
                              </v-card-actions>
                            </v-card>
                          </v-dialog>
                          &nbsp;&nbsp;
                          <v-btn v-if="!urls.length" disabled>
                            Remove
                          </v-btn>
                          <v-dialog v-else v-model="dialogRemoveUrl" width="550">
                            <template v-slot:activator="{ on }">
                              <v-btn v-on="on">
                                Remove
                              </v-btn>
                            </template>
                            <v-card>
                              <v-card-title>Removing urls</v-card-title>

                              <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-btn color="primary" text
                                  @click="dialogRemoveUrl = false; removeMoreUrls(item.db, item.name, getIndex(urls)); getListUrl(item.db, item.name)">
                                  Remove urls
                                </v-btn>
                                <v-btn color="primary" text @cilck="dialogRemoveUrl = false">
                                  Cancel
                                </v-btn>
                              </v-card-actions>
                            </v-card>
                          </v-dialog>

                          &nbsp;&nbsp;
                          <v-btn @click="dialogUrl = false">
                            Cancel
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
        <!--Selectable treeview for deleting more collection simultaneously------->
        <v-container v-else style="max-height: 61vh; padding: 0px; padding-top: 3px" class="overflow-y-auto">
          <v-treeview dark dense activatable selectable v-model="colls" :items="listDatabases"
            :load-children="getListCollection" :search='search' :filter='filter' item-key="id" open-on-click transition
            return-object active-class="activeNode">
            <template v-slot:prepend="{item, open}">
              <v-icon dense>
                {{open ? iconOpen[item.type] : icon[item.type]}}
              </v-icon>
            </template>
          </v-treeview>
          <v-row>
            <v-col cols="5">
              <v-btn small style="background-color: white" @click="flag = false">
                <v-icon>mdi-arrow-u-left-top</v-icon>
                Cancel
              </v-btn>
            </v-col>
            <v-col cols="2" class="ml-4">
              <v-btn v-if="!isColl(colls)" disabled small style="background-color: red">
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
                    Are you sure that you want to delete these collections?
                  </v-card-title>
                  <v-card-text>
                    <v-scroll-x-transition group hide-on-leave>
                      <v-chip v-for="(node, i) in colls" :key="i" color="grey" dark small class="ma-1">
                        {{ node.db }}.{{ node.name }}
                      </v-chip>
                    </v-scroll-x-transition>
                  </v-card-text>

                  <v-card-actions>
                    <v-dialog v-model="dialogDelMoreColls" width="100">
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
    <v-row style="height: 5vh;">
      <v-btn v-if="online" depressed block style="background-color: green; padding: 0px; height: 100%;">
        ONLINE
        <v-icon>
          mdi-access-point-check
        </v-icon>
      </v-btn>
      <v-tooltip v-else right open-delay=400>
        <template v-slot:activator="{on, attrs}">
          <v-btn v-on="on" v-bind="attrs" depressed block
            style="background-color: red; padding: 0px; height: 100%" @click="reconnect()">
            OFFLINE
            <v-icon>
              mdi-access-point-remove
            </v-icon>
          </v-btn>
        </template>
        <span>click to go online</span>
      </v-tooltip>
    </v-row>
  </v-sheet>
</template>

<script>
import Vue from 'vue'
import * as com from '../functions/communication'
import { VTreeviewNode } from 'vuetify/lib'
import { connect, returnWS } from '../functions/connection.js'

// To suppress all warnigns
Vue.config.silent = true

VTreeviewNode.mixin({
  data: () => ({
    isHover: false
  }),
  computed: {
    scopedProps () {
      return {
        item: this.item,
        leaf: !this.children,
        selected: this.isSelected,
        indeterminate: this.isIndeterminate,
        active: this.isActive,
        open: this.isOpen,
        hover: this.isHover
      }
    }
  },
  methods: {
    onMouseEnter () {
      this.isHover = true
    },
    onMouseLeave () {
      this.isHover = false
    },
    genNode () {
      const children = [this.genContent()]

      if (this.selectable) children.unshift(this.genCheckbox())

      if (this.hasChildren) {
        children.unshift(this.genToggle())
      } else {
        children.unshift(...this.genLevel(1))
      }

      children.unshift(...this.genLevel(this.level))

      const element = this.$createElement(
        'div',
        this.setTextColor(this.isActive && this.color, {
          staticClass: 'v-treeview-node__root',
          class: {
            [this.activeClass]: this.isActive
          },
          on: {
            click: () => {
              if (this.openOnClick && this.hasChildren) {
                this.checkChildren().then(this.open)
              } else if (this.activatable && !this.disabled) {
                this.isActive = !this.isActive
                this.treeview.updateActive(
                  this.key,
                  this.isActive
                )
                this.treeview.emitActive()
              }
            },
            dblclick: () => {
              this.treeview.emitDblclick(this.item)
            }
          }
        }),
        children
      )

      element.data = element.data || {}
      this._g(element.data, {
        mouseenter: this.onMouseEnter,
        mouseleave: this.onMouseLeave
      })

      return element
    }
  }
})

export default {
  data () {
    return {
      formValid: true,
      activeItem: null,
      // dialogs opened when pressing a button
      dialogColls: false, // selectable treeview dialog
      dialogDelMoreColls: false, // selectable treeview dialog
      dialogDb: false,
      dialogDelDb: false,
      dialogDelDb0: false,
      dialogDelDb1: false,
      dialogDelDb2: false,
      dialogColl: false,
      dialogUrl: false,
      dialogAddUrl: false,
      dialogRemoveUrl: false,
      dialogFreq: false,
      dialogExp: false,
      dialogImp: false,
      dialogImp1: false,
      dialogDelColl0: false,
      dialogDelColl1: false,
      dialogStop: false,
      // online parameters
      active: false,
      online: false,
      flag: false, // boolean setted on true if we are in the selectable treeview
      // functions parameters, compiled by the user
      type: '',
      typeJson: false,
      nameDb: '',
      nameColl: '',
      nameUrl: '',
      nameFile: '',
      limit: '-1', // already set to default value
      offset: '0', // already set to default value
      append: false,
      imported: false,
      index: '',
      indexUrl: '',
      indexFreqUpdate: '',
      frequencyWeek: null,
      frequencyDay: null,
      frequencyHour: null,
      searchKeySensitive: true,
      search: null,
      id: Math.floor(Math.random() * 10),
      connection: null,
      on: null,
      listDatabases: [], // to display the list of DBs in the treeview
      colls: [],
      listUrls: [],
      indexes: [], // to display the list of urls in a collection
      urls: [],
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
      itemsDynamicCollection: [
        {
          text: 'Delete collection',
          icon: 'mdi-close'
        },
        {
          text: 'Export Collection',
          icon: 'mdi-database-export'
        },
        {
          text: 'Manage url',
          icon: 'mdi-file-link'
        },
        {
          text: 'Set frequency',
          icon: 'mdi-update'
        },
        {
          text: 'Stop update',
          icon: 'mdi-pause-octagon'
        }
      ],
      itemsVirtualCollection: [
        {
          text: 'Delete collection',
          icon: 'mdi-close'
        },
        {
          text: 'Export Collection',
          icon: 'mdi-database-export'
        },
        {
          text: 'Manage url',
          icon: 'mdi-file-link'
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
    msFrequency () {
      return (60 * 60 * 1000 * this.frequencyHour + 60 * 60 * 1000 * 24 * this.frequencyDay + 60 * 60 * 1000 * 24 * 7 * this.frequencyWeek)
    },
    nDB () {
      return this.listDatabases.length
    },
    importing () {
      return this.imported
    },
    rightType () {
      return this.typeJson
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
    // Import communication functions
    handleResponse: com.handleResponse,
    getListDatabase: com.getListDatabase,
    getListUrl: com.getListUrl,
    getListCollection: com.getListCollection,
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
    removeMoreUrls: com.removeMoreUrls,
    ping: com.ping,
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
    emitDblclick (item) {
      this.$emit('item:dblclick', item)
    },
    async buildWorkspace (value) {
      if (!value[0]) {
        this.emptyWorkspace()
      } else {
        this.$root.$refs.Workspace.updateParam(value[0].db, value[0].name, value)
      }
    },
    getIndex (arr) {
      for (let i = 0; i < this.listUrls.length; i++) {
        const el1 = this.listUrls[i]
        if (!Array.isArray(arr)) {
          if (el1 === arr) {
            return i
          }
        } else {
          for (let j = 0; j < arr.length; j++) {
            const el2 = arr[j]
            if (el2 === el1) {
              this.indexes.push(i.toString())
            }
          }
        }
      }
      return this.indexes
    },
    emptyWorkspace () {
      this.$root.$refs.Workspace.updateParam(null, null)
    },
    generateKey (item) {
      return item.db + item.name
    },
    isColl (arr) {
      let res = false
      arr.forEach(collection => {
        if (collection.type !== 'database') {
          res = true
        }
      })
      return res
    },
    dbNameCheck (value) {
      let res = true
      this.listDatabases.forEach(db => {
        if (db.name === value) {
          res = false
        }
      })
      return res
    },
    collNameCheck (value, item) {
      let res = true
      if (item.children.length === 0) {
        this.getListCollection(item)
      }
      item.children.forEach(coll => {
        if (coll.name === value) {
          res = false
        }
      })
      return res
    },
    resetForm () {
      this.type = ''
      this.nameDb = ''
      this.nameColl = ''
      this.nameUrl = ''
      this.nameFile = ''
      this.frequencyDay = null
      this.frequencyHour = null
      this.frequencyWeek = null
      this.listUrls = []
      this.urls = []
      if (document.getElementById('file_upload')) {
        document.getElementById('file_upload').value = null
      }
    },
    async loaded () {
      this.imported = true
      const fileInput = document.getElementById('file_upload').files[0]
      const fileread = new FileReader()
      await new Promise(resolve => {
        fileread.onload = function (e) {
          const cond = fileInput.type.match('application/json')
          resolve(cond)
        }
        fileread.readAsText(fileInput)
      }).then((res) => {
        if (res) {
          this.typeJson = true
        } else {
          this.typeJson = false
        }
      })
    },
    noSpace (value) {
      let res = true
      if (value) {
        if (value.split(', ').length > 1 || value.split(' ,').length > 1) {
          res = false
        }
      }
      return res
    }
  }
}
</script>

<style lang="scss">

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
  padding: 0px;
  margin: 0px;
  font-size: medium;
}

.v-treeview-node__level{
  width: 18px;
}

.v-list{
  padding: 0px;
}

.v-list .v-btn{
  font-weight: 500;
  size: small;
  font-size: 0.8rem;
  width: 200px;
  align-self: auto;
  letter-spacing: 0em;
}

.v-list-item{
  padding: 0px;
  margin: 0px;
  min-height: 5px;
}

.v-tooltip__content {
  background-color: white;
  color: black;
  opacity: 1;
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
