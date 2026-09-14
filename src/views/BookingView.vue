<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'

type Lang = 'ru' | 'kz'

const route = useRoute()
const STRAPI_BASE_URL = import.meta.env.VITE_STRAPI_BASE_URL || 'http://localhost:1337'

const currentLang = ref<Lang>('ru')
const currentStep = ref(1)
const isLoading = ref(true)
const loadError = ref('')

// Состояния отправки заказа
const isSubmitting = ref(false)
const isSuccessModalOpen = ref(false)

// Галерея (Lightbox)
const activeGalleryImages = ref<string[]>([])
const activeImageIndex = ref(0)
const isGalleryOpen = ref(false)

// Полноэкранный видеоплеер
const activeVideo = ref<any>(null)
const isVideoModalOpen = ref(false)
const isModalVideoMuted = ref(true)
const modalVideoRef = ref<HTMLVideoElement | null>(null)

// Тексты интерфейса
const t = {
  ru: {
    whatsapp: 'WhatsApp',
    call: 'Позвонить',
    map: '2GIS',
    insta: 'Instagram',
    bookingBadge: 'Онлайн-бронирование',
    videoSectionTitle: 'Видеообзоры комплекса',
    videoSectionSubtitle: 'Живая атмосфера',
    videoDefaultBadge: 'Обзор',
    step1Title: 'Выберите зал или кабинку',
    step1Subtitle: 'Ознакомьтесь с интерьером и подберите вариант под вашу компанию',
    step2Title: 'Дата и время заезда',
    step2Subtitle: 'Выберите удобный день и время посещения',
    step3Title: 'Оформление брони',
    step3Subtitle: 'Проверьте данные заказа и укажите контактный телефон',
    all: 'Все залы',
    perHour: '/час',
    today: 'Сегодня',
    entryTime: 'Время заезда',
    noSlotsToday: 'На выбранную дату свободных слотов нет',
    duration: 'Количество часов',
    minOrder: 'Мин. заказ',
    hours: 'ч',
    customDuration: 'Свой выбор',
    guests: 'Количество гостей',
    customGuests: 'Другое число',
    chooseFromList: 'Выбрать из списка',
    extras: 'Банные принадлежности и товары',
    extrasNote: 'Суммируются в общий чек заказа',
    contacts: 'Контакты гостя',
    namePlaceholder: 'Ваше имя',
    phonePlaceholder: '+7 (7XX) XXX-XX-XX',
    total: 'Итого к оплате',
    prepaymentTitle: 'Kaspi Pay',
    prepaymentDesc: 'Администратор выставит счет на задаток в мобильное приложение Kaspi.kz',
    depositLabel: 'Задаток',
    samePhoneCheckbox: 'Выставить счет на этот же номер',
    changePhoneBtn: '+ Указать другой номер для Kaspi',
    returnMainPhoneBtn: 'Вернуть основной номер',
    customKaspiLabel: 'Номер для счета Kaspi',
    customKaspiPlaceholder: '+7 (7XX) XXX-XX-XX',
    selectRoomBtn: 'Выбрать',
    selectedRoomBtn: 'Выбрано',
    cancelSelectionHint: 'отменить',
    selectedRoomBadge: 'Выбранный зал',
    chooseRoomPrompt: 'Зал не выбран',
    nextToDate: 'Выбрать дату и время',
    next: 'Продолжить',
    submitBookingBtn: 'Отправить бронь',
    phoneAlert: 'Пожалуйста, введите полный номер телефона (+7 7XX XXX-XX-XX)',
    kaspiPhoneAlert: 'Пожалуйста, введите полный номер для счета Kaspi (+7 7XX XXX-XX-XX)',
    timeAlert: 'Выберите время заезда',
    loading: 'Загрузка данных комплекса...',
    notFound: 'Банный комплекс не найден',
    msgHall: 'Зал / Кабинка',
    none: 'Не выбрано',
    weekdayShort: 'будни',
    weekendShort: 'вых',
    tariffLabel: 'Действующий тариф:',
    tariffWeekend: 'Пт – Вс / Праздники',
    tariffWeekday: 'Будние дни'
  },
  kz: {
    whatsapp: 'WhatsApp',
    call: 'Қоңырау',
    map: '2GIS',
    insta: 'Instagram',
    bookingBadge: 'Онлайн-брондау',
    videoSectionTitle: 'Кешеннің бейнешолуы',
    videoSectionSubtitle: 'Кешен атмосферасы',
    videoDefaultBadge: 'Шолу',
    step1Title: 'Залды немесе кабинаны таңдаңыз',
    step1Subtitle: 'Интерьерді көріп, компанияңызға қолайлы нұсқаны таңдаңыз',
    step2Title: 'Күні мен келу уақыты',
    step2Subtitle: 'Кешенге келетін күніңіз бен сағатыңызды белгілеңіз',
    step3Title: 'Брондауды рәсімдеу',
    step3Subtitle: 'Тапсырыс құрамын тексеріп, байланыс нөміріңізді енгізіңіз',
    all: 'Барлық залдар',
    perHour: '/сағ',
    today: 'Бүгін',
    entryTime: 'Келу уақыты',
    noSlotsToday: 'Бұл күнге бос уақыт қалмады',
    duration: 'Ұзақтығы',
    minOrder: 'Ең аз тапсырыс',
    hours: 'сағ',
    customDuration: 'Басқа уақыт',
    guests: 'Қонақтар саны',
    customGuests: 'Басқа сан',
    chooseFromList: 'Тізімнен таңдау',
    extras: 'Монша керек-жарақтары мен тауарлар',
    extrasNote: 'Жалпы тапсырыс сомасына қосылады',
    contacts: 'Қонақ мәліметтері',
    namePlaceholder: 'Атыңыз',
    phonePlaceholder: '+7 (7XX) XXX-XX-XX',
    total: 'Барлығы төлемге',
    prepaymentTitle: 'Kaspi Pay',
    prepaymentDesc: 'Әкімші Kaspi.kz қосымшаңызға кепілақыға шот жібереді',
    depositLabel: 'Кепілақы',
    samePhoneCheckbox: 'Шотты осы телефон нөміріне жіберу',
    changePhoneBtn: '+ Kaspi үшін басқа нөмір енгізу',
    returnMainPhoneBtn: 'Негізгі нөмірге қайтару',
    customKaspiLabel: 'Kaspi шот нөмірі',
    customKaspiPlaceholder: '+7 (7XX) XXX-XX-XX',
    selectRoomBtn: 'Таңдау',
    selectedRoomBtn: 'Таңдалды',
    cancelSelectionHint: 'бас тарту',
    selectedRoomBadge: 'Таңдалған зал',
    chooseRoomPrompt: 'Зал таңдалмады',
    nextToDate: 'Күн мен уақытты таңдау',
    next: 'Жалғастыру',
    submitBookingBtn: 'Брондауды жіберу',
    phoneAlert: 'Телефон нөмірін толық енгізіңіз (+7 7XX XXX-XX-XX)',
    kaspiPhoneAlert: 'Kaspi нөмірін толық енгізіңіз (+7 7XX XXX-XX-XX)',
    timeAlert: 'Келу уақытын таңдаңыз',
    loading: 'Деректер жүктелуде...',
    notFound: 'Монша кешені табылмады',
    msgHall: 'Зал / Кабина',
    none: 'Таңдалмаған',
    weekdayShort: 'жұмыс',
    weekendShort: 'дем',
    tariffLabel: 'Қолданылатын тариф:',
    tariffWeekend: 'Жұма – Жексенбі / Мерекелер',
    tariffWeekday: 'Жұмыс күндері'
  }
}

// Данные комплекса
const currentBanya = ref<any>(null)
const categoriesList = ref<any[]>([])
const roomsList = ref<any[]>([])
const banyaVideos = ref<any[]>([])
const banyaExtras = ref<any[]>([])

const activeCategory = ref<number | string>('all')
const selectedRoom = ref<any>(null)

// Наличие задатка
const hasDeposit = computed(() => Number(currentBanya.value?.depositAmount || 0) > 0)

// Календарь
const now = new Date()
const currentYear = now.getFullYear()
const currentMonth = now.getMonth()
const todayDate = now.getDate()

const monthOffset = ref(0)
const viewDate = computed(() => new Date(currentYear, currentMonth + monthOffset.value, 1))
const viewYear = computed(() => viewDate.value.getFullYear())
const viewMonth = computed(() => viewDate.value.getMonth())

const selectedDay = ref<number>(todayDate)
const bookingTime = ref<string>('')
const durationHours = ref<number>(2)
const isCustomDuration = ref(false)

// Гости
const guestsCount = ref<number>(4)
const isCustomGuests = ref(false)

// Контакты
const clientName = ref('')
const clientPhone = ref('')
const isKaspiSameAsPhone = ref(true)
const customKaspiPhone = ref('')

// Счетчик доп. товаров
const extrasQuantities = ref<Record<number, number>>({})

const getExtraQty = (id: number): number => extrasQuantities.value[id] || 0

const updateExtraQty = (id: number, delta: number) => {
  const current = extrasQuantities.value[id] || 0
  const next = Math.max(0, current + delta)
  if (next === 0) {
    delete extrasQuantities.value[id]
  } else {
    extrasQuantities.value[id] = next
  }
}

const toggleRoom = (room: any) => {
  if (selectedRoom.value?.id === room.id) {
    selectedRoom.value = null
  } else {
    selectedRoom.value = room
    if (durationHours.value < (room.minHours || 2)) {
      durationHours.value = room.minHours || 2
    }
  }
}

// Телефонная маска (+7 7XX XXX-XX-XX)
const formatKZPhone = (val: string): string => {
  if (!val) return ''
  let digits = val.replace(/\D/g, '')

  if (digits.startsWith('7') || digits.startsWith('8')) {
    digits = digits.slice(1)
  }
  digits = digits.slice(0, 10)

  let res = '+7'
  if (digits.length > 0) res += ' (' + digits.slice(0, 3)
  if (digits.length >= 3) res += ') ' + digits.slice(3, 6)
  if (digits.length >= 6) res += '-' + digits.slice(6, 8)
  if (digits.length >= 8) res += '-' + digits.slice(8, 10)
  return res
}

const handlePhoneInput = (e: Event) => {
  const input = e.target as HTMLInputElement
  clientPhone.value = formatKZPhone(input.value)
  input.value = clientPhone.value
}

const handleKaspiPhoneInput = (e: Event) => {
  const input = e.target as HTMLInputElement
  customKaspiPhone.value = formatKZPhone(input.value)
  input.value = customKaspiPhone.value
}

const targetKaspiPhone = computed(() => {
  if (!hasDeposit.value) return ''
  return isKaspiSameAsPhone.value ? clientPhone.value : customKaspiPhone.value
})

const isFormValidToSubmit = computed(() => {
  const isBasePhoneValid = clientPhone.value.length === 18
  if (!hasDeposit.value) return isBasePhoneValid
  if (isKaspiSameAsPhone.value) return isBasePhoneValid
  return isBasePhoneValid && customKaspiPhone.value.length === 18
})

const getMediaUrl = (mediaObj: any) => {
  if (!mediaObj) return ''
  const url = mediaObj.url || mediaObj.formats?.medium?.url || mediaObj.formats?.small?.url
  if (!url) return ''
  return url.startsWith('http') ? url : `${STRAPI_BASE_URL}${url}`
}

// Динамическое обновление favicon и Open Graph тегов
const updateMetaAndFavicon = (banya: any) => {
  if (!banya) return

  const name = banya.name_ru || 'Банный комплекс'
  const desc = banya.workingHours_ru 
    ? `Онлайн-бронирование. Режим работы: ${banya.workingHours_ru}` 
    : 'Онлайн-бронирование залов и кабинок'
  const logoUrl = getMediaUrl(banya.logo)

  document.title = name

  if (logoUrl) {
    let favicon = document.querySelector("link[rel*='icon']") as HTMLLinkElement
    if (!favicon) {
      favicon = document.createElement('link')
      favicon.rel = 'icon'
      document.head.appendChild(favicon)
    }
    favicon.type = 'image/png'
    favicon.href = logoUrl
  }

  const setMeta = (attr: string, key: string, content: string) => {
    let el = document.querySelector(`meta[${attr}='${key}']`)
    if (!el) {
      el = document.createElement('meta')
      el.setAttribute(attr, key)
      document.head.appendChild(el)
    }
    el.setAttribute('content', content)
  }

  setMeta('property', 'og:title', name)
  setMeta('property', 'og:description', desc)
  if (logoUrl) {
    setMeta('property', 'og:image', logoUrl)
    setMeta('name', 'twitter:image', logoUrl)
  }
  setMeta('name', 'twitter:title', name)
  setMeta('name', 'twitter:description', desc)
}

// Блокировка фонового скролла
const anyModalOpen = computed(() => isGalleryOpen.value || isVideoModalOpen.value || isSuccessModalOpen.value)

watch(anyModalOpen, (isOpen) => {
  if (typeof document !== 'undefined') {
    document.body.style.overflow = isOpen ? 'hidden' : ''
  }
})

const handleGlobalKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    if (isGalleryOpen.value) isGalleryOpen.value = false
    if (isVideoModalOpen.value) closeVideoModal()
    if (isSuccessModalOpen.value) {
      isSuccessModalOpen.value = false
      currentStep.value = 1
    }
  }
}

onMounted(async () => {
  window.addEventListener('keydown', handleGlobalKeyDown)

  const slug = (route.params.slug as string) || 'arasan'
  isLoading.value = true
  loadError.value = ''

  try {
    const query = new URLSearchParams({
      'filters[slug][$eq]': slug,
      'populate[logo]': 'true',
      'populate[categories]': 'true',
      'populate[rooms][populate][0]': 'image',
      'populate[rooms][populate][1]': 'images',
      'populate[rooms][populate][2]': 'category',
      'populate[videos][populate][0]': 'video',
      'populate[videos][populate][1]': 'preview',
      'populate[extras]': 'true'
    })

    const res = await fetch(`${STRAPI_BASE_URL}/api/banyas?${query.toString()}`)
    if (!res.ok) throw new Error(`HTTP: ${res.status}`)
    const json = await res.json()

    if (json.data && json.data.length > 0) {
      const item = json.data[0]
      currentBanya.value = item

      updateMetaAndFavicon(item)

      const rawCats = item.categories || []
      categoriesList.value = [...rawCats].sort((a: any, b: any) => (a.level || 0) - (b.level || 0))

      roomsList.value = item.rooms || []
      if (roomsList.value.length > 0) {
        selectedRoom.value = roomsList.value[0]
        durationHours.value = selectedRoom.value.minHours || 2
      }

      if (Array.isArray(item.videos) && item.videos.length > 0) {
        banyaVideos.value = item.videos.map((v: any) => ({
          id: v.id,
          title_ru: v.title_ru || '',
          title_kz: v.title_kz || v.title_ru || '',
          videoUrl: getMediaUrl(v.video)
        }))
      }

      if (Array.isArray(item.extras) && item.extras.length > 0) {
        banyaExtras.value = item.extras
      }
    } else {
      loadError.value = 'notFound'
    }
  } catch (err) {
    console.error('Ошибка загрузки данных Strapi:', err)
    loadError.value = 'serverError'
  } finally {
    isLoading.value = false
  }
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleGlobalKeyDown)
  if (typeof document !== 'undefined') {
    document.body.style.overflow = ''
  }
})

const getRoomPhotos = (room: any): string[] => {
  const photos: string[] = []
  if (room.image) photos.push(getMediaUrl(room.image))
  if (Array.isArray(room.images)) {
    room.images.forEach((img: any) => {
      const u = getMediaUrl(img)
      if (u && !photos.includes(u)) photos.push(u)
    })
  }
  return photos.length > 0 ? photos : ['https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80']
}

const openRoomGallery = (room: any, e: Event) => {
  e.stopPropagation()
  activeGalleryImages.value = getRoomPhotos(room)
  activeImageIndex.value = 0
  isGalleryOpen.value = true
}

const openVideoModal = (videoItem: any) => {
  activeVideo.value = videoItem
  isModalVideoMuted.value = true
  isVideoModalOpen.value = true
  setTimeout(() => {
    if (modalVideoRef.value) modalVideoRef.value.play().catch(() => {})
  }, 100)
}

const toggleModalMute = () => {
  isModalVideoMuted.value = !isModalVideoMuted.value
  if (modalVideoRef.value) modalVideoRef.value.muted = isModalVideoMuted.value
}

const closeVideoModal = () => {
  if (modalVideoRef.value) {
    modalVideoRef.value.pause()
    modalVideoRef.value.currentTime = 0
  }
  isVideoModalOpen.value = false
  activeVideo.value = null
}

const filteredRooms = computed(() => {
  if (activeCategory.value === 'all') return roomsList.value
  return roomsList.value.filter((r: any) => r.category?.id === activeCategory.value)
})

// Определение дня недели выбранной даты
const selectedDayOfWeek = computed(() => {
  return new Date(viewYear.value, viewMonth.value, selectedDay.value).getDay()
})

// Пятница (5), Суббота (6) и Воскресенье (0) относятся к тарифу выходных дней
const isWeekendDay = computed(() => {
  const day = selectedDayOfWeek.value
  return day === 5 || day === 6 || day === 0
})

// Активная часовая ставка с учетом будней и выходных
const activeHourlyRate = computed(() => {
  if (!selectedRoom.value) return 0
  const weekendPrice = Number(selectedRoom.value.pricePerHourWeekend || 0)
  if (isWeekendDay.value && weekendPrice > 0) {
    return weekendPrice
  }
  return Number(selectedRoom.value.pricePerHour || 0)
})

// Расписание рабочих часов
const workingTimeSlots = computed(() => {
  const startH = isWeekendDay.value 
    ? (currentBanya.value?.weekendStart ?? 12) 
    : (currentBanya.value?.weekdayStart ?? 10)

  const endH = isWeekendDay.value 
    ? (currentBanya.value?.weekendEnd ?? 0) 
    : (currentBanya.value?.weekdayEnd ?? 22)

  const slots: string[] = []
  const totalHours = endH <= startH ? (24 - startH + endH) : (endH - startH)

  for (let i = 0; i <= totalHours; i++) {
    const h = (startH + i) % 24
    slots.push(`${String(h).padStart(2, '0')}:00`)
  }

  return slots
})

const isSelectedDateToday = computed(() => {
  return viewYear.value === currentYear && viewMonth.value === currentMonth && selectedDay.value === todayDate
})

const availableTimeSlots = computed(() => {
  const allSlots = workingTimeSlots.value
  if (!isSelectedDateToday.value) return allSlots

  const curHour = now.getHours()
  return allSlots.filter(slot => {
    const slotH = parseInt(slot.split(':')[0], 10)
    const effSlotH = slotH < 6 ? slotH + 24 : slotH
    const effCurH = curHour < 6 ? curHour + 24 : curHour
    return effSlotH > effCurH
  })
})

watch(availableTimeSlots, (slots) => {
  if (slots.length > 0 && (!bookingTime.value || !slots.includes(bookingTime.value))) {
    bookingTime.value = slots[0]
  } else if (slots.length === 0) {
    bookingTime.value = ''
  }
}, { immediate: true })

const presetDurations = computed(() => {
  const min = selectedRoom.value?.minHours || 2
  return [min, min + 1, min + 2, min + 3]
})

// Расчет суммы аренды зала
const roomTotalPrice = computed(() => {
  return activeHourlyRate.value * durationHours.value
})

const extrasTotalPrice = computed(() => {
  return banyaExtras.value.reduce((sum, item) => {
    const qty = extrasQuantities.value[item.id] || 0
    return sum + (Number(item.price || 0) * qty)
  }, 0)
})

const totalPrice = computed(() => roomTotalPrice.value + extrasTotalPrice.value)

const selectedExtrasText = computed(() => {
  const items: string[] = []
  for (const extra of banyaExtras.value) {
    const qty = extrasQuantities.value[extra.id] || 0
    if (qty > 0) {
      const name = currentLang.value === 'kz' ? (extra.name_kz || extra.name_ru) : extra.name_ru
      const cost = Number(extra.price || 0) * qty
      items.push(`${name} × ${qty} шт (${cost.toLocaleString()} ₸)`)
    }
  }
  return items.length > 0 ? items.join(', ') : t[currentLang.value].none
})

const daysInMonth = computed(() => new Date(viewYear.value, viewMonth.value + 1, 0).getDate())
const firstDayOffset = computed(() => {
  const day = new Date(viewYear.value, viewMonth.value, 1).getDay()
  return day === 0 ? 6 : day - 1
})

const monthNames = {
  ru: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
  kz: ['Қаңтар', 'Ақпан', 'Наурыз', 'Сәуір', 'Мамыр', 'Маусым', 'Шілде', 'Тамыз', 'Қыркүйек', 'Қазан', 'Қараша', 'Желтоқсан']
}

const handleNextStep = () => {
  if (currentStep.value === 1) {
    if (!selectedRoom.value) return
    currentStep.value = 2
    window.scrollTo({ top: 0, behavior: 'smooth' })
    return
  }
  if (currentStep.value === 2) {
    if (!bookingTime.value) {
      alert(t[currentLang].timeAlert)
      return
    }
    currentStep.value = 3
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const submitBooking = async () => {
  if (isSubmitting.value) return

  if (!clientPhone.value || clientPhone.value.length < 18) {
    alert(t[currentLang].phoneAlert)
    return
  }

  if (hasDeposit.value && !isKaspiSameAsPhone.value && (!customKaspiPhone.value || customKaspiPhone.value.length < 18)) {
    alert(t[currentLang].kaspiPhoneAlert)
    return
  }

  isSubmitting.value = true

  const formattedDate = `${viewYear.value}-${String(viewMonth.value + 1).padStart(2, '0')}-${String(selectedDay.value).padStart(2, '0')}`
  const banyaRef = currentBanya.value?.documentId || currentBanya.value?.id
  const roomRef = selectedRoom.value?.documentId || selectedRoom.value?.id

  const payload: any = {
    clientName: clientName.value.trim() || 'Гость',
    clientPhone: clientPhone.value,
    bookingDate: formattedDate,
    bookingTime: bookingTime.value,
    durationHours: durationHours.value,
    guestsCount: guestsCount.value,
    totalPrice: totalPrice.value,
    bookingStatus: 'pending',
    extras: selectedExtrasText.value
  }

  if (hasDeposit.value && targetKaspiPhone.value) {
    payload.kaspiPhone = targetKaspiPhone.value
  }

  if (banyaRef) payload.banya = banyaRef
  if (roomRef) payload.room = roomRef

  try {
    const res = await fetch(`${STRAPI_BASE_URL}/api/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: payload })
    })

    if (!res.ok) {
      const errJson = await res.json().catch(() => null)
      throw new Error(errJson?.error?.message || `HTTP ${res.status}`)
    }

    isSuccessModalOpen.value = true
  } catch (e: any) {
    console.error('Ошибка записи брони:', e)
    alert(`Не удалось отправить бронь: ${e.message || 'Проверьте соединение с сервером'}`)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="w-full max-w-md mx-auto min-h-screen flex flex-col relative pb-36 bg-[#F9FAFB] text-neutral-900 font-sans antialiased">
    
    <!-- Индикатор загрузки -->
    <div v-if="isLoading" class="flex-1 flex items-center justify-center min-h-[70vh]">
      <div class="text-center space-y-3">
        <div class="w-8 h-8 border-[2.5px] border-neutral-900 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p class="text-xs text-neutral-400 font-medium tracking-tight">{{ t[currentLang].loading }}</p>
      </div>
    </div>

    <!-- Ошибка загрузки -->
    <div v-else-if="loadError" class="flex-1 flex items-center justify-center min-h-[70vh] p-6 text-center">
      <div class="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-xs space-y-3 w-full">
        <div class="w-10 h-10 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto text-neutral-400">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
        </div>
        <p class="text-sm font-bold text-neutral-800">{{ t[currentLang].notFound }}</p>
        <button 
          @click="window.location.reload()" 
          class="px-5 py-2.5 bg-neutral-900 text-white rounded-xl text-xs font-bold active:scale-95 transition-all"
        >
          Обновить страницу
        </button>
      </div>
    </div>

    <!-- Основной экран -->
    <template v-else>
      
      <!-- Верхняя панель -->
      <header class="p-4 pt-5 sticky top-0 bg-[#F9FAFB]/90 backdrop-blur-xl z-30 space-y-3 border-b border-neutral-200/50">
        <div class="flex items-center justify-between">
          <button 
            v-if="currentStep > 1" 
            @click="currentStep--" 
            class="w-10 h-10 rounded-2xl bg-white border border-neutral-200/70 flex items-center justify-center text-neutral-700 shadow-xs active:scale-95 transition-all"
            aria-label="Назад"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <div v-else class="w-10 h-10"></div>

          <!-- Язык -->
          <div class="bg-neutral-200/60 p-0.5 rounded-full flex items-center border border-neutral-200/50">
            <button 
              @click="currentLang = 'ru'"
              :class="[
                'px-3.5 py-1 text-[11px] font-bold rounded-full transition-all duration-200',
                currentLang === 'ru' ? 'bg-neutral-900 text-white shadow-xs' : 'text-neutral-500 hover:text-neutral-900'
              ]"
            >
              РУС
            </button>
            <button 
              @click="currentLang = 'kz'"
              :class="[
                'px-3.5 py-1 text-[11px] font-bold rounded-full transition-all duration-200',
                currentLang === 'kz' ? 'bg-neutral-900 text-white shadow-xs' : 'text-neutral-500 hover:text-neutral-900'
              ]"
            >
              ҚАЗ
            </button>
          </div>

          <!-- Индикатор шага -->
          <div class="text-[11px] font-bold text-neutral-600 bg-white border border-neutral-200/70 px-3 py-1.5 rounded-full shadow-xs font-mono">
            {{ currentStep }} <span class="text-neutral-300 font-normal">/</span> 3
          </div>
        </div>

        <div class="w-full bg-neutral-200/60 h-1 rounded-full overflow-hidden">
          <div 
            class="bg-neutral-900 h-full transition-all duration-300 rounded-full"
            :style="{ width: `${(currentStep / 3) * 100}%` }"
          ></div>
        </div>
      </header>

      <main class="flex-1 px-4 pt-3 space-y-4">
        
        <!-- ШАГ 1: КАРТОЧКА БАНИ, ВИДЕО И ЗАЛЫ -->
        <section v-if="currentStep === 1" class="space-y-4">
          
          <div class="bg-white p-4.5 rounded-[28px] border border-neutral-200/70 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-3.5">
            <div class="flex items-center gap-3.5">
              <div class="w-13 h-13 rounded-2xl bg-neutral-900 text-white flex items-center justify-center font-bold text-lg shrink-0 overflow-hidden shadow-inner ring-1 ring-black/5">
                <img 
                  v-if="currentBanya?.logo" 
                  :src="getMediaUrl(currentBanya.logo)" 
                  loading="lazy"
                  decoding="async"
                  class="w-full h-full object-cover" 
                  alt="Логотип"
                >
                <span v-else>{{ (currentBanya?.name_ru || 'Б')[0] }}</span>
              </div>
              
              <div class="flex-1 min-w-0">
                <h1 class="font-extrabold text-neutral-900 text-base tracking-tight truncate">
                  {{ currentLang === 'kz' ? (currentBanya?.name_kz || currentBanya?.name_ru) : currentBanya?.name_ru }}
                </h1>

                <div class="flex items-center gap-2 mt-0.5 flex-wrap">
                  <span class="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    {{ t[currentLang].bookingBadge }}
                  </span>

                  <span class="text-xs text-neutral-400 font-medium truncate">
                    {{ currentLang === 'kz' 
                        ? (currentBanya?.workingHours_kz || currentBanya?.workingHours_ru || '10:00 - 02:00') 
                        : (currentBanya?.workingHours_ru || '10:00 - 02:00') 
                    }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Быстрые действия -->
            <div class="grid grid-cols-4 gap-2 pt-2 border-t border-neutral-100">
              <a 
                v-if="currentBanya?.whatsapp" 
                :href="'https://wa.me/' + currentBanya.whatsapp" 
                target="_blank"
                class="py-2.5 px-1 rounded-2xl bg-neutral-50 hover:bg-neutral-100/80 border border-neutral-200/60 flex flex-col items-center justify-center gap-1 text-[11px] font-bold text-neutral-700 active:scale-95 transition-all truncate"
              >
                <svg class="w-4 h-4 text-neutral-600 shrink-0 fill-current" viewBox="0 0 24 24">
                  <path d="M19.05 4.91A9.816 9.816 0 0 0 12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01zm-7.01 15.24c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.204 8.204 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c.02 4.54-3.68 8.23-8.23 8.23zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.15.17-.25.25-.42.08-.17.04-.31-.02-.43s-.56-1.34-.76-1.84c-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.84-.86 2.06 0 1.21.89 2.39 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.53.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.07-.12-.23-.19-.48-.31z"/>
                </svg>
                <span>{{ t[currentLang].whatsapp }}</span>
              </a>

              <a 
                v-if="currentBanya?.phone" 
                :href="'tel:+' + currentBanya.phone" 
                class="py-2.5 px-1 rounded-2xl bg-neutral-50 hover:bg-neutral-100/80 border border-neutral-200/60 flex flex-col items-center justify-center gap-1 text-[11px] font-bold text-neutral-700 active:scale-95 transition-all"
              >
                <svg class="w-4 h-4 text-neutral-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                <span>{{ t[currentLang].call }}</span>
              </a>

              <a 
                v-if="currentBanya?.gisUrl" 
                :href="currentBanya.gisUrl" 
                target="_blank" 
                class="py-2.5 px-1 rounded-2xl bg-neutral-50 hover:bg-neutral-100/80 border border-neutral-200/60 flex flex-col items-center justify-center gap-1 text-[11px] font-bold text-neutral-700 active:scale-95 transition-all"
              >
                <svg class="w-4 h-4 text-neutral-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                <span>{{ t[currentLang].map }}</span>
              </a>

              <a 
                v-if="currentBanya?.instagram" 
                :href="currentBanya.instagram.startsWith('http') ? currentBanya.instagram : 'https://instagram.com/' + currentBanya.instagram" 
                target="_blank" 
                class="py-2.5 px-1 rounded-2xl bg-neutral-50 hover:bg-neutral-100/80 border border-neutral-200/60 flex flex-col items-center justify-center gap-1 text-[11px] font-bold text-neutral-700 active:scale-95 transition-all"
              >
                <svg class="w-4 h-4 text-neutral-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" stroke-width="2"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" stroke-width="2"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" stroke-width="2.5" stroke-linecap="round"/></svg>
                <span>{{ t[currentLang].insta }}</span>
              </a>
            </div>
          </div>

          <!-- Видеобаннеры без превью-картинок -->
          <div v-if="banyaVideos.length > 0" class="space-y-2.5">
            <div class="flex items-center justify-between px-1">
              <div>
                <h2 class="text-xs font-bold text-neutral-900 tracking-tight">{{ t[currentLang].videoSectionTitle }}</h2>
                <p class="text-[10px] text-neutral-400 font-medium">{{ t[currentLang].videoSectionSubtitle }}</p>
              </div>
            </div>

            <div class="flex gap-3 overflow-x-auto py-1 px-1 no-scrollbar snap-x">
              <div 
                v-for="item in banyaVideos" 
                :key="item.id"
                @click="openVideoModal(item)"
                class="relative w-36 h-52 rounded-[26px] overflow-hidden bg-neutral-950 shrink-0 shadow-sm cursor-pointer group snap-start border border-neutral-200/60 active:scale-[0.98] transition-all"
              >
                <video 
                  :src="item.videoUrl" 
                  autoplay 
                  loop 
                  muted 
                  playsinline 
                  webkit-playsinline
                  preload="auto"
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out pointer-events-none"
                ></video>

                <div class="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/85 pointer-events-none"></div>

                <div class="absolute top-3 left-3 w-7 h-7 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center">
                  <svg class="w-3 h-3 text-white fill-white ml-0.5" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                </div>

                <div class="absolute bottom-3 left-3 right-3 text-white pointer-events-none">
                  <p class="text-[11px] font-bold leading-tight drop-shadow-md line-clamp-2">
                    {{ (currentLang === 'kz' ? item.title_kz : item.title_ru) || t[currentLang].videoDefaultBadge }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Заголовок выбора -->
          <div class="pt-1 px-0.5">
            <h2 class="text-lg font-extrabold tracking-tight text-neutral-900">{{ t[currentLang].step1Title }}</h2>
            <p class="text-xs text-neutral-500 mt-0.5">{{ t[currentLang].step1Subtitle }}</p>
          </div>

          <!-- Категории -->
          <div v-if="categoriesList.length > 0" class="flex gap-2 overflow-x-auto py-0.5 no-scrollbar">
            <button 
              @click="activeCategory = 'all'"
              :class="[
                'px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border',
                activeCategory === 'all' 
                  ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs' 
                  : 'bg-white text-neutral-600 border-neutral-200/70 hover:bg-neutral-50'
              ]"
            >
              {{ t[currentLang].all }}
            </button>
            <button 
              v-for="cat in categoriesList" 
              :key="cat.id"
              @click="activeCategory = cat.id"
              :class="[
                'px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border',
                activeCategory === cat.id 
                  ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs' 
                  : 'bg-white text-neutral-600 border-neutral-200/70 hover:bg-neutral-50'
              ]"
            >
              {{ currentLang === 'kz' ? (cat.name_kz || cat.name_ru) : cat.name_ru }}
            </button>
          </div>

          <!-- Карточки залов (с дифференцированной ценой будни/выходные) -->
          <div class="space-y-4">
            <div 
              v-for="room in filteredRooms" 
              :key="room.id"
              @click="toggleRoom(room)"
              :class="[
                'p-4 rounded-[30px] bg-white border transition-all duration-200 cursor-pointer shadow-[0_1px_3px_rgba(0,0,0,0.03)] relative overflow-hidden',
                selectedRoom?.id === room.id 
                  ? 'border-neutral-900 ring-2 ring-neutral-900 shadow-md' 
                  : 'border-neutral-200/70 hover:border-neutral-300'
              ]"
            >
              <div class="relative h-56 w-full rounded-2xl overflow-hidden bg-neutral-100">
                <img 
                  :src="getRoomPhotos(room)[0]" 
                  :alt="room.name_ru" 
                  loading="lazy"
                  decoding="async"
                  class="w-full h-full object-cover transition-transform duration-500"
                >

                <div 
                  v-if="room.badge_ru || room.badge_kz" 
                  class="absolute top-3 left-3 bg-neutral-900/85 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border border-white/20 shadow-xs flex items-center gap-1.5"
                >
                  <span class="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                  <span>{{ currentLang === 'kz' ? (room.badge_kz || room.badge_ru) : (room.badge_ru || room.badge_kz) }}</span>
                </div>

                <button 
                  @click="openRoomGallery(room, $event)"
                  class="absolute top-3 right-3 w-10 h-10 rounded-2xl bg-white/95 hover:bg-white backdrop-blur-md text-neutral-900 flex items-center justify-center shadow-md active:scale-90 transition-all border border-neutral-200/80"
                  aria-label="Смотреть фотографии"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/>
                  </svg>
                </button>

                <div class="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 pointer-events-none">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                  <span>{{ getRoomPhotos(room).length }} фото</span>
                </div>
              </div>

              <div class="pt-4 px-1">
                <div class="flex justify-between items-baseline">
                  <h3 class="font-extrabold text-neutral-900 text-base tracking-tight">
                    {{ currentLang === 'kz' ? (room.name_kz || room.name_ru) : room.name_ru }}
                  </h3>

                  <!-- Блок цен: будни / выходные -->
                  <div class="text-right">
                    <template v-if="room.pricePerHourWeekend && Number(room.pricePerHourWeekend) !== Number(room.pricePerHour)">
                      <div class="flex flex-col items-end">
                        <span class="text-neutral-900 font-black text-sm font-mono leading-none">
                          {{ Number(room.pricePerHour).toLocaleString() }} ₸
                          <span class="text-[10px] font-bold text-neutral-400 font-sans">/ {{ t[currentLang].weekdayShort }}</span>
                        </span>
                        <span class="text-neutral-600 font-black text-xs font-mono mt-1 leading-none">
                          {{ Number(room.pricePerHourWeekend).toLocaleString() }} ₸
                          <span class="text-[10px] font-bold text-neutral-400 font-sans">/ {{ t[currentLang].weekendShort }}</span>
                        </span>
                      </div>
                    </template>
                    <template v-else>
                      <span class="text-neutral-900 font-black text-lg font-mono">
                        {{ Number(room.pricePerHour || 0).toLocaleString() }} ₸
                      </span>
                      <span class="text-neutral-400 font-medium text-xs">{{ t[currentLang].perHour }}</span>
                    </template>
                  </div>
                </div>

                <div class="flex items-center gap-2.5 text-xs text-neutral-500 mt-2 font-medium">
                  <span class="flex items-center gap-1">
                    <svg class="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"/></svg>
                    {{ currentLang === 'kz' ? `${room.capacity} қонаққа дейін` : `до ${room.capacity} гостей` }}
                  </span>
                  <span class="text-neutral-300">•</span>
                  <span>{{ t[currentLang].minOrder }}: {{ room.minHours || 2 }} {{ t[currentLang].hours }}</span>
                </div>

                <button 
                  type="button"
                  @click.stop="toggleRoom(room)"
                  class="w-full mt-4 py-3.5 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 select-none"
                  :class="selectedRoom?.id === room.id 
                    ? 'bg-neutral-900 text-white shadow-xs active:bg-neutral-800' 
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200/80 active:scale-[0.99]'"
                >
                  <template v-if="selectedRoom?.id === room.id">
                    <svg class="w-4 h-4 text-emerald-400 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
                    </svg>
                    <span>{{ t[currentLang].selectedRoomBtn }}</span>
                    <span class="text-neutral-400 font-normal text-[11px] ml-1">({{ t[currentLang].cancelSelectionHint }})</span>
                  </template>
                  <template v-else>
                    <span>{{ t[currentLang].selectRoomBtn }}</span>
                  </template>
                </button>
              </div>
            </div>
          </div>
        </section>

        <!-- ШАГ 2: ДАТА И ВРЕМЯ (С ПЕРЕКЛЮЧЕНИЕМ МЕСЯЦЕВ И ИНДИКАТОРОМ ТАРИФА) -->
        <section v-if="currentStep === 2" class="space-y-4">
          <div class="px-0.5">
            <h2 class="text-lg font-extrabold tracking-tight text-neutral-900">{{ t[currentLang].step2Title }}</h2>
            <p class="text-xs text-neutral-500 mt-0.5">
              {{ currentLang === 'kz' ? (selectedRoom?.name_kz || selectedRoom?.name_ru) : selectedRoom?.name_ru }}
            </p>
          </div>

          <!-- Календарь -->
          <div class="bg-white p-4.5 rounded-[28px] border border-neutral-200/70 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-3">
            <div class="flex items-center justify-between pb-1">
              <div class="flex items-center gap-2">
                <span class="font-extrabold text-neutral-900 text-sm">
                  {{ monthNames[currentLang][viewMonth] }} {{ viewYear }}
                </span>
                <span v-if="monthOffset === 0" class="text-[11px] font-bold text-neutral-700 bg-neutral-100 px-2.5 py-0.5 rounded-full">
                  {{ t[currentLang].today }}: {{ todayDate }}
                </span>
              </div>

              <div class="flex items-center gap-1">
                <button 
                  @click="monthOffset > 0 ? monthOffset-- : null"
                  :disabled="monthOffset === 0"
                  class="w-8 h-8 rounded-xl flex items-center justify-center border border-neutral-200 text-neutral-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-neutral-50 active:scale-95"
                  aria-label="Предыдущий месяц"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.75 19.5L8.25 12l7.5-7.5"/></svg>
                </button>
                <button 
                  @click="monthOffset < 3 ? monthOffset++ : null"
                  :disabled="monthOffset >= 3"
                  class="w-8 h-8 rounded-xl flex items-center justify-center border border-neutral-200 text-neutral-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-neutral-50 active:scale-95"
                  aria-label="Следующий месяц"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.25 4.5l7.5 7.5-7.5 7.5"/></svg>
                </button>
              </div>
            </div>

            <div class="grid grid-cols-7 text-center text-[11px] font-bold text-neutral-400 py-1">
              <span>Пн</span><span>Вт</span><span>Ср</span><span>Чт</span><span>Пт</span><span class="text-rose-500">Сб</span><span class="text-rose-500">Вс</span>
            </div>

            <div class="grid grid-cols-7 gap-1.5 text-center text-xs font-semibold">
              <span v-for="empty in firstDayOffset" :key="'e-' + empty" class="text-transparent select-none">•</span>
              <button 
                v-for="d in daysInMonth" 
                :key="d"
                :disabled="monthOffset === 0 && d < todayDate"
                @click="selectedDay = d"
                :class="[
                  'h-10 w-full rounded-2xl flex items-center justify-center transition-all font-bold text-xs',
                  monthOffset === 0 && d < todayDate ? 'text-neutral-300 cursor-not-allowed' : 'hover:bg-neutral-100',
                  selectedDay === d ? 'bg-neutral-900 text-white shadow-xs' : (monthOffset > 0 || d >= todayDate) ? 'text-neutral-800' : ''
                ]"
              >
                {{ d }}
              </button>
            </div>
          </div>

          <!-- Время заезда -->
          <div class="bg-white p-4.5 rounded-[28px] border border-neutral-200/70 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-3">
            <div class="flex justify-between items-baseline">
              <label class="font-extrabold text-neutral-900 text-sm block">{{ t[currentLang].entryTime }}</label>
              <span class="text-[11px] text-neutral-400 font-medium">
                {{ isWeekendDay 
                    ? (currentBanya?.workingHours_kz || '12:00 - 00:00') 
                    : (currentBanya?.workingHours_ru || '10:00 - 22:00') 
                }}
              </span>
            </div>
            
            <div v-if="availableTimeSlots.length > 0" class="grid grid-cols-4 gap-2">
              <button 
                v-for="slot in availableTimeSlots" 
                :key="slot"
                @click="bookingTime = slot"
                :class="[
                  'py-3 rounded-2xl text-xs font-extrabold transition-all border text-center font-mono',
                  bookingTime === slot ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs' : 'bg-neutral-50 text-neutral-800 border-neutral-200/70 hover:bg-neutral-100'
                ]"
              >
                {{ slot }}
              </button>
            </div>
            <p v-else class="text-xs text-amber-800 bg-amber-50 p-3 rounded-2xl border border-amber-200/70 text-center font-medium">
              {{ t[currentLang].noSlotsToday }}
            </p>
          </div>

          <!-- Длительность и индикатор тарифа -->
          <div class="bg-white p-4.5 rounded-[28px] border border-neutral-200/70 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-3">
            <div class="flex justify-between items-baseline">
              <label class="font-extrabold text-neutral-900 text-sm block">{{ t[currentLang].duration }}</label>
              <button 
                @click="isCustomDuration = !isCustomDuration" 
                class="text-xs font-bold text-neutral-900 underline underline-offset-4 decoration-neutral-300 hover:decoration-neutral-900 transition-colors"
              >
                {{ isCustomDuration ? t[currentLang].chooseFromList : t[currentLang].customDuration }}
              </button>
            </div>

            <div v-if="!isCustomDuration" class="grid grid-cols-4 gap-2">
              <button 
                v-for="h in presetDurations" 
                :key="h"
                @click="durationHours = h"
                :class="[
                  'py-3.5 rounded-2xl text-xs font-extrabold transition-all border font-mono',
                  durationHours === h ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs' : 'bg-neutral-50 text-neutral-700 border-neutral-200/60 hover:bg-neutral-100'
                ]"
              >
                {{ h }} {{ t[currentLang].hours }}
              </button>
            </div>

            <div v-else class="flex items-center justify-between p-3.5 bg-neutral-50 rounded-2xl border border-neutral-200/60">
              <span class="text-xs font-semibold text-neutral-600">Количество часов:</span>
              <div class="flex items-center gap-3">
                <button 
                  @click="durationHours > (selectedRoom?.minHours || 1) ? durationHours-- : null"
                  class="w-9 h-9 rounded-2xl bg-white border border-neutral-300 font-bold flex items-center justify-center active:scale-95 shadow-2xs text-neutral-700"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19.5 12h-15"/></svg>
                </button>
                <span class="text-base font-black text-neutral-900 w-10 text-center font-mono">{{ durationHours }} {{ t[currentLang].hours }}</span>
                <button 
                  @click="durationHours < 24 ? durationHours++ : null"
                  class="w-9 h-9 rounded-2xl bg-white border border-neutral-300 font-bold flex items-center justify-center active:scale-95 shadow-2xs text-neutral-700"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4.5v15m7.5-7.5h-15"/></svg>
                </button>
              </div>
            </div>

            <!-- Информационный бейдж текущего тарифа дня -->
            <div class="pt-2 border-t border-neutral-100 flex items-center justify-between text-xs">
              <span class="text-neutral-500 font-medium">{{ t[currentLang].tariffLabel }}</span>
              <span 
                :class="isWeekendDay ? 'bg-amber-50 text-amber-700 border-amber-200/60' : 'bg-neutral-100 text-neutral-700 border-neutral-200/60'"
                class="font-bold px-2.5 py-1 rounded-xl border text-[11px]"
              >
                {{ isWeekendDay ? t[currentLang].tariffWeekend : t[currentLang].tariffWeekday }} ({{ activeHourlyRate.toLocaleString() }} ₸/{{ t[currentLang].hours }})
              </span>
            </div>
          </div>
        </section>

        <!-- ШАГ 3: ГОСТИ, ДОПЫ (СКРЫТЫ ЕСЛИ НЕТ), КОНТАКТЫ, KASPI PAY -->
        <section v-if="currentStep === 3" class="space-y-4">
          <div class="px-0.5">
            <h2 class="text-lg font-extrabold tracking-tight text-neutral-900">{{ t[currentLang].step3Title }}</h2>
            <p class="text-xs text-neutral-500 mt-0.5">{{ t[currentLang].step3Subtitle }}</p>
          </div>

          <!-- Гости -->
          <div class="bg-white p-4.5 rounded-[28px] border border-neutral-200/70 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-3">
            <div class="flex justify-between items-baseline">
              <span class="font-extrabold text-neutral-900 text-sm">{{ t[currentLang].guests }}</span>
              <button 
                @click="isCustomGuests = !isCustomGuests" 
                class="text-xs font-bold text-neutral-900 underline underline-offset-4 decoration-neutral-300 hover:decoration-neutral-900 transition-colors"
              >
                {{ isCustomGuests ? t[currentLang].chooseFromList : t[currentLang].customGuests }}
              </button>
            </div>

            <div v-if="!isCustomGuests" class="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              <button 
                v-for="num in [1, 2, 4, 6, 8, 10, 12]" 
                :key="num"
                @click="guestsCount = num"
                :class="[
                  'w-11 h-11 rounded-2xl flex items-center justify-center text-xs font-extrabold border shrink-0 transition-all font-mono',
                  guestsCount === num ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs' : 'bg-neutral-50 text-neutral-700 border-neutral-200/70 hover:bg-neutral-100'
                ]"
              >
                {{ num }}
              </button>
            </div>

            <div v-else class="flex items-center justify-between p-3.5 bg-neutral-50 rounded-2xl border border-neutral-200/60">
              <span class="text-xs font-semibold text-neutral-600">Количество гостей:</span>
              <div class="flex items-center gap-3">
                <button 
                  @click="guestsCount > 1 ? guestsCount-- : null"
                  class="w-9 h-9 rounded-2xl bg-white border border-neutral-300 font-bold flex items-center justify-center active:scale-95 shadow-2xs text-neutral-700"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19.5 12h-15"/></svg>
                </button>
                <input 
                  type="number" 
                  v-model.number="guestsCount" 
                  min="1" 
                  max="100" 
                  class="w-12 text-center bg-transparent font-black text-base text-neutral-900 outline-none font-mono"
                >
                <button 
                  @click="guestsCount < 100 ? guestsCount++ : null"
                  class="w-9 h-9 rounded-2xl bg-white border border-neutral-300 font-bold flex items-center justify-center active:scale-95 shadow-2xs text-neutral-700"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4.5v15m7.5-7.5h-15"/></svg>
                </button>
              </div>
            </div>
          </div>

          <!-- Банные принадлежности (ПОЛНОСТЬЮ СКРЫВАЮТСЯ, ЕСЛИ ТОВАРОВ НЕТ) -->
          <div 
            v-if="banyaExtras.length > 0" 
            class="bg-white p-4.5 rounded-[28px] border border-neutral-200/70 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-3"
          >
            <div>
              <span class="font-extrabold text-neutral-900 text-sm block">{{ t[currentLang].extras }}</span>
              <p class="text-[10px] text-neutral-400 font-medium">{{ t[currentLang].extrasNote }}</p>
            </div>

            <div class="space-y-2 pt-1">
              <div 
                v-for="item in banyaExtras" 
                :key="item.id"
                class="flex items-center justify-between p-3.5 rounded-2xl bg-neutral-50/90 border border-neutral-200/60 transition-all"
                :class="getExtraQty(item.id) > 0 ? 'bg-neutral-100/70 border-neutral-300 shadow-2xs' : ''"
              >
                <div class="min-w-0 flex-1 pr-3">
                  <span class="text-xs font-bold text-neutral-800 block truncate">
                    {{ currentLang === 'kz' ? (item.name_kz || item.name_ru) : item.name_ru }}
                  </span>
                  <span class="text-[11px] font-semibold text-neutral-500 font-mono">
                    {{ Number(item.price || 0).toLocaleString() }} ₸ <span class="font-sans text-[10px] font-normal text-neutral-400">/ шт</span>
                  </span>
                </div>

                <div class="shrink-0">
                  <div v-if="getExtraQty(item.id) > 0" class="flex items-center gap-2 bg-white px-2 py-1 rounded-xl border border-neutral-200 shadow-2xs">
                    <button 
                      @click="updateExtraQty(item.id, -1)"
                      class="w-7 h-7 rounded-lg bg-neutral-100 hover:bg-neutral-200 active:scale-90 flex items-center justify-center text-neutral-800 transition-all"
                      aria-label="Уменьшить"
                    >
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19.5 12h-15"/></svg>
                    </button>
                    
                    <span class="w-6 text-center font-extrabold text-xs text-neutral-900 font-mono">
                      {{ getExtraQty(item.id) }}
                    </span>

                    <button 
                      @click="updateExtraQty(item.id, 1)"
                      class="w-7 h-7 rounded-lg bg-neutral-900 hover:bg-black active:scale-90 flex items-center justify-center text-white transition-all"
                      aria-label="Увеличить"
                    >
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4.5v15m7.5-7.5h-15"/></svg>
                    </button>
                  </div>

                  <button 
                    v-else 
                    @click="updateExtraQty(item.id, 1)"
                    class="py-1.5 px-3.5 rounded-xl text-[11px] font-extrabold bg-white hover:bg-neutral-100 active:scale-95 border border-neutral-300/80 text-neutral-800 transition-all shadow-2xs"
                  >
                    + Добавить
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Контакты -->
          <div class="bg-white p-4.5 rounded-[28px] border border-neutral-200/70 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-3">
            <span class="font-extrabold text-neutral-900 text-sm block">{{ t[currentLang].contacts }}</span>
            <input 
              type="text" 
              v-model="clientName" 
              :placeholder="t[currentLang].namePlaceholder" 
              class="w-full p-4 bg-neutral-50 border border-neutral-200/80 rounded-2xl text-base sm:text-xs font-semibold outline-none focus:border-neutral-900 focus:bg-white transition-all placeholder:text-neutral-400"
            >
            <input 
              type="tel" 
              :value="clientPhone" 
              @input="handlePhoneInput"
              maxlength="18"
              :placeholder="t[currentLang].phonePlaceholder" 
              class="w-full p-4 bg-neutral-50 border border-neutral-200/80 rounded-2xl text-base sm:text-xs font-semibold outline-none focus:border-neutral-900 focus:bg-white transition-all font-mono placeholder:text-neutral-400"
            >
          </div>

          <!-- Kaspi Pay -->
          <div 
            v-if="hasDeposit" 
            class="bg-white p-5 rounded-[28px] border border-neutral-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.02)] space-y-4"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2.5">
                <span class="px-3.5 py-1 rounded-full border-[1.5px] border-[#E83D31] text-[#E83D31] font-black text-xs tracking-tight bg-rose-50/20">
                  Kaspi
                </span>
                <span class="text-xs font-extrabold text-neutral-900 tracking-tight">{{ t[currentLang].prepaymentTitle }}</span>
              </div>

              <div class="text-right">
                <span class="text-[10px] uppercase font-bold text-neutral-400 block tracking-wider leading-none mb-1">
                  {{ t[currentLang].depositLabel }}
                </span>
                <span class="text-base font-black text-neutral-900 font-mono leading-none tracking-tight">
                  {{ Number(currentBanya?.depositAmount).toLocaleString() }} ₸
                </span>
              </div>
            </div>

            <p class="text-xs text-neutral-400 font-medium leading-relaxed">
              {{ t[currentLang].prepaymentDesc }}
            </p>

            <div class="space-y-2.5 pt-1 border-t border-neutral-100">
              <div 
                @click="isKaspiSameAsPhone = true"
                :class="[
                  'p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between select-none',
                  isKaspiSameAsPhone 
                    ? 'bg-neutral-50/90 border-neutral-300 shadow-2xs' 
                    : 'bg-white border-neutral-200/70 hover:bg-neutral-50'
                ]"
              >
                <div class="space-y-0.5">
                  <span class="text-xs font-bold text-neutral-800 block">
                    {{ t[currentLang].samePhoneCheckbox }}
                  </span>
                  <span class="text-xs font-semibold text-neutral-500 font-mono">
                    {{ clientPhone || '+7 (___) ___-__-__' }}
                  </span>
                </div>

                <div class="shrink-0 pl-3">
                  <svg v-if="isKaspiSameAsPhone" class="w-6 h-6 text-[#16A34A]" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="9.5" stroke="currentColor" stroke-width="2.2" class="fill-white" />
                    <path d="M7.8 12.2l2.8 2.8 5.6-5.8" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <div v-else class="w-6 h-6 rounded-full border-2 border-neutral-300 bg-white transition-all"></div>
                </div>
              </div>

              <div class="pt-0.5">
                <button 
                  v-if="isKaspiSameAsPhone" 
                  type="button"
                  @click="isKaspiSameAsPhone = false" 
                  class="text-xs font-semibold text-neutral-500 hover:text-neutral-900 underline underline-offset-4 decoration-neutral-300 transition-colors px-1"
                >
                  {{ t[currentLang].changePhoneBtn }}
                </button>

                <div v-else class="space-y-2 p-3.5 bg-neutral-50 rounded-2xl border border-neutral-200">
                  <div class="flex items-center justify-between">
                    <label class="text-xs font-bold text-neutral-700">{{ t[currentLang].customKaspiLabel }}</label>
                    <button 
                      type="button" 
                      @click="isKaspiSameAsPhone = true" 
                      class="text-[11px] font-semibold text-neutral-400 hover:text-neutral-700"
                    >
                      {{ t[currentLang].returnMainPhoneBtn }}
                    </button>
                  </div>
                  <input 
                    type="tel" 
                    :value="customKaspiPhone" 
                    @input="handleKaspiPhoneInput"
                    maxlength="18"
                    :placeholder="t[currentLang].customKaspiPlaceholder" 
                    class="w-full p-4 bg-white border border-neutral-300 rounded-xl text-base sm:text-xs font-bold outline-none focus:border-neutral-900 transition-all font-mono"
                  >
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>

      <!-- Нижний бар фиксации с итоговой стоимостью -->
      <footer class="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/95 backdrop-blur-xl border-t border-neutral-200/70 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
        <div v-if="currentStep === 1" class="flex items-center gap-3">
          <div class="flex-1 min-w-0">
            <span class="text-[9px] uppercase font-extrabold text-neutral-400 block tracking-widest">{{ t[currentLang].selectedRoomBadge }}</span>
            <span class="text-sm font-extrabold text-neutral-900 truncate block">
              {{ selectedRoom ? (currentLang === 'kz' ? (selectedRoom?.name_kz || selectedRoom?.name_ru) : selectedRoom?.name_ru) : t[currentLang].chooseRoomPrompt }}
            </span>
          </div>

          <button 
            @click="handleNextStep"
            :disabled="!selectedRoom"
            class="py-3.5 px-6 bg-neutral-900 hover:bg-black disabled:bg-neutral-200 disabled:text-neutral-400 disabled:cursor-not-allowed active:scale-[0.98] text-white font-bold text-xs rounded-2xl shadow-xs transition-all flex items-center gap-2 shrink-0"
          >
            <span>{{ t[currentLang].nextToDate }}</span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/></svg>
          </button>
        </div>

        <div v-else class="flex items-center justify-between gap-4">
          <div>
            <span class="text-[9px] uppercase font-extrabold text-neutral-400 block tracking-widest">{{ t[currentLang].total }}</span>
            <span class="text-xl font-black text-neutral-900 tracking-tight font-mono">
              {{ totalPrice.toLocaleString() }} ₸
            </span>
          </div>

          <button 
            v-if="currentStep === 2"
            @click="handleNextStep"
            class="flex-1 py-3.5 px-6 bg-neutral-900 hover:bg-black active:scale-[0.98] text-white font-bold text-xs rounded-2xl shadow-xs transition-all flex items-center justify-center gap-2"
          >
            <span>{{ t[currentLang].next }}</span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/></svg>
          </button>

          <!-- Кнопка отправки заявки -->
          <button 
            v-else
            @click="submitBooking"
            :disabled="isSubmitting || !isFormValidToSubmit"
            class="flex-1 py-3.5 px-6 bg-neutral-900 hover:bg-black disabled:bg-neutral-200 disabled:text-neutral-400 disabled:cursor-not-allowed disabled:shadow-none active:scale-[0.98] text-white font-extrabold text-xs tracking-tight rounded-2xl shadow-[0_6px_20px_-4px_rgba(0,0,0,0.3)] ring-1 ring-white/10 transition-all flex items-center justify-center gap-2"
          >
            <span v-if="isSubmitting" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>

            <template v-else>
              <span class="relative flex h-2 w-2">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>{{ t[currentLang].submitBookingBtn }}</span>
              <svg class="w-4 h-4 text-neutral-400 group-hover:text-white transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/></svg>
            </template>
          </button>
        </div>
      </footer>

      <!-- МОДАЛЬНОЕ ОКНО: ЗАКАЗ ПРИНЯТ -->
      <div 
        v-if="isSuccessModalOpen" 
        class="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
      >
        <div class="bg-white w-full max-w-sm rounded-[32px] p-6 text-center space-y-4 shadow-2xl border border-neutral-100">
          
          <div class="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-50/50">
            <svg class="w-8 h-8 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>

          <div class="space-y-1.5">
            <h3 class="text-xl font-black text-neutral-900 tracking-tight">
              {{ currentLang === 'kz' ? 'Тапсырыс қабылданды!' : 'Заявка принята!' }}
            </h3>
            <p class="text-xs text-neutral-500 leading-relaxed px-2 font-medium">
              <template v-if="hasDeposit">
                {{ currentLang === 'kz' 
                    ? 'Әкімшіге хабарлама жіберілді. Жақын арада Kaspi.kz қосымшаңызға кепілақы шоты түседі.' 
                    : 'Администратор получил заявку. В течение 5 минут в приложение Kaspi.kz поступит счет на задаток.' 
              }}
              </template>
              <template v-else>
                {{ currentLang === 'kz' 
                    ? 'Әкімшіге хабарлама жіберілді. Брондау бекітілді, төлем моншаға келгенде жүргізіледі.' 
                    : 'Администратор получил заявку. Бронь принята без задатка, оплата производится на месте.' 
                }}
              </template>
            </p>
          </div>

          <div class="bg-neutral-50 rounded-2xl p-4 text-left text-xs space-y-2 border border-neutral-200/60 font-medium">
            <div class="flex justify-between">
              <span class="text-neutral-400">{{ t[currentLang].msgHall }}:</span>
              <span class="font-bold text-neutral-800">{{ selectedRoom?.name_ru }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-neutral-400">{{ t[currentLang].entryTime }}:</span>
              <span class="font-bold text-neutral-800">{{ selectedDay }} {{ monthNames[currentLang][viewMonth] }}, {{ bookingTime }}</span>
            </div>

            <!-- Доп. товары в чеке -->
            <div v-if="banyaExtras.length > 0 && selectedExtrasText !== t[currentLang].none" class="flex justify-between items-start pt-1 border-t border-neutral-200/40">
              <span class="text-neutral-400 shrink-0">Доп. товары:</span>
              <span class="font-semibold text-neutral-700 text-right pl-2 leading-tight text-[11px]">{{ selectedExtrasText }}</span>
            </div>

            <div v-if="hasDeposit" class="flex justify-between">
              <span class="text-neutral-400">Kaspi нөмірі:</span>
              <span class="font-bold font-mono text-neutral-800">{{ targetKaspiPhone }}</span>
            </div>

            <div class="flex justify-between pt-2 border-t border-neutral-200/60">
              <span class="text-neutral-500 font-bold">Итоговая сумма:</span>
              <span class="font-black text-neutral-900 font-mono text-sm">
                {{ totalPrice.toLocaleString() }} ₸
              </span>
            </div>
          </div>

          <div class="space-y-2 pt-1">
            <button 
              @click="isSuccessModalOpen = false; currentStep = 1"
              class="w-full py-4 bg-neutral-900 hover:bg-black active:scale-95 text-white text-xs font-bold rounded-2xl shadow-md transition-all"
            >
              {{ currentLang === 'kz' ? 'Түсінікті' : 'Понятно, ожидаю' }}
            </button>

            <a 
              v-if="currentBanya?.whatsapp" 
              :href="'https://wa.me/' + currentBanya.whatsapp" 
              target="_blank"
              class="block text-[11px] font-bold text-neutral-400 hover:text-neutral-600 transition-colors py-1"
            >
              {{ currentLang === 'kz' ? 'Сұрақтарыңыз бар ма? WhatsApp-қа жазу' : 'Есть срочные вопросы? Написать в WhatsApp' }}
            </a>
          </div>

        </div>
      </div>

      <!-- МОДАЛЬНОЕ ОКНО: ГАЛЕРЕЯ (LIGHTBOX) -->
      <div 
        v-if="isGalleryOpen" 
        class="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between p-4 backdrop-blur-md"
        role="dialog"
        aria-modal="true"
      >
        <div class="flex items-center justify-between text-white pt-2">
          <span class="text-xs font-bold text-neutral-400 font-mono">
            {{ activeImageIndex + 1 }} / {{ activeGalleryImages.length }}
          </span>
          <button 
            @click="isGalleryOpen = false" 
            class="w-10 h-10 rounded-2xl bg-white/10 text-white flex items-center justify-center active:scale-95 transition-all"
            aria-label="Закрыть галерею"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <div class="flex-1 flex items-center justify-center relative">
          <img 
            :src="activeGalleryImages[activeImageIndex]" 
            class="max-h-[75vh] max-w-full object-contain rounded-2xl select-none shadow-2xl" 
            decoding="async"
            alt="Фото зала"
          >

          <button 
            v-if="activeImageIndex > 0"
            @click="activeImageIndex--" 
            class="absolute left-2 w-11 h-11 rounded-2xl bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-all backdrop-blur-xs"
            aria-label="Предыдущее фото"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.75 19.5L8.25 12l7.5-7.5"/></svg>
          </button>
          <button 
            v-if="activeImageIndex < activeGalleryImages.length - 1"
            @click="activeImageIndex++" 
            class="absolute right-2 w-11 h-11 rounded-2xl bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-all backdrop-blur-xs"
            aria-label="Следующее фото"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.25 4.5l7.5 7.5-7.5 7.5"/></svg>
          </button>
        </div>

        <div class="flex items-center justify-center gap-2 overflow-x-auto py-2">
          <img 
            v-for="(img, idx) in activeGalleryImages" 
            :key="idx" 
            :src="img" 
            loading="lazy"
            decoding="async"
            @click="activeImageIndex = idx"
            :class="[
              'w-12 h-12 object-cover rounded-xl cursor-pointer border-2 transition-all',
              activeImageIndex === idx ? 'border-white scale-105' : 'border-transparent opacity-40'
            ]"
            alt="Миниатюра"
          >
        </div>
      </div>

      <!-- МОДАЛЬНОЕ ОКНО: ВИДЕОПЛЕЕР -->
      <div 
        v-if="isVideoModalOpen" 
        class="fixed inset-0 z-50 bg-black flex flex-col justify-between p-4"
        role="dialog"
        aria-modal="true"
      >
        <div class="flex items-center justify-between text-white pt-2 px-1 z-10">
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
            <span class="text-xs font-bold tracking-tight">
              {{ (currentLang === 'kz' ? activeVideo?.title_kz : activeVideo?.title_ru) || t[currentLang].videoDefaultBadge }}
            </span>
          </div>

          <div class="flex items-center gap-2">
            <button 
              @click="toggleModalMute" 
              class="px-3.5 py-1.5 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-white text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all"
            >
              <svg v-if="isModalVideoMuted" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z"/>
              </svg>
              <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z"/>
              </svg>
              <span>{{ isModalVideoMuted ? 'Вкл звук' : 'Выкл' }}</span>
            </button>

            <button 
              @click="closeVideoModal" 
              class="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-white flex items-center justify-center active:scale-95 transition-all"
              aria-label="Закрыть видео"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>
        </div>

        <div class="flex-1 flex items-center justify-center relative p-2">
          <video 
            ref="modalVideoRef"
            :src="activeVideo?.videoUrl" 
            :muted="isModalVideoMuted"
            autoplay 
            loop 
            playsinline 
            class="max-h-[82vh] w-full object-contain rounded-3xl shadow-2xl"
          ></video>
        </div>
      </div>

    </template>

  </div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>