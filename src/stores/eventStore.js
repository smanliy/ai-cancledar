import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useEventStore = defineStore('event', () => {
  const events = ref([
    {
      id: '1',
      title: '团队周会',
      startTime: new Date(new Date().setHours(10, 0, 0, 0)),
      endTime: new Date(new Date().setHours(11, 0, 0, 0)),
      isAllDay: false,
      category: 'work',
      reminder: 15,
      reminderEmail: '',
      repeat: 'weekly',
      note: '讨论项目进度',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '2',
      title: '健身',
      startTime: new Date(new Date().setDate(new Date().getDate() + 1)),
      isAllDay: false,
      category: 'health',
      reminder: 30,
      reminderEmail: '',
      repeat: 'none',
      note: '',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '3',
      title: '妈妈生日',
      startTime: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 5),
      isAllDay: true,
      category: 'life',
      reminder: 1440,
      reminderEmail: '',
      repeat: 'yearly',
      note: '别忘了买蛋糕',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ])

  const currentDate = ref(new Date())
  const selectedDate = ref(new Date())
  const viewMode = ref('month')

  const currentMonthEvents = computed(() => {
    const year = currentDate.value.getFullYear()
    const month = currentDate.value.getMonth()
    return events.value.filter(event => {
      const eventDate = new Date(event.startTime)
      return eventDate.getFullYear() === year && eventDate.getMonth() === month
    })
  })

  const selectedDateEvents = computed(() => {
    const dateStr = selectedDate.value.toDateString()
    return events.value.filter(event => {
      const eventDate = new Date(event.startTime)
      return eventDate.toDateString() === dateStr
    })
  })

  function getEventsByDate(date) {
    const dateStr = new Date(date).toDateString()
    return events.value.filter(event => {
      const eventDate = new Date(event.startTime)
      return eventDate.toDateString() === dateStr
    })
  }

  function addEvent(eventData) {
    const newEvent = {
      id: Date.now().toString(),
      ...eventData,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    events.value.push(newEvent)
    return newEvent
  }

  function updateEvent(id, eventData) {
    const index = events.value.findIndex(e => e.id === id)
    if (index !== -1) {
      events.value[index] = {
        ...events.value[index],
        ...eventData,
        updatedAt: new Date()
      }
      return events.value[index]
    }
    return null
  }

  function deleteEvent(id) {
    const index = events.value.findIndex(e => e.id === id)
    if (index !== -1) {
      events.value.splice(index, 1)
      return true
    }
    return false
  }

  function getEventById(id) {
    return events.value.find(e => e.id === id)
  }

  function setCurrentDate(date) {
    currentDate.value = new Date(date)
  }

  function setSelectedDate(date) {
    selectedDate.value = new Date(date)
  }

  function setViewMode(mode) {
    viewMode.value = mode
  }

  function goToNextMonth() {
    const newDate = new Date(currentDate.value)
    newDate.setMonth(newDate.getMonth() + 1)
    currentDate.value = newDate
  }

  function goToPrevMonth() {
    const newDate = new Date(currentDate.value)
    newDate.setMonth(newDate.getMonth() - 1)
    currentDate.value = newDate
  }

  return {
    events,
    currentDate,
    selectedDate,
    viewMode,
    currentMonthEvents,
    selectedDateEvents,
    getEventsByDate,
    addEvent,
    updateEvent,
    deleteEvent,
    getEventById,
    setCurrentDate,
    setSelectedDate,
    setViewMode,
    goToNextMonth,
    goToPrevMonth
  }
})