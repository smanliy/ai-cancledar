<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useEventStore } from "../stores/eventStore";
import CalendarHeader from "./CalendarHeader.vue";
import EventList from "./EventList.vue";

const eventStore = useEventStore();

const currentTime = ref(new Date());
let timer = null;

onMounted(() => {
  timer = setInterval(() => {
    currentTime.value = new Date();
  }, 1000);
});

onUnmounted(() => {
  if (timer) {
    clearInterval(timer);
  }
});

const displayDate = computed(() => {
  if (eventStore.selectedDate) {
    return eventStore.selectedDate;
  }
  return currentTime.value;
});

const currentTimeString = computed(() => {
  const hours = currentTime.value.getHours().toString().padStart(2, "0");
  const minutes = currentTime.value.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
});

const calendarDays = computed(() => {
  const year = eventStore.currentDate.getFullYear();
  const month = eventStore.currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startPadding = firstDay.getDay();
  const totalDays = lastDay.getDate();

  const days = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTime = today.getTime();

  for (let i = 0; i < startPadding; i++) {
    days.push({
      isEmpty: true,
    });
  }

  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const currentDay = today.getDate();
  const isCurrentMonth = year === currentYear && month === currentMonth;

  for (let i = 1; i <= totalDays; i++) {
    const date = new Date(year, month, i);
    date.setHours(0, 0, 0, 0);
    const dateTime = date.getTime();
    const isToday = isCurrentMonth && i === currentDay;
    const isPast = dateTime < todayTime;
    const isSelected =
      eventStore.selectedDate &&
      date.toDateString() === eventStore.selectedDate.toDateString();
    days.push({
      date,
      isEmpty: false,
      isCurrentMonth: true,
      isToday,
      isPast,
      isSelected,
    });
  }

  return days;
});

function getEventsForDate(date) {
  return eventStore.getEventsByDate(date);
}

function handleSelectDate(date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dateTime = new Date(date);
  dateTime.setHours(0, 0, 0, 0);

  if (dateTime.getTime() < today.getTime()) {
    return;
  }
  eventStore.setSelectedDate(date);
}
</script>

<template>
  <div class="calendar-month">
    <div class="current-time-bar">
      <span class="time-icon">🕐</span>
      <span class="time-string">{{ currentTimeString }}</span>
      <span class="time-date">{{
        displayDate.toLocaleDateString("zh-CN", {
          weekday: "long",
          month: "long",
          day: "numeric",
        })
      }}</span>
    </div>
    <CalendarHeader />
    <div class="days-grid">
      <div
        v-for="(day, index) in calendarDays"
        :key="index"
        class="day-cell"
        :class="{
          'is-empty': day.isEmpty,
          'is-today': day.isToday,
          'is-selected': day.isSelected,
          'is-past': day.isPast && !day.isToday,
        }"
        @click="day.isEmpty || handleSelectDate(day.date)"
      >
        <div v-if="!day.isEmpty" class="day-header">
          <span class="day-number">{{ day.date.getDate() }}</span>
          <span v-if="day.isToday" class="today-time">{{
            currentTimeString
          }}</span>
        </div>
        <div v-if="!day.isEmpty" class="day-events">
          <div
            v-for="event in getEventsForDate(day.date).slice(0, 2)"
            :key="event.id"
            class="event-dot"
            :class="'category-' + event.category"
          >
            {{ event.title }}
          </div>
          <div v-if="getEventsForDate(day.date).length > 2" class="more-events">
            +{{ getEventsForDate(day.date).length - 2 }}
          </div>
        </div>
      </div>
    </div>
    <EventList />
  </div>
</template>

<style scoped lang="scss">
.calendar-month {
  width: 100%;
  padding: $spacing-md;
}

.current-time-bar {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  padding: $spacing-sm $spacing-md;
  background: linear-gradient(135deg, #fff9e6 0%, #ffe4c4 100%);
  border: 3px solid #d4a574;
  border-radius: 12px;
  margin-bottom: $spacing-md;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  .time-icon {
    font-size: 1.25rem;
    animation: pulse 2s infinite;
  }

  .time-string {
    font-size: 1.5rem;
    font-weight: 700;
    color: #ff6b6b;
    font-family: "Comic Sans MS", cursive, sans-serif;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
    min-width: 4.5rem;
  }

  .time-date {
    font-size: $font-size-sm;
    color: #8b7355;
    font-family: "Comic Sans MS", cursive, sans-serif;
    margin-left: auto;
  }
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.days-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 3px;
  margin-top: $spacing-md;
}

.day-cell {
  min-height: 4.5rem;
  padding: $spacing-xs;
  background: rgba(255, 254, 240, 0.8);
  border-radius: 4px;
  cursor: pointer;
  transition: all $transition-fast;
  border: 2px solid #d4a574;
  position: relative;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: repeating-linear-gradient(
      90deg,
      #d4a574 0px,
      #d4a574 4px,
      transparent 4px,
      transparent 8px
    );
  }

  &:hover {
    background: #fff9e6;
    transform: scale(1.02);
    box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.1);
  }

  &.is-empty {
    background: transparent;
    border: none;
    cursor: default;

    &:hover {
      transform: none;
      box-shadow: none;
      background: transparent;
    }
  }

  &.is-past {
    background: rgba(240, 240, 240, 0.6);
    border-color: #d0d0d0;
    cursor: not-allowed;

    .day-number {
      color: #c0c0c0;
      text-decoration: line-through;
    }

    &:hover {
      transform: none;
      box-shadow: none;
      background: rgba(240, 240, 240, 0.6);
    }

    .day-events {
      opacity: 0.4;
    }
  }

  &.is-today {
    background: linear-gradient(135deg, #fff8dc 0%, #ffe4b5 100%);
    border-color: #ff6b6b;
    border-width: 3px;
    box-shadow:
      0 4px 12px rgba(255, 107, 107, 0.3),
      inset 0 0 20px rgba(255, 107, 107, 0.1);
    cursor: pointer;

    .day-number {
      background: linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 100%);
      color: white;
      border-radius: 50%;
      width: 1.75rem;
      height: 1.75rem;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 8px rgba(255, 107, 107, 0.4);
      text-decoration: none;
    }

    &::after {
      content: "";
      position: absolute;
      top: -1px;
      left: -1px;
      right: -1px;
      bottom: -1px;
      border-radius: 6px;
      background: linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 100%);
      z-index: -1;
      opacity: 0.3;
      filter: blur(8px);
      animation: glowPulse 2s infinite;
    }
  }

  &.is-selected {
    background: #fffacd;
    border-color: #ffb347;
    box-shadow: inset 0 0 15px rgba(255, 179, 71, 0.2);
  }
}

@keyframes glowPulse {
  0%,
  100% {
    opacity: 0.2;
  }
  50% {
    opacity: 0.4;
  }
}

.day-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: $spacing-xs;
}

.day-number {
  font-size: 0.9rem;
  font-weight: 700;
  color: #5d4e37;
  font-family: "Comic Sans MS", cursive, sans-serif;
  text-shadow: 0.5px 0.5px 0 rgba(0, 0, 0, 0.1);
}

.today-time {
  font-size: 0.65rem;
  font-weight: 700;
  color: #ff6b6b;
  font-family: "Comic Sans MS", cursive, sans-serif;
  background: rgba(255, 107, 107, 0.1);
  padding: 2px 4px;
  border-radius: 4px;
  animation: blink 1s infinite;
}

@keyframes blink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

.day-events {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.event-dot {
  font-size: 0.65rem;
  padding: 2px 5px;
  border-radius: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: white;
  font-family: "Comic Sans MS", cursive, sans-serif;
  box-shadow: 1px 1px 3px rgba(0, 0, 0, 0.15);

  &.category-work {
    background: linear-gradient(135deg, #8b7399 0%, #9b84aa 100%);
  }

  &.category-life {
    background: linear-gradient(135deg, #ffb6c1 0%, #ffc0cb 100%);
    color: #8b4557;
  }

  &.category-health {
    background: linear-gradient(135deg, #98d8aa 0%, #a8e8ba 100%);
    color: #3d7a4d;
  }

  &.category-social {
    background: linear-gradient(135deg, #ffd93d 0%, #ffe46b 100%);
    color: #8b7300;
  }
}

.more-events {
  font-size: 0.65rem;
  color: #8b7355;
  padding: 2px 4px;
  font-style: italic;
}
</style>
