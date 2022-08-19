import Vue from 'vue'
import VueRouter from 'vue-router'
import HomeView from '../views/HomeView.vue'
import AppMenu from '../components/AppMenu.vue'
import AppWorkspace from '../components/AppWorkspace.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/AppMenu',
    name: 'menu',
    component: AppMenu
  },
  {
    path: '/AppWorkspace',
    name: 'workspace',
    component: AppWorkspace
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
