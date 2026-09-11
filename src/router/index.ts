import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import BookingView from '../views/BookingView.vue'

const routes: Array<RouteRecordRaw> = [
  
  {
    path: '/banya/:slug',
    name: 'booking',
    component: BookingView,
    props: true
  }
  
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0, behavior: 'smooth' }
  }
})

export default router