<template>
  <v-sheet id="body">
      <v-row style="height: 8vh;">
        <v-col cols="2" class="upLeft">
          Logo
        </v-col>
        <v-col class="upRight">
          <ListFunctions/>
        </v-col>
      </v-row>
      <v-row no-gutter style="height: 92vh;">
        <v-col cols="2" id="bottomLeft">
          <ListDB/>
        </v-col>
        <v-col class="bottomRight">
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
.upLeft {
  background-color: red;
}
.upRight {
  background-color: green;
}

#bottomLeft {
  padding: 0px;
  background-color: lightgray;
}
.bottomRight {
  background-color: orange;
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
