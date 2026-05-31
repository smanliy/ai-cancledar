<script setup>
import { ref, computed, onMounted } from "vue";
import { useEventStore } from "../stores/eventStore";
import CalendarMonth from "../components/CalendarMonth.vue";
import VoiceAssistant from "../components/VoiceAssistant.vue";
import PageFlipButton from "../components/PageFlipButton.vue";

const eventStore = useEventStore();

onMounted(() => {
  eventStore.fetchEvents();
});

const isFlipping = ref(false);
const flipDirection = ref("next");
const showVoicePanel = ref(false);
const showYearPicker = ref(false);

const currentYear = computed(() => eventStore.currentDate.getFullYear());
const currentMonth = computed(() => eventStore.currentDate.getMonth());

const monthNames = [
  "一月",
  "二月",
  "三月",
  "四月",
  "五月",
  "六月",
  "七月",
  "八月",
  "九月",
  "十月",
  "十一月",
  "十二月",
];

const coilCount = 11;

const years = computed(() => {
  const current = currentYear.value;
  const yearList = [];
  for (let i = current - 5; i <= current + 5; i++) {
    yearList.push(i);
  }
  return yearList;
});

function handlePrevMonth() {
  if (isFlipping.value) return;
  flipDirection.value = "prev";
  isFlipping.value = true;
  setTimeout(() => {
    eventStore.goToPrevMonth();
    setTimeout(() => {
      isFlipping.value = false;
    }, 100);
  }, 600);
}

function handleNextMonth() {
  if (isFlipping.value) return;
  flipDirection.value = "next";
  isFlipping.value = true;
  setTimeout(() => {
    eventStore.goToNextMonth();
    setTimeout(() => {
      isFlipping.value = false;
    }, 100);
  }, 600);
}

function handleYearClick() {
  showYearPicker.value = !showYearPicker.value;
}

function selectYear(year) {
  const newDate = new Date(eventStore.currentDate);
  newDate.setFullYear(year);
  eventStore.setCurrentDate(newDate);
  showYearPicker.value = false;
}

function handleVoiceCommand(command) {
  console.log("Voice command:", command);
  showVoicePanel.value = false;
}
</script>

<template>
  <div class="calendar-view">
    <div
      class="desk-calendar"
      :class="{
        'flip-next': flipDirection === 'next',
        'flip-prev': flipDirection === 'prev',
        'is-flipping': isFlipping,
      }"
    >
      <div class="calendar-coils">
        <div class="coil" v-for="i in coilCount" :key="i"></div>
      </div>

      <div class="calendar-body">
        <div class="calendar-header">
          <div class="header-left">
            <div class="year-selector" @click="handleYearClick">
              <span class="year-text">{{ currentYear }}年</span>
              <span class="year-arrow">{{ showYearPicker ? "▲" : "▼" }}</span>
            </div>
            <span class="month-text">{{ monthNames[currentMonth] }}</span>
          </div>
        </div>

        <Transition name="fade">
          <div v-if="showYearPicker" class="year-picker">
            <div
              v-for="year in years"
              :key="year"
              class="year-item"
              :class="{ active: year === currentYear }"
              @click="selectYear(year)"
            >
              {{ year }}年
            </div>
          </div>
        </Transition>

        <CalendarMonth />
      </div>

      <div class="calendar-stand"></div>

      <div class="decorations">
        <div class="cactus">
          <div class="pot">
            <div class="pot-body"></div>
            <div class="pot-pattern"></div>
          </div>
          <div class="plant">
            <div class="cactus-main"></div>
            <div class="cactus-side cactus-side-left"></div>
            <div class="cactus-side cactus-side-right"></div>
            <div class="cactus-flower"></div>
          </div>
        </div>

        <div class="pencil">
          <div class="pencil-body"></div>
          <div class="pencil-tip"></div>
          <div class="pencil-eraser"></div>
        </div>
      </div>

      <div v-if="isFlipping" class="page-curl-container">
        <div
          class="page-curl page-curl-1"
          :class="{
            'flip-next': flipDirection === 'next',
            'flip-prev': flipDirection === 'prev',
          }"
        ></div>
        <div
          class="page-curl page-curl-2"
          :class="{
            'flip-next': flipDirection === 'next',
            'flip-prev': flipDirection === 'prev',
          }"
        ></div>
        <div
          class="page-curl page-curl-3"
          :class="{
            'flip-next': flipDirection === 'next',
            'flip-prev': flipDirection === 'prev',
          }"
        ></div>
      </div>
    </div>

    <VoiceAssistant
      :visible="showVoicePanel"
      @close="showVoicePanel = false"
      @command="handleVoiceCommand"
    />

    <PageFlipButton
      @prev="handlePrevMonth"
      @next="handleNextMonth"
      @voice="showVoicePanel = true"
    />
  </div>
</template>

<style scoped lang="scss">
.calendar-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #fff8e7 0%, #ffe4c4 100%);
  padding: $spacing-md;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  padding-bottom: 8rem;
}

.desk-calendar {
  position: relative;
  width: 100%;
  max-width: 42rem;
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  transform-style: preserve-3d;

  &.is-flipping {
    .calendar-body {
      animation: pageFlip 0.5s ease-in-out;
    }
  }
}

.calendar-coils {
  display: flex;
  justify-content: space-between;
  padding: 0 0.5rem;
  margin-bottom: -0.25rem;
  z-index: 10;
  position: relative;
  pointer-events: none;
}

.coil {
  width: 1.5rem;
  height: 1.5rem;
  border: 4px solid #c4956a;
  border-radius: 50%;
  background: transparent;
  position: relative;

  &::before {
    content: "";
    position: absolute;
    top: 50%;
    left: -0.125rem;
    right: -0.125rem;
    height: 4px;
    background: #c4956a;
    transform: translateY(-50%);
  }
}

.calendar-body {
  background: #fffef0;
  border: 4px solid #c4956a;
  border-radius: 0 0 8px 8px;
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.15),
    inset 0 0 30px rgba(0, 0, 0, 0.03);
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2rem;
    background: linear-gradient(
      180deg,
      rgba(255, 254, 240, 1) 0%,
      rgba(255, 254, 240, 0) 100%
    );
    pointer-events: none;
    z-index: 1;
  }
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem $spacing-lg 1rem;
  border-bottom: 3px dashed #d4a574;
  background: linear-gradient(135deg, #fff9e6 0%, #fffef0 100%);

  position: relative;
  z-index: 2;
}

.header-left {
  display: flex;
  align-items: center;
  gap: $spacing-md;
}

.calendar-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #8b6914;
  margin: 0;
  font-family: "Comic Sans MS", cursive, sans-serif;
  text-shadow: 1px 1px 0 rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.year-selector {
  cursor: pointer;
  padding: 0.5rem 0.75rem;
  border-radius: 12px;
  transition: all $transition-fast;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #6b8dd6 0%, #8b5cf6 100%);
  box-shadow: 0 4px 12px rgba(107, 141, 214, 0.4);
  border: 2px solid #5a7bc2;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(107, 141, 214, 0.5);
  }
}

.year-text {
  font-size: 1.25rem;
  font-weight: 700;
  color: white;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
}

.year-arrow {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.9);
  transition: transform $transition-fast;
}

.month-text {
  font-size: 1.5rem;
  font-weight: 600;
  color: #8b6914;
  font-family: "Comic Sans MS", cursive, sans-serif;
}

.year-picker {
  position: absolute;
  top: 100%;
  left: 1rem;
  right: 1rem;
  background: #fffef0;
  border: 3px solid #d4a574;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  padding: 0.5rem;
  z-index: 100;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 0.25rem;
}

.year-item {
  padding: 0.5rem;
  text-align: center;
  border-radius: 6px;
  cursor: pointer;
  font-family: "Comic Sans MS", cursive, sans-serif;
  font-size: 1rem;
  color: #5d4e37;
  transition: all $transition-fast;

  &:hover {
    background: #ffe4b5;
    transform: scale(1.05);
  }

  &.active {
    background: #ffc080;
    font-weight: 700;
    color: #8b4513;
  }
}

.calendar-stand {
  position: absolute;
  bottom: -4rem;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 6rem solid transparent;
  border-right: 6rem solid transparent;
  border-top: 4rem solid #d4a574;
  opacity: 0.8;
}

.decorations {
  position: absolute;
  bottom: -2rem;
  left: 0;
  right: 0;
  pointer-events: none;
}

.cactus {
  position: absolute;
  bottom: 0;
  left: -4rem;
}

.pot {
  position: relative;
  z-index: 1;
}

.pot-body {
  width: 3rem;
  height: 2.5rem;
  background: #d4725c;
  border-radius: 0 0 1rem 1rem;
  position: relative;

  &::before {
    content: "";
    position: absolute;
    top: -0.5rem;
    left: -0.3rem;
    right: -0.3rem;
    height: 0.8rem;
    background: #c4624c;
    border-radius: 0.3rem 0.3rem 0 0;
  }
}

.pot-pattern {
  position: absolute;
  bottom: 0.3rem;
  left: 0.3rem;
  right: 0.3rem;
  height: 0.8rem;
  background: repeating-linear-gradient(
    90deg,
    transparent,
    transparent 0.3rem,
    #c4624c 0.3rem,
    #c4624c 0.4rem
  );
  border-radius: 0 0 0.5rem 0.5rem;
}

.plant {
  position: absolute;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
}

.cactus-main {
  width: 1.5rem;
  height: 3rem;
  background: linear-gradient(90deg, #6bb87a 0%, #7cc98a 50%, #6bb87a 100%);
  border-radius: 1rem 1rem 0.5rem 0.5rem;
  position: relative;

  &::before,
  &::after {
    content: "";
    position: absolute;
    width: 0.2rem;
    height: 0.8rem;
    background: #5a9a68;
    border-radius: 0.1rem;
  }

  &::before {
    left: 0.3rem;
    top: 0.5rem;
  }

  &::after {
    right: 0.3rem;
    top: 1.5rem;
  }
}

.cactus-side {
  position: absolute;
  width: 0.8rem;
  height: 1.5rem;
  background: #7cc98a;
  border-radius: 0.5rem;

  &.cactus-side-left {
    left: -0.5rem;
    top: 0.8rem;
    transform: rotate(-15deg);
  }

  &.cactus-side-right {
    right: -0.5rem;
    top: 1.2rem;
    transform: rotate(15deg);
  }
}

.cactus-flower {
  position: absolute;
  top: -0.6rem;
  left: 50%;
  transform: translateX(-50%);
  width: 0.8rem;
  height: 0.8rem;
  background: #ff6b9d;
  border-radius: 50%;

  &::before {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 0.3rem;
    height: 0.3rem;
    background: #ffc0cb;
    border-radius: 50%;
  }
}

.pencil {
  position: absolute;
  bottom: 0;
  right: -3rem;
  transform: rotate(-15deg);
}

.pencil-body {
  width: 0.7rem;
  height: 6rem;
  background: linear-gradient(
    90deg,
    #8b4513 0%,
    #a0522d 30%,
    #cd853f 70%,
    #8b4513 100%
  );
  border-radius: 0.2rem;
  position: relative;

  &::before {
    content: "";
    position: absolute;
    top: 1rem;
    left: 0;
    right: 0;
    height: 1.5rem;
    background: repeating-linear-gradient(
      180deg,
      transparent,
      transparent 0.25rem,
      rgba(139, 69, 19, 0.3) 0.25rem,
      rgba(139, 69, 19, 0.3) 0.35rem
    );
  }
}

.pencil-tip {
  position: absolute;
  bottom: -1.2rem;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 0.35rem solid transparent;
  border-right: 0.35rem solid transparent;
  border-top: 1.2rem solid #2c2c2c;
}

.pencil-eraser {
  position: absolute;
  top: -0.6rem;
  left: 50%;
  transform: translateX(-50%);
  width: 0.9rem;
  height: 0.6rem;
  background: #ff6b6b;
  border-radius: 0.1rem;

  &::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 0.5rem;
    height: 0.15rem;
    background: #8b4513;
  }
}

@keyframes pageFlip {
  0% {
    transform: rotateY(0deg);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  }
  50% {
    transform: rotateY(-20deg);
    box-shadow: -10px 10px 30px rgba(0, 0, 0, 0.3);
  }
  100% {
    transform: rotateY(0deg);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  }
}

.flip-next .calendar-body {
  animation: pageFlipRight 0.5s ease-in-out;
}

.flip-prev .calendar-body {
  animation: pageFlipLeft 0.5s ease-in-out;
}

@keyframes pageFlipRight {
  0% {
    transform: rotateY(0deg) translateX(0);
  }
  50% {
    transform: rotateY(-25deg) translateX(-10px);
    opacity: 0.8;
  }
  100% {
    transform: rotateY(0deg) translateX(0);
    opacity: 1;
  }
}

@keyframes pageFlipLeft {
  0% {
    transform: rotateY(0deg) translateX(0);
  }
  50% {
    transform: rotateY(25deg) translateX(10px);
    opacity: 0.8;
  }
  100% {
    transform: rotateY(0deg) translateX(0);
    opacity: 1;
  }
}

.page-curl-container {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 120px;
  height: 120px;
  pointer-events: none;
  z-index: 50;
}

.page-curl {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  transform-origin: bottom right;
}

.page-curl-1 {
  z-index: 53;
  animation-delay: 0s;
}

.page-curl-2 {
  z-index: 52;
  animation-delay: 0.08s;
  opacity: 0.8;
  transform: scale(0.95);
}

.page-curl-3 {
  z-index: 51;
  animation-delay: 0.16s;
  opacity: 0.6;
  transform: scale(0.9);
}

.page-curl.flip-next {
  animation: curlRight 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

.page-curl.flip-prev {
  animation: curlLeft 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

@keyframes curlRight {
  0% {
    transform: rotate(0deg) scale(0.8) translateY(0);
    opacity: 0;
  }
  30% {
    transform: rotate(-10deg) scale(0.9) translateY(-5px);
    opacity: 0.9;
  }
  60% {
    transform: rotate(-30deg) scale(1) translateY(-15px);
    opacity: 0.8;
  }
  100% {
    transform: rotate(-60deg) scale(1.1) translateY(-30px);
    opacity: 0;
  }
}

@keyframes curlLeft {
  0% {
    transform: rotate(0deg) scale(0.8) translateY(0);
    opacity: 0;
  }
  30% {
    transform: rotate(10deg) scale(0.9) translateY(-5px);
    opacity: 0.9;
  }
  60% {
    transform: rotate(30deg) scale(1) translateY(-15px);
    opacity: 0.8;
  }
  100% {
    transform: rotate(60deg) scale(1.1) translateY(-30px);
    opacity: 0;
  }
}

.page-curl::before {
  content: "";
  position: absolute;
  bottom: 0;
  right: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    135deg,
    rgba(255, 254, 240, 0.95) 0%,
    rgba(245, 240, 220, 0.9) 30%,
    rgba(200, 180, 150, 0.6) 70%,
    rgba(150, 130, 100, 0.3) 100%
  );
  border-radius: 0 0 12px 0;
  box-shadow:
    -4px -4px 15px rgba(0, 0, 0, 0.2),
    -8px -8px 30px rgba(0, 0, 0, 0.1),
    inset 3px 3px 6px rgba(255, 255, 255, 0.9),
    inset -2px -2px 4px rgba(0, 0, 0, 0.05);
  border: 3px solid #c4956a;
  border-top: 2px solid #d4a574;
  border-left: 2px solid #d4a574;
}

.page-curl::after {
  content: "";
  position: absolute;
  bottom: 3px;
  right: 3px;
  width: calc(100% - 6px);
  height: calc(100% - 6px);
  background: linear-gradient(
    135deg,
    rgba(255, 254, 240, 0.9) 0%,
    rgba(240, 235, 215, 0.7) 50%,
    rgba(200, 185, 160, 0.4) 100%
  );
  border-radius: 0 0 10px 0;
}

.page-curl-inner {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 100%;
  height: 100%;
  transform-origin: bottom right;
}

.page-curl-inner::before {
  content: "";
  position: absolute;
  bottom: 6px;
  right: 6px;
  width: calc(100% - 12px);
  height: calc(100% - 12px);
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.8) 0%,
    rgba(245, 240, 225, 0.5) 100%
  );
  border-radius: 0 0 8px 0;
  box-shadow: inset 2px 2px 4px rgba(255, 255, 255, 0.6);
}

.page-curl-shadow {
  position: absolute;
  bottom: -5px;
  right: -5px;
  width: 100%;
  height: 100%;
  background: radial-gradient(
    ellipse at center,
    rgba(0, 0, 0, 0.3) 0%,
    rgba(0, 0, 0, 0.1) 50%,
    transparent 70%
  );
  border-radius: 50%;
  transform: scale(1.5);
  opacity: 0;
}

.flip-next .page-curl-shadow {
  animation: shadowPulse 0.8s ease-in-out;
}

.flip-prev .page-curl-shadow {
  animation: shadowPulseLeft 0.8s ease-in-out;
}

@keyframes shadowPulse {
  0% {
    opacity: 0;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(1.5);
  }
  100% {
    opacity: 0;
    transform: scale(2);
  }
}

@keyframes shadowPulseLeft {
  0% {
    opacity: 0;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(1.5);
  }
  100% {
    opacity: 0;
    transform: scale(2);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
