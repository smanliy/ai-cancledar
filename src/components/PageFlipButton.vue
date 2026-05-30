<script setup>
import { ref } from "vue";

const emit = defineEmits(["prev", "next", "voice"]);

const isHovering = ref(false);
</script>

<template>
  <div
    class="page-flip-container"
    @mouseenter="isHovering = true"
    @mouseleave="isHovering = false"
  >
    <Transition name="slide-fade">
      <div v-if="isHovering" class="flip-buttons">
        <button class="flip-btn prev-btn" @click="emit('prev')" title="上个月">
          <span class="btn-icon">‹</span>
        </button>
        <button
          class="flip-btn voice-btn"
          @click="emit('voice')"
          title="语音添加"
        >
          <span class="btn-icon">🎤</span>
        </button>
        <button class="flip-btn next-btn" @click="emit('next')" title="下个月">
          <span class="btn-icon">›</span>
        </button>
      </div>
    </Transition>

    <button class="trigger-btn" :class="{ active: isHovering }">
      <span class="trigger-icon">{{ isHovering ? "✕" : "⟳" }}</span>
    </button>
  </div>
</template>

<style scoped lang="scss">
@use "../styles/variables" as *;

.page-flip-container {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: $zindex-dropdown;
  width: 15rem;
  height: 5rem;
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
}

.trigger-btn {
  width: 3.5rem;
  height: 3.5rem;
  border: none;
  background: linear-gradient(
    135deg,
    $color-primary 0%,
    $color-primary-dark 100%
  );
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: $shadow-lg;
  transition: all $transition-base;
  position: relative;
  z-index: 2;

  .trigger-icon {
    font-size: 1.5rem;
    color: white;
    transition: transform $transition-base;
  }

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 8px 40px rgba(155, 142, 212, 0.4);
  }

  &.active {
    .trigger-icon {
      transform: rotate(180deg);
    }
  }
}

.flip-buttons {
  position: absolute;
  bottom: 0.35rem;
  right: 4rem;
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.flip-btn {
  width: 2.8rem;
  height: 2.8rem;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: $shadow-base;
  transition: all $transition-base;

  .btn-icon {
    font-size: 1.5rem;
    color: white;
  }

  &:hover {
    transform: scale(1.15);
  }
}

.prev-btn {
  background: linear-gradient(
    135deg,
    $color-secondary 0%,
    $color-secondary-dark 100%
  );
}

.voice-btn {
  background: linear-gradient(
    135deg,
    $color-primary-light 0%,
    $color-primary 100%
  );
  animation: bounce 2s infinite;
}

.next-btn {
  background: linear-gradient(
    135deg,
    $color-info 0%,
    darken($color-info, 15%) 100%
  );
}

@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-0.3rem);
  }
}

.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.2s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from {
  transform: translateY(20px);
  opacity: 0;
}

.slide-fade-leave-to {
  transform: translateY(10px);
  opacity: 0;
}
</style>
