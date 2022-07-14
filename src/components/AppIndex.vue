<template>
  <v-sheet id="body">
      <v-row style="height: 8vh;">
        <v-col cols="2" id="upLeft">
          Logo
        </v-col>
        <v-col id="upRight">
          Funzioni
        </v-col>
      </v-row>
      <v-row no-gutter style="height: 92vh;">
        <v-col cols="2" id="bottomLeft">
          Lista DB
          <ListDB/>
        </v-col>
        <v-col id="bottomRight">
          Workspace
        </v-col>
      </v-row>
  </v-sheet>
</template>

<style scoped>

#upLeft {
  background-color: red;
}

#upRight {
  background-color: green;
}

#bottomLeft {
  background-color: blue;
}

#bottomRight {
  background-color: orange;
}
</style>

<script>
import ListDB from './ListDB.vue'

export default {
  components: {
    ListDB
  }
}
</script>
