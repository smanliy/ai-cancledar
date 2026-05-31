<script setup>
import { ref } from "vue";
import {
  parseVoiceCommand,
  resolveEventFromCommand,
  formatEventForSpeech,
} from "../utils/voiceParser";
import { useEventStore } from "../stores/eventStore";

defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["close", "command"]);

const eventStore = useEventStore();

const isListening = ref(false);
const transcript = ref("");
const feedback = ref("");
const recognition = ref(null);

function initRecognition() {
  if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition.value = new SpeechRecognition();
    recognition.value.continuous = false;
    recognition.value.interimResults = true;
    recognition.value.lang = "zh-CN";

    recognition.value.onresult = (event) => {
      const result = event.results[event.results.length - 1];
      transcript.value = result[0].transcript;
      if (result.isFinal) {
        processVoiceInput(transcript.value);
      }
    };

    recognition.value.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      isListening.value = false;
      feedback.value = "语音识别出错，请重试";
    };

    recognition.value.onend = () => {
      isListening.value = false;
    };
  } else {
    feedback.value = "当前浏览器不支持语音识别";
  }
}

function startListening() {
  if (!recognition.value) {
    initRecognition();
  }
  if (recognition.value) {
    transcript.value = "";
    feedback.value = "";
    isListening.value = true;
    recognition.value.start();
  }
}

function stopListening() {
  if (recognition.value) {
    recognition.value.stop();
    isListening.value = false;
  }
}

async function processVoiceInput(text) {
  const command = parseVoiceCommand(text);
  feedback.value = "正在处理...";

  if (command.action === "create") {
    const event = resolveEventFromCommand(command, eventStore.selectedDate);
    await eventStore.addEvent(event);
    feedback.value = formatEventForSpeech(event);
  } else if (command.action === "query") {
    const dateStr = eventStore.selectedDate.toLocaleDateString("zh-CN");
    const events = eventStore.selectedDateEvents;
    if (events.length > 0) {
      feedback.value = `${dateStr}有${events.length}个事件：${events.map((e) => e.title).join("、")}`;
    } else {
      feedback.value = `${dateStr}没有事件`;
    }
  } else if (command.action === "delete") {
    feedback.value = "请说 要删除的事件名称";
  } else {
    feedback.value = "抱歉，我还理解这个命令";
  }

  emit("command", command);
}

function handleClose() {
  stopListening();
  emit("close");
}

function speakFeedback() {
  if ("speechSynthesis" in window && feedback.value) {
    const utterance = new SpeechSynthesisUtterance(feedback.value);
    utterance.lang = "zh-CN";
    utterance.rate = 1.0;
    speechSynthesis.speak(utterance);
  }
}
</script>

<template>
  <Teleport to="body">
    <div v-if="visible" class="voice-overlay" @click.self="handleClose">
      <div class="voice-panel">
        <div class="panel-header">
          <h3>🗣️ 语音助手</h3>
          <button class="btn-close" @click="handleClose">×</button>
        </div>

        <div class="voice-content">
          <div class="assistant-avatar" :class="{ listening: isListening }">
            <span class="avatar-icon">{{ isListening ? "🎙️" : "🤖" }}</span>
          </div>

          <div class="transcript-box">
            <p v-if="transcript" class="transcript-text">{{ transcript }}</p>
            <p v-else class="transcript-placeholder">请说话...</p>
          </div>

          <div v-if="feedback" class="feedback-box">
            <p>{{ feedback }}</p>
            <button v-if="feedback" class="btn-speak" @click="speakFeedback">
              🔊 播放
            </button>
          </div>
        </div>

        <div class="voice-controls">
          <button
            class="btn-mic"
            :class="{ listening: isListening }"
            @mousedown="startListening"
            @mouseup="stopListening"
            @mouseleave="stopListening"
          >
            <span class="mic-icon">{{ isListening ? "🔴" : "🎤" }}</span>
            <span class="mic-text">{{
              isListening ? "松开结束" : "按住说话"
            }}</span>
          </button>
        </div>

        <div class="voice-hints">
          <p>可以说："下周三下午3点开会" 或 "查看今天有什么事件"</p>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped lang="scss">
@use "../styles/variables" as *;

.voice-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: $zindex-voice;
  backdrop-filter: blur(4px);
}

.voice-panel {
  width: 90%;
  max-width: 24rem;
  background: $color-bg-card;
  border-radius: $border-radius-xl;
  box-shadow: $shadow-lg;
  overflow: hidden;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $spacing-md $spacing-lg;
  background: linear-gradient(
    135deg,
    $color-primary 0%,
    $color-primary-dark 100%
  );
  color: white;

  h3 {
    margin: 0;
    font-size: $font-size-lg;
    font-weight: 600;
  }

  .btn-close {
    width: 1.8rem;
    height: 1.8rem;
    border: none;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    color: white;
    font-size: $font-size-xl;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    line-height: 1;

    &:hover {
      background: rgba(255, 255, 255, 0.3);
    }
  }
}

.voice-content {
  padding: $spacing-xl;
  text-align: center;
}

.assistant-avatar {
  width: 4rem;
  height: 4rem;
  background: linear-gradient(
    135deg,
    $color-secondary-light 0%,
    $color-secondary 100%
  );
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto $spacing-lg;
  transition: all $transition-base;

  &.listening {
    animation: pulse 1.5s infinite;
    background: linear-gradient(
      135deg,
      $color-primary-light 0%,
      $color-primary 100%
    );
  }

  .avatar-icon {
    font-size: 2rem;
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

.transcript-box {
  background: $color-bg-base;
  border-radius: $border-radius-base;
  padding: $spacing-md;
  margin-bottom: $spacing-md;
  min-height: 3rem;
}

.transcript-text {
  margin: 0;
  font-size: $font-size-base;
  color: $color-text-primary;
}

.transcript-placeholder {
  margin: 0;
  font-size: $font-size-base;
  color: $color-text-muted;
}

.feedback-box {
  background: $color-primary-light;
  border-radius: $border-radius-base;
  padding: $spacing-md;
  margin-bottom: $spacing-md;
  display: flex;
  justify-content: space-between;
  align-items: center;

  p {
    margin: 0;
    font-size: $font-size-sm;
    color: $color-text-primary;
    flex: 1;
  }

  .btn-speak {
    padding: $spacing-xs $spacing-sm;
    border: none;
    background: $color-primary;
    color: white;
    border-radius: $border-radius-sm;
    font-size: $font-size-xs;
    cursor: pointer;
    margin-left: $spacing-sm;

    &:hover {
      background: $color-primary-dark;
    }
  }
}

.voice-controls {
  padding: 0 $spacing-xl $spacing-lg;
  display: flex;
  justify-content: center;
}

.btn-mic {
  width: 100%;
  padding: $spacing-md;
  border: none;
  background: linear-gradient(
    135deg,
    $color-primary 0%,
    $color-primary-dark 100%
  );
  color: white;
  border-radius: $border-radius-lg;
  font-size: $font-size-base;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-xs;
  transition: all $transition-base;

  &:hover {
    transform: scale(1.02);
    box-shadow: $shadow-base;
  }

  &.listening {
    background: linear-gradient(135deg, $color-danger 0%, #e85555 100%);
    animation: scalePulse 0.8s infinite;
  }

  .mic-icon {
    font-size: 1.5rem;
  }

  .mic-text {
    font-size: $font-size-sm;
  }
}

@keyframes scalePulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.voice-hints {
  padding: $spacing-md $spacing-lg;
  background: $color-bg-base;
  text-align: center;

  p {
    margin: 0;
    font-size: $font-size-xs;
    color: $color-text-muted;
  }
}
</style>
