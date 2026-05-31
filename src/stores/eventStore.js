import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const API_BASE = 'http://localhost:3001/api'

export const useEventStore = defineStore('event', () => {
  const events = ref([])
  const currentDate = ref(new Date())
  const selectedDate = ref(new Date())
  const viewMode = ref('month')
  const isLoading = ref(false)
  const error = ref(null)

  async function fetchEvents() {
    isLoading.value = true
    error.value = null
    try {
      const response = await fetch(`${API_BASE}/events`)
      if (!response.ok) throw new Error('获取事件失败')
      const data = await response.json()
      events.value = data.map(event => ({
        ...event,
        startTime: new Date(event.startTime),
        endTime: event.endTime ? new Date(event.endTime) : null,
        createdAt: new Date(event.createdAt),
        updatedAt: new Date(event.updatedAt)
      }))
    } catch (err) {
      console.error('获取事件失败:', err)
      error.value = err.message
    } finally {
      isLoading.value = false
    }
  }

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

  async function addEvent(eventData) {
    try {
      const response = await fetch(`${API_BASE}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(eventData)
      })
      if (!response.ok) throw new Error('创建事件失败')
      const newEvent = await response.json()
      const eventWithDates = {
        ...newEvent,
        startTime: new Date(newEvent.startTime),
        endTime: newEvent.endTime ? new Date(newEvent.endTime) : null,
        createdAt: new Date(newEvent.createdAt),
        updatedAt: new Date(newEvent.updatedAt)
      }
      events.value.push(eventWithDates)
      return eventWithDates
    } catch (err) {
      console.error('创建事件失败:', err)
      error.value = err.message
      throw err
    }
  }

  async function updateEvent(id, eventData) {
    try {
      const response = await fetch(`${API_BASE}/events/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(eventData)
      })
      if (!response.ok) throw new Error('更新事件失败')
      const updatedEvent = await response.json()
      const eventWithDates = {
        ...updatedEvent,
        startTime: new Date(updatedEvent.startTime),
        endTime: updatedEvent.endTime ? new Date(updatedEvent.endTime) : null,
        createdAt: new Date(updatedEvent.createdAt),
        updatedAt: new Date(updatedEvent.updatedAt)
      }
      const index = events.value.findIndex(e => e.id === id)
      if (index !== -1) {
        events.value[index] = eventWithDates
      }
      return eventWithDates
    } catch (err) {
      console.error('更新事件失败:', err)
      error.value = err.message
      throw err
    }
  }

  async function deleteEvent(id) {
    try {
      const response = await fetch(`${API_BASE}/events/${id}`, {
        method: 'DELETE'
      })
      if (!response.ok) throw new Error('删除事件失败')
      const index = events.value.findIndex(e => e.id === id)
      if (index !== -1) {
        events.value.splice(index, 1)
      }
      return true
    } catch (err) {
      console.error('删除事件失败:', err)
      error.value = err.message
      throw err
    }
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
    isLoading,
    error,
    currentMonthEvents,
    selectedDateEvents,
    fetchEvents,
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
