<script setup>
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useEventStore } from "../stores/eventStore";

const router = useRouter();
const eventStore = useEventStore();

const selectedDateEvents = computed(() => eventStore.selectedDateEvents);

function formatTime(date) {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
}

function handleEventClick(event) {
  eventStore.setSelectedDate(new Date(event.startTime));
  router.push(`/event/${event.id}`);
}

async function handleDeleteEvent(eventId) {
  await eventStore.deleteEvent(eventId);
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
.event-list {
  margin-top: $spacing-xl;
  padding-top: $spacing-lg;
  border-top: 3px dashed #d4a574;
  position: relative;

  &::before {
    content: "";
    position: absolute;
    top: -0.5rem;
    left: 1rem;
    right: 1rem;
    height: 2px;
    background: repeating-linear-gradient(
      90deg,
      #d4a574 0px,
      #d4a574 4px,
      transparent 4px,
      transparent 12px
    );
  }
}

.event-list-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #8b6914;
  margin: 0 0 $spacing-md 0;
  font-family: "Comic Sans MS", cursive, sans-serif;
  text-shadow: 1px 1px 0 rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &::before {
    content: "📝";
    font-size: 1.1rem;
  }
}

.empty-state {
  text-align: center;
  padding: $spacing-2xl;
  color: #b0b0b0;

  .empty-icon {
    font-size: 3.5rem;
    display: block;
    margin-bottom: $spacing-md;
    animation: bounce 2s infinite;
  }

  p {
    margin: 0;
    font-size: $font-size-base;
    font-family: "Comic Sans MS", cursive, sans-serif;
    color: #8b7355;
  }
}

@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.events-container {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
}

.event-card {
  background: #fffef0;
  border-radius: 8px;
  border-left: 5px solid #d4a574;
  padding: $spacing-md;
  box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all $transition-base;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border: 2px solid #d4a574;

  &:hover {
    box-shadow: 4px 4px 12px rgba(0, 0, 0, 0.12);
    transform: translateY(-2px);
    background: #fff9e6;
  }
}

.event-info {
  flex: 1;
}

.event-category {
  display: inline-block;
  font-size: 0.7rem;
  padding: 3px 10px;
  border-radius: 12px;
  color: white;
  margin-bottom: $spacing-xs;
  font-family: "Comic Sans MS", cursive, sans-serif;
  box-shadow: 1px 1px 3px rgba(0, 0, 0, 0.15);
}

.event-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #5d4e37;
  margin: $spacing-xs 0;
  font-family: "Comic Sans MS", cursive, sans-serif;
  text-shadow: 0.5px 0.5px 0 rgba(0, 0, 0, 0.1);
}

.event-time {
  font-size: 0.85rem;
  color: #8b7355;
  margin: 0;
  font-family: "Comic Sans MS", cursive, sans-serif;

  &::before {
    content: "🕐 ";
  }
}

.event-note {
  font-size: 0.85rem;
  color: #a09070;
  margin: $spacing-xs 0 0 0;
  font-style: italic;

  &::before {
    content: "💭 ";
  }
}

.btn-delete {
  width: 1.7rem;
  height: 1.7rem;
  border: 2px solid #ff6b6b;
  background: white;
  border-radius: 50%;
  color: #ff6b6b;
  font-size: 1.2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all $transition-fast;
  padding: 0;
  line-height: 0.8;
  box-shadow: 1px 1px 4px rgba(255, 107, 107, 0.3);

  &:hover {
    background: #ff6b6b;
    color: white;
    transform: scale(1.1);
    box-shadow: 2px 2px 8px rgba(255, 107, 107, 0.4);
  }
}
</style>
