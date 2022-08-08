<template>
  <v-sheet id="body">
      <v-row style="height: 15vh;">
        <v-col cols="2" id="upLeft">
          <h1
          style="color: #4D4646;
          font-size: 2vw;
          text-align: center;"
          >
          J-CO-DS WEB</h1>
        </v-col>
        <v-col id="upRight">
          <ListFunctions/>
        </v-col>
      </v-row>
      <v-row no-gutter style="height: 92vh;">
        <v-col cols="2" id="bottomLeft">
          <ListDB/>
        </v-col>
        <v-col id="bottomRight">
          Workspace
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
#upRight {
  background-color: #F5EAEA;
  padding-top: 5px;
}
#bottomLeft {
  padding: 0px;
  background-color: lightgray;
}
#bottomRight {
  background-color: #F5EAEA;
  border-top: solid orange 3px;
}

</style>

<script>
import ListDB from './ListDB.vue'
import ListFunctions from './ListFunctions.vue'

export default {
  components: {
    ListDB,
    ListFunctions
  }
}
</script>
