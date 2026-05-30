<script setup>
import { computed } from "vue";
import { useEventStore } from "../stores/eventStore";

const eventStore = useEventStore();

const selectedDateEvents = computed(() => eventStore.selectedDateEvents);

function formatTime(date) {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
}

function handleEventClick(event) {
  eventStore.setSelectedDate(new Date(event.startTime));
}

function handleDeleteEvent(eventId) {
  eventStore.deleteEvent(eventId);
}

const categoryLabels = {
  work: "💼 工作",
  life: "🏠 生活",
  health: "💊 健康",
  social: "👥 社交",
};

const categoryColors = {
  work: "#9b8ed4",
  life: "#f5c6d6",
  health: "#a8d5ba",
  social: "#ffd5a8",
};
</script>

<template>
  <div class="event-list">
    <h3 class="event-list-title">今日事件</h3>
    <div v-if="selectedDateEvents.length === 0" class="empty-state">
      <span class="empty-icon">📅</span>
      <p>今天没有事件</p>
    </div>
    <div v-else class="events-container">
      <div
        v-for="event in selectedDateEvents"
        :key="event.id"
        class="event-card"
        :style="{ borderLeftColor: categoryColors[event.category] }"
        @click="handleEventClick(event)"
      >
        <div class="event-info">
          <span
            class="event-category"
            :style="{ background: categoryColors[event.category] }"
          >
            {{ categoryLabels[event.category] }}
          </span>
          <h4 class="event-title">{{ event.title }}</h4>
          <p class="event-time">
            {{
              event.isAllDay
                ? "全天"
                : formatTime(event.startTime) +
                  " - " +
                  formatTime(event.endTime)
            }}
          </p>
          <p v-if="event.note" class="event-note">{{ event.note }}</p>
        </div>
        <button class="btn-delete" @click.stop="handleDeleteEvent(event.id)">
          ×
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use "../styles/variables" as *;

.event-list {
  margin-top: $spacing-xl;
  padding-top: $spacing-lg;
  border-top: 1px solid $color-border-light;
}

.event-list-title {
  font-size: $font-size-lg;
  font-weight: 600;
  color: $color-text-primary;
  margin: 0 0 $spacing-md 0;
}

.empty-state {
  text-align: center;
  padding: $spacing-2xl;
  color: $color-text-muted;

  .empty-icon {
    font-size: 3rem;
    display: block;
    margin-bottom: $spacing-md;
  }

  p {
    margin: 0;
    font-size: $font-size-base;
  }
}

.events-container {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
}

.event-card {
  background: $color-bg-card;
  border-radius: $border-radius-base;
  border-left: 4px solid $color-primary;
  padding: $spacing-md;
  box-shadow: $shadow-sm;
  cursor: pointer;
  transition: all $transition-base;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;

  &:hover {
    box-shadow: $shadow-base;
    transform: translateY(-2px);
  }
}

.event-info {
  flex: 1;
}

.event-category {
  display: inline-block;
  font-size: $font-size-xs;
  padding: 2px 8px;
  border-radius: 10px;
  color: $color-text-primary;
  margin-bottom: $spacing-xs;
}

.event-title {
  font-size: $font-size-base;
  font-weight: 600;
  color: $color-text-primary;
  margin: $spacing-xs 0;
}

.event-time {
  font-size: $font-size-sm;
  color: $color-text-secondary;
  margin: 0;
}

.event-note {
  font-size: $font-size-sm;
  color: $color-text-muted;
  margin: $spacing-xs 0 0 0;
}

.btn-delete {
  width: 1.5rem;
  height: 1.5rem;
  border: none;
  background: $color-bg-hover;
  border-radius: 50%;
  color: $color-text-muted;
  font-size: $font-size-lg;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all $transition-fast;
  padding: 0;
  line-height: 1;

  &:hover {
    background: $color-danger;
    color: white;
  }
}
</style>
