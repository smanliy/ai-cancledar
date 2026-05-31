<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRoute } from "vue-router";
import { useEventStore } from "../stores/eventStore";
import {
  sendReminderEmail as sendReminderEmailApi,
  sendTestEmail,
} from "../utils/api";

const route = useRoute();
const eventStore = useEventStore();

const event = eventStore.getEventById(route.params.id);
const showEmailModal = ref(false);
const recipientEmail = ref("");
const showReminderModal = ref(false);
const reminderEmail = ref(event?.reminderEmail || "");
const showTestModal = ref(false);
const testEmail = ref("");
const emailStatus = ref("");

let reminderInterval = null;

const categoryLabels = {
  work: "💼 工作",
  life: "🏠 生活",
  health: "💊 健康",
  social: "👥 社交",
};

const hasReminderEmail = computed(
  () => event?.reminderEmail && event?.reminderEmail.length > 0,
);

function formatDateTime(date) {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });
}

function formatTime(date) {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
}

async function handleDelete() {
  if (confirm("确定要删除这个事件吗？")) {
    await eventStore.deleteEvent(route.params.id);
    history.back();
  }
}

function generateEmailUrl() {
  const eventTime = event.isAllDay
    ? formatDateTime(event.startTime)
    : `${formatDateTime(event.startTime)} ${formatTime(event.startTime)} - ${formatTime(event.endTime)}`;

  const subject = encodeURIComponent(`📅 邀请您参加: ${event.title}`);
  const body = encodeURIComponent(
    `您好！\n\n我想邀请您参加以下事件：\n\n📋 事件名称：${event.title}\n📅 时间：${eventTime}\n🏷️ 分类：${categoryLabels[event.category]}\n\n${event.note ? `📝 备注：${event.note}\n\n` : ""}期待您的参与！`,
  );

  return `mailto:${recipientEmail.value}?subject=${subject}&body=${body}`;
}

function handleSendEmail() {
  if (recipientEmail.value) {
    window.location.href = generateEmailUrl();
    showEmailModal.value = false;
    recipientEmail.value = "";
  }
}

async function handleSaveReminderEmail() {
  if (event) {
    await eventStore.updateEvent(event.id, {
      reminderEmail: reminderEmail.value,
    });
    showReminderModal.value = false;

    const testResult = await sendTestEmail(reminderEmail.value);
    if (testResult.success) {
      alert("提醒邮箱设置成功！已发送测试邮件，请查收。");
    } else {
      alert("邮件发送失败，请检查邮箱配置或稍后重试。");
    }
  }
}

async function handleTestEmail() {
  emailStatus.value = "sending";
  const result = await sendTestEmail(testEmail.value);

  if (result.success) {
    emailStatus.value = "success";
    setTimeout(() => {
      showTestModal.value = false;
      emailStatus.value = "";
      testEmail.value = "";
    }, 2000);
  } else {
    emailStatus.value = "error";
  }
}

function scheduleReminder() {
  if (!event || !event.reminderEmail) return;

  const reminderMinutes = event.reminder || 5;
  const reminderTime =
    new Date(event.startTime).getTime() - reminderMinutes * 60 * 1000;
  const now = Date.now();

  if (reminderTime > now) {
    const delay = reminderTime - now;
    reminderInterval = setTimeout(() => {
      sendReminderEmail();
      showNotification();
    }, delay);
  }
}

async function sendReminderEmail() {
  try {
    await sendReminderEmailApi({
      id: event.id,
      title: event.title,
      startTime: event.startTime,
      isAllDay: event.isAllDay,
      category: event.category,
      reminderEmail: event.reminderEmail,
      note: event.note,
    });
    console.log("提醒邮件已发送");
  } catch (error) {
    console.error("发送提醒邮件失败:", error);
  }
}

function showNotification() {
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification("📅 事件提醒", {
      body: `${event.title} 即将开始！`,
      icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>📅</text></svg>",
    });
  }
}

function requestNotificationPermission() {
  if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission();
  }
}

onMounted(() => {
  requestNotificationPermission();
  scheduleReminder();
});

onUnmounted(() => {
  if (reminderInterval) {
    clearTimeout(reminderInterval);
  }
});
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
          <span class="info-text"
            >{{ formatTime(event.startTime) }} -
            {{ formatTime(event.endTime) }}</span
          >
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
            {{
              {
                daily: "每天",
                weekly: "每周",
                monthly: "每月",
                yearly: "每年",
              }[event.repeat]
            }}重复
          </span>
        </div>
      </div>

      <div class="note-section" v-if="event.note">
        <h3>备注</h3>
        <p>{{ event.note }}</p>
      </div>

      <div class="info-row reminder-email-row" v-if="hasReminderEmail">
        <span class="info-icon">📧</span>
        <span class="info-text">提醒邮箱: {{ event.reminderEmail }}</span>
        <button class="btn-edit-reminder" @click="showReminderModal = true">
          修改
        </button>
      </div>

      <div class="action-buttons">
        <button class="btn-share" @click="showEmailModal = true">
          <span class="share-icon">✉️</span>
          邮件分享邀请
        </button>
        <button class="btn-reminder" @click="showReminderModal = true">
          <span class="reminder-icon">🔔</span>
          {{ hasReminderEmail ? "修改提醒邮箱" : "设置提醒邮箱" }}
        </button>
      </div>
    </div>
  </div>

  <div v-else class="not-found">
    <p>事件不存在</p>
    <button @click="history.back()">返回</button>
  </div>

  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="showEmailModal"
        class="modal-overlay"
        @click.self="showEmailModal = false"
      >
        <div class="modal-content">
          <h3>📧 邮件邀请</h3>
          <p class="modal-desc">输入收件人邮箱地址，发送事件邀请</p>
          <input
            v-model="recipientEmail"
            type="email"
            placeholder="请输入收件人邮箱"
            class="email-input"
            @keyup.enter="handleSendEmail"
          />
          <div class="modal-actions">
            <button class="btn-cancel" @click="showEmailModal = false">
              取消
            </button>
            <button class="btn-send" @click="handleSendEmail">发送邀请</button>
          </div>
        </div>
      </div>
    </Transition>

    <Transition name="modal">
      <div
        v-if="showReminderModal"
        class="modal-overlay"
        @click.self="showReminderModal = false"
      >
        <div class="modal-content">
          <h3>🔔 邮件提醒设置</h3>
          <p class="modal-desc">
            设置事件提醒邮箱，事件开始前{{
              event?.reminder || 5
            }}分钟将发送提醒邮件
          </p>
          <input
            v-model="reminderEmail"
            type="email"
            placeholder="请输入提醒邮箱地址"
            class="email-input"
            @keyup.enter="handleSaveReminderEmail"
          />
          <div class="modal-actions">
            <button class="btn-cancel" @click="showReminderModal = false">
              取消
            </button>
            <button class="btn-send" @click="handleSaveReminderEmail">
              保存设置
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped lang="scss">
@use "../styles/variables" as *;

.event-detail {
  min-height: 100vh;
  background: linear-gradient(135deg, #fff8e7 0%, #ffe4c4 100%);
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

.reminder-email-row {
  justify-content: space-between;

  .btn-edit-reminder {
    padding: $spacing-xs $spacing-sm;
    border: 2px solid #d4a574;
    background: white;
    border-radius: 6px;
    font-size: $font-size-sm;
    color: #8b6914;
    cursor: pointer;
    font-family: "Comic Sans MS", cursive, sans-serif;
    transition: all $transition-fast;

    &:hover {
      background: #fff9e6;
      transform: scale(1.05);
    }
  }
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
  margin-top: $spacing-xl;
}

.btn-share {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: $spacing-md;
  border: none;
  background: linear-gradient(135deg, #6bb87a 0%, #7cc98a 100%);
  color: white;
  border-radius: 12px;
  font-size: $font-size-base;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(107, 184, 122, 0.3);
  transition: all $transition-base;
  font-family: "Comic Sans MS", cursive, sans-serif;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(107, 184, 122, 0.4);
  }

  .share-icon {
    font-size: $font-size-lg;
  }
}

.btn-reminder {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: $spacing-md;
  border: 3px solid #d4a574;
  background: #fffef0;
  color: #8b6914;
  border-radius: 12px;
  font-size: $font-size-base;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(212, 165, 116, 0.2);
  transition: all $transition-base;
  font-family: "Comic Sans MS", cursive, sans-serif;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(212, 165, 116, 0.3);
    background: #fff9e6;
  }

  .reminder-icon {
    font-size: $font-size-lg;
  }
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: $spacing-md;
}

.modal-content {
  background: #fffef0;
  border-radius: 16px;
  padding: $spacing-xl;
  width: 100%;
  max-width: 24rem;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2);
  border: 3px solid #d4a574;

  h3 {
    font-size: 1.5rem;
    color: #8b6914;
    margin: 0 0 $spacing-sm;
    font-family: "Comic Sans MS", cursive, sans-serif;
    text-align: center;
  }

  .modal-desc {
    text-align: center;
    color: #8b7355;
    margin: 0 0 $spacing-lg;
    font-family: "Comic Sans MS", cursive, sans-serif;
  }
}

.email-input {
  width: 100%;
  padding: $spacing-md;
  border: 2px solid #d4a574;
  border-radius: 8px;
  font-size: $font-size-base;
  background: white;
  box-sizing: border-box;
  font-family: "Comic Sans MS", cursive, sans-serif;
  transition: border-color $transition-fast;

  &:focus {
    outline: none;
    border-color: #c4956a;
  }

  &::placeholder {
    color: #b0b0b0;
  }
}

.modal-actions {
  display: flex;
  gap: $spacing-md;
  margin-top: $spacing-lg;

  button {
    flex: 1;
    padding: $spacing-md;
    border: none;
    border-radius: 8px;
    font-size: $font-size-base;
    font-weight: 600;
    cursor: pointer;
    font-family: "Comic Sans MS", cursive, sans-serif;
    transition: all $transition-fast;
  }
}

.btn-cancel {
  background: #f0f0f0;
  color: #666;

  &:hover {
    background: #e0e0e0;
  }
}

.btn-send {
  background: linear-gradient(135deg, #6bb87a 0%, #7cc98a 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(107, 184, 122, 0.3);

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(107, 184, 122, 0.4);
  }
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-content,
.modal-leave-active .modal-content {
  transition: transform 0.3s ease;
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  transform: scale(0.9);
}
</style>
