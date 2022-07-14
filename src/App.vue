<template>
  <v-app id="body">
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script>
export default {
  name: 'App',
  data: () => ({
    //
  }),
  created () {
    document.title = 'Loading...'
  }
}
</script>

<style>

* {
  margin: 0 !important;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: left;
}

#body {
  min-width: 100px;
  min-height: 100px;
  display: flex;
  flex-flow: column;
  height: 100%;
}

</style>
