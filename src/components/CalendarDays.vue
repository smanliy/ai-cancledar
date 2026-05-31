<script setup>
import { useEventStore } from "../stores/eventStore";

const eventStore = useEventStore();

function handleViewModeChange(mode) {
  eventStore.setViewMode(mode);
}
</script>

<template>
  <div class="calendar-header-row">
    <div
      class="weekday"
      v-for="day in ['日', '一', '二', '三', '四', '五', '六']"
      :key="day"
    >
      {{ day }}
    </div>
  </div>
</template>

<style scoped lang="scss">
.calendar-header-row {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
  margin-bottom: $spacing-sm;
}

.weekday {
  text-align: center;
  font-size: $font-size-sm;
  font-weight: 600;
  color: $color-text-secondary;
  padding: $spacing-sm 0;

  &:first-child,
  &:last-child {
    color: $color-danger;
  }
}
</style>
