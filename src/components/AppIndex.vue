<template>
  <v-sheet id="body">
    <v-sheet id="firstRow">
      <v-row no-gutter>
        <v-col cols="2" id="upLeft">
          Qualcosa
        </v-col>
        <v-col id="upRight">
          wkdnkòjqcn
        </v-col>
      </v-row>
    </v-sheet>
    <v-sheet id="secondRow">
      <v-row no-gutter>
        <v-col cols="2" id="bottomLeft">
          Qualcosa
        </v-col>
        <v-col id="bottomRight">
          wkdnkòjqcn
        </v-col>
      </v-row>
    </v-sheet>
  </v-sheet>
</template>

<style scoped>

#firstRow {
  height: 50px;
}

#secondRow {

}

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
