import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import BookingView from '../views/BookingView.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/banya/arasan'
  },
  {
    path: '/banya/:slug',
    name: 'booking',
    component: BookingView,
    props: true
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/banya/arasan'
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