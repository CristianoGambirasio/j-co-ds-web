<template>
  <AppIndex />
</template>

<script>
import AppIndex from '../components/AppIndex'

export default {
  name: 'HomeView',
  created () {
    document.title = 'Home'
  },
  components: {
    AppIndex
  }
}
</script>
