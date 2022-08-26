import Vue from 'vue'
import App from './App.vue'
import router from './router/index'
import vuetify from './plugins/vuetify'

Vue.config.productionTip = false
Vue.prototype.$handleResponseOccupied = false
Vue.prototype.$listDatabases = []

new Vue({
  router,
  vuetify,
  render: h => h(App)
}).$mount('#app')
