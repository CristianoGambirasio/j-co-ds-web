<template>
  <v-sheet id="body">
    <v-row style="height: 12vh;">
      <v-col cols="2" id="upLeft">
        <h1 style="color: #4D4646;
          font-size: 2vw;
          text-align: center;">
          J-CO-DS WEB</h1>
      </v-col>
      <v-col id="rightSide" style="height:700px">
        Workspace
      </v-col>
    </v-row>
    <v-row no-gutter style="height: 92vh;">
      <v-col cols="2" id="bottomLeft">
        <AppMenu />
      </v-col>
    </v-row>
  </v-sheet>
</template>

<style scoped>

:root {
  --primary-color: green;
  --on-primary-color: black;
}
#upLeft {
  background-color: #7FCD91;
  padding-top: 25px;
}
#bottomLeft {
  padding: 0px;
  background-color: lightgray;
}
#rightSide {
  background-color: #F5EAEA;
}
</style>

<script>
import AppMenu from './AppMenu.vue'

export default {
  components: {
    AppMenu
  }
}
</script>
