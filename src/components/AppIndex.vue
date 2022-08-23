<template>
  <v-sheet id="body">
    <v-row style="height: 100vh">
      <v-col cols="2" id="left" style="padding: 0;">
        <v-row id="title" style="height: 10vh;">
          <h1 style="color: #4D4646;
          font-size: 2vw;
          text-align: center;">
          J-CO-DS WEB</h1>
        </v-row>
        <v-row id="appMenu" style="height: 90vh;">
          <AppMenu />
        </v-row>
      </v-col>
      <v-col id="workspace" style="padding: 0;">
        <AppWorkspace />
      </v-col>
    </v-row>
  </v-sheet>
</template>

<style scoped>

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
import AppMenu from './AppMenu.vue'
import AppWorkspace from './AppWorkspace.vue'

export default {
  components: {
    AppMenu,
    AppWorkspace
  }
}
</script>
