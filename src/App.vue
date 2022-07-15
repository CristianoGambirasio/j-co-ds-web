<template>
  <v-app>
    <v-main>
      <router-view/>
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
    document.title = 'J-CO-DS WEB'
  }
}
</script>

<style>

* {
  margin:0 !important;
}

#body {
  min-width: 100px;
  min-height: 700px;
}
</style>
