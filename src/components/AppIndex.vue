<template>
  <v-sheet id="body">
    <v-row style="height: 100vh;">
      <v-col cols="2" id="left" style="padding: 0;">
        <v-row id="title" style="height: 10vh; align-content: center; justify-content: center; padding: 0; padding-right: 10px;">
          <h1 style="color: #4D4646;
          font-size: 2vw;">
          J-CO-DS WEB</h1>
        </v-row>
        <v-row id="appMenu" style="height: 90vh;">
          <v-container fluid fill-height style="padding: 0;">
            <AppMenu />
          </v-container>
        </v-row>
      </v-col>
      <v-col cols="10" id="workspace" style="padding: 0;">
        <v-container fluid fill-height style="padding: 0;">
          <AppWorkspace />
        </v-container>
      </v-col>
    </v-row>
  </v-sheet>
</template>

<style>

:root {
  --primary-color: green;
  --on-primary-color: black;
}
#title {
  background-color: #7FCD91;
  padding-top: 25px;
}
#appMenu {
  padding: 0px;
  background-color: #4D4646;
}
#workspace {
  background-color: #F5EAEA;
}
</style>

<script>
import { connect } from '../functions/connection.js'
import AppMenu from './AppMenu.vue'
import AppWorkspace from './AppWorkspace.vue'

export default {
  components: {
    AppMenu,
    AppWorkspace
  },
  mounted () {
    connect()
  }
}
</script>
