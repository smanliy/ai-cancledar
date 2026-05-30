<script setup>
import { computed } from "vue";
import { useEventStore } from "../stores/eventStore";
import CalendarHeader from "./CalendarHeader.vue";
import EventList from "./EventList.vue";

const eventStore = useEventStore();

const calendarDays = computed(() => {
  const year = eventStore.currentDate.getFullYear();
  const month = eventStore.currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startPadding = firstDay.getDay();
  const totalDays = lastDay.getDate();

  const days = [];

  for (let i = 0; i < startPadding; i++) {
    const prevDate = new Date(year, month, -startPadding + i + 1);
    days.push({
      date: prevDate,
      isCurrentMonth: false,
      isToday: false,
      isSelected: false,
    });
  }

  const today = new Date();
  for (let i = 1; i <= totalDays; i++) {
    const date = new Date(year, month, i);
    const isToday = date.toDateString() === today.toDateString();
    const isSelected =
      eventStore.selectedDate &&
      date.toDateString() === eventStore.selectedDate.toDateString();
    days.push({
      date,
      isCurrentMonth: true,
      isToday,
      isSelected,
    });
  }

  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) {
    const nextDate = new Date(year, month + 1, i);
    days.push({
      date: nextDate,
      isCurrentMonth: false,
      isToday: false,
      isSelected: false,
    });
  }

  return days;
});

function getEventsForDate(date) {
  return eventStore.getEventsByDate(date);
}

function handleSelectDate(date) {
  eventStore.setSelectedDate(date);
}
</script>

<template>
  <div class="calendar-month">
    <CalendarHeader />
    <div class="days-grid">
      <div
        v-for="(day, index) in calendarDays"
        :key="index"
        class="day-cell"
        :class="{
          'other-month': !day.isCurrentMonth,
          'is-today': day.isToday,
          'is-selected': day.isSelected,
        }"
        @click="handleSelectDate(day.date)"
      >
        <span class="day-number">{{ day.date.getDate() }}</span>
        <div class="day-events">
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
@use "../styles/variables" as *;

.calendar-month {
  width: 100%;
  padding: $spacing-md;
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
  background: rgba(255,254,240,0.8);
  border-radius: 4px;
  cursor: pointer;
  transition: all $transition-fast;
  border: 2px solid #d4a574;
  position: relative;
  
  &::before {
    content: '';
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
    box-shadow: 2px 2px 8px rgba(0,0,0,0.1);
  }

  &.other-month {
    background: rgba(255,248,230,0.5);
    
    .day-number {
      color: #b0b0b0;
      opacity: 0.6;
    }
  }

  &.is-today {
    background: #fff8dc;
    border-color: #ff6b6b;
    
    .day-number {
      background: linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 100%);
      color: white;
      border-radius: 50%;
      width: 1.75rem;
      height: 1.75rem;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 8px rgba(255,107,107,0.4);
    }
  }

  &.is-selected {
    background: #fffacd;
    border-color: #ffb347;
    box-shadow: inset 0 0 15px rgba(255,179,71,0.2);
  }
}

.day-number {
  font-size: 0.9rem;
  font-weight: 700;
  color: #5d4e37;
  margin-bottom: $spacing-xs;
  font-family: 'Comic Sans MS', cursive, sans-serif;
  text-shadow: 0.5px 0.5px 0 rgba(0,0,0,0.1);
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
  font-family: 'Comic Sans MS', cursive, sans-serif;
  box-shadow: 1px 1px 3px rgba(0,0,0,0.15);

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
