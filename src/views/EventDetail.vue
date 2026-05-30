<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { useEventStore } from '../stores/eventStore'

const route = useRoute()
const eventStore = useEventStore()

const event = eventStore.getEventById(route.params.id)

const categoryLabels = {
  work: '💼 工作',
  life: '🏠 生活',
  health: '💊 健康',
  social: '👥 社交'
}

function formatDateTime(date) {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  })
}

function formatTime(date) {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

function handleDelete() {
  if (confirm('确定要删除这个事件吗？')) {
    eventStore.deleteEvent(route.params.id)
    history.back()
  }
}
</script>

<template>
  <div class="event-detail" v-if="event">
    <header class="detail-header">
      <button class="btn-back" @click="history.back()">‹ 返回</button>
      <h2>事件详情</h2>
      <button class="btn-delete" @click="handleDelete">删除</button>
    </header>

    <div class="detail-content">
      <div class="event-category-badge">
        {{ categoryLabels[event.category] }}
      </div>

      <h1 class="event-title">{{ event.title }}</h1>

      <div class="info-section">
        <div class="info-row">
          <span class="info-icon">📅</span>
          <span class="info-text">{{ formatDateTime(event.startTime) }}</span>
        </div>

        <div class="info-row" v-if="!event.isAllDay">
          <span class="info-icon">🕐</span>
          <span class="info-text">{{ formatTime(event.startTime) }} - {{ formatTime(event.endTime) }}</span>
        </div>

        <div class="info-row" v-else>
          <span class="info-icon">🌙</span>
          <span class="info-text">全天事件</span>
        </div>

        <div class="info-row" v-if="event.reminder">
          <span class="info-icon">⏰</span>
          <span class="info-text">提前 {{ event.reminder }} 分钟提醒</span>
        </div>

        <div class="info-row" v-if="event.repeat !== 'none'">
          <span class="info-icon">🔄</span>
          <span class="info-text">
            {{ { daily: '每天', weekly: '每周', monthly: '每月', yearly: '每年' }[event.repeat] }}重复
          </span>
        </div>
      </div>

      <div class="note-section" v-if="event.note">
        <h3>备注</h3>
        <p>{{ event.note }}</p>
      </div>
    </div>
  </div>

  <div v-else class="not-found">
    <p>事件不存在</p>
    <button @click="history.back()">返回</button>
  </div>
</template>

<style scoped lang="scss">
@use '../styles/variables' as *;

.event-detail {
  min-height: 100vh;
  background: $color-bg-base;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $spacing-md $spacing-lg;
  background: $color-bg-card;
  box-shadow: $shadow-sm;

  h2 {
    margin: 0;
    font-size: $font-size-lg;
    color: $color-text-primary;
  }
}

.btn-back {
  padding: $spacing-xs $spacing-md;
  border: none;
  background: $color-bg-hover;
  border-radius: $border-radius-base;
  font-size: $font-size-base;
  color: $color-text-primary;
  cursor: pointer;

  &:hover {
    background: $color-primary-light;
  }
}

.btn-delete {
  padding: $spacing-xs $spacing-md;
  border: none;
  background: $color-danger;
  color: white;
  border-radius: $border-radius-base;
  font-size: $font-size-base;
  cursor: pointer;

  &:hover {
    background: darken($color-danger, 10%);
  }
}

.detail-content {
  padding: $spacing-xl;
  max-width: 32rem;
  margin: 0 auto;
}

.event-category-badge {
  display: inline-block;
  padding: $spacing-xs $spacing-md;
  background: $color-primary-light;
  color: $color-primary-dark;
  border-radius: $border-radius-lg;
  font-size: $font-size-sm;
  margin-bottom: $spacing-md;
}

.event-title {
  font-size: $font-size-3xl;
  font-weight: 700;
  color: $color-text-primary;
  margin: 0 0 $spacing-xl;
}

.info-section {
  background: $color-bg-card;
  border-radius: $border-radius-lg;
  padding: $spacing-lg;
  box-shadow: $shadow-sm;
}

.info-row {
  display: flex;
  align-items: center;
  gap: $spacing-md;
  padding: $spacing-sm 0;
  border-bottom: 1px solid $color-border-light;

  &:last-child {
    border-bottom: none;
  }

  .info-icon {
    font-size: $font-size-lg;
  }

  .info-text {
    font-size: $font-size-base;
    color: $color-text-primary;
  }
}

.note-section {
  margin-top: $spacing-xl;

  h3 {
    font-size: $font-size-lg;
    color: $color-text-primary;
    margin: 0 0 $spacing-sm;
  }

  p {
    background: $color-bg-card;
    border-radius: $border-radius-base;
    padding: $spacing-md;
    color: $color-text-secondary;
    margin: 0;
  }
}

.not-found {
  text-align: center;
  padding: $spacing-2xl;
  color: $color-text-muted;

  button {
    margin-top: $spacing-md;
    padding: $spacing-sm $spacing-lg;
    border: none;
    background: $color-primary;
    color: white;
    border-radius: $border-radius-base;
    cursor: pointer;
  }
}
</style>