import type { Banya, ExtraService } from '@/types/booking'

export const categories = ['Все', 'На дровах', 'С бассейном', 'Хамам'] as const

export const banyas: Banya[] = [
  {
    id: 1,
    name: 'Кедровый сруб №1',
    type: 'Дровяная печь',
    category: 'На дровах',
    pricePerHour: 10000,
    capacity: 6,
    rating: 5.0,
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=700&q=80',
  },
  {
    id: 2,
    name: 'Скандинавский люкс',
    type: 'Бассейн + купель',
    category: 'С бассейном',
    pricePerHour: 14000,
    capacity: 10,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=700&q=80',
  },
]

export const extraServices: ExtraService[] = [
  { id: 'venik', name: 'Дубовый веник (запаренный)', price: 1500 },
  { id: 'sheets', name: 'Комплект белья и тапочек', price: 1000 },
  { id: 'tea', name: 'Самовар на травах с медом', price: 2500 },
]

export const durationOptions = [2, 3, 4, 5] as const

export const ADMIN_PHONE = '77000000000'
