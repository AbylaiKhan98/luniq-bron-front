import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import BookingView from '../views/BookingView.vue'

const routes: Array<RouteRecordRaw> = [
  // 1. Короткая ссылка: https://reserve.luniq.net/:slug (например, /otbasy)
  {
    path: '/:slug',
    name: 'booking',
    component: BookingView,
    props: true
  },
  // 2. Обратная совместимость (если кто-то перейдет по старой ссылке /banya/:slug)
  {
    path: '/banya/:slug',
    redirect: to => `/${to.params.slug}`
  },
  // 3. Заглушка, если открыли просто корень сайта без бани (https://reserve.luniq.net/)
  {
    path: '/',
    name: 'empty-root',
    component: {
      template: `
        <div class="min-h-screen flex items-center justify-center p-6 bg-[#F9FAFB] text-center font-sans">
          <div class="bg-white p-8 rounded-3xl border border-neutral-200/80 shadow-sm max-w-sm w-full space-y-3">
            <div class="w-12 h-12 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto text-neutral-400">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h2 class="text-base font-extrabold text-neutral-900">Сервис бронирования</h2>
            <p class="text-xs text-neutral-500 leading-relaxed">
              Пожалуйста, перейдите по персональной ссылке вашей бани (например: <code>/otbasy</code>).
            </p>
          </div>
        </div>
      `
    }
  },
  // 4. Перехват любых неизвестных страниц
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
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