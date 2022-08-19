<template>
  <div>
    <v-text-field type="text" v-model="input_workspace" @change="emitEventChanged"></v-text-field>
  </div>
</template>

<script>

export default {
  data () {
    return {
      input_one: 'Hello from ComponentTwo'
    }
  },
  methods: {
    emitEventChanged () {
      this.$emit('CustomEventInputChanged', this.input_workspace)
    }
  }
}
</script>
