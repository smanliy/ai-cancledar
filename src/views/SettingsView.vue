<script setup>
import { ref } from 'vue'

const reminderOptions = [
  { value: 0, label: '不提醒' },
  { value: 5, label: '5 分钟前' },
  { value: 15, label: '15 分钟前' },
  { value: 30, label: '30 分钟前' },
  { value: 60, label: '1 小时前' },
  { value: 1440, label: '1 天前' }
]

const currentSettings = ref({
  voiceEnabled: true,
  defaultReminder: 15,
  soundEnabled: true,
  vibrationEnabled: true
})

function handleSave() {
  localStorage.setItem('calendar-settings', JSON.stringify(currentSettings.value))
  alert('设置已保存')
}
</script>

<template>
  <div class="settings-view">
    <header class="settings-header">
      <button class="btn-back" @click="history.back()">‹ 返回</button>
      <h2>设置</h2>
      <div></div>
    </header>

    <div class="settings-content">
      <section class="settings-section">
        <h3>🔊 语音设置</h3>

        <div class="setting-item">
          <div class="setting-info">
            <span class="setting-label">启用语音识别</span>
            <span class="setting-desc">使用麦克风添加和管理事件</span>
          </div>
          <label class="switch">
            <input type="checkbox" v-model="currentSettings.voiceEnabled">
            <span class="slider"></span>
          </label>
        </div>

        <div class="setting-item">
          <div class="setting-info">
            <span class="setting-label">语音反馈</span>
            <span class="setting-desc">操作完成后语音播报确认</span>
          </div>
          <label class="switch">
            <input type="checkbox" v-model="currentSettings.soundEnabled">
            <span class="slider"></span>
          </label>
        </div>
      </section>

      <section class="settings-section">
        <h3>⏰ 提醒设置</h3>

        <div class="setting-item">
          <div class="setting-info">
            <span class="setting-label">默认提醒时间</span>
            <span class="setting-desc">新事件的默认提前提醒时间</span>
          </div>
          <select v-model="currentSettings.defaultReminder" class="select-input">
            <option v-for="opt in reminderOptions" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
        </div>

        <div class="setting-item">
          <div class="setting-info">
            <span class="setting-label">振动提醒</span>
            <span class="setting-desc">移动设备上的振动反馈</span>
          </div>
          <label class="switch">
            <input type="checkbox" v-model="currentSettings.vibrationEnabled">
            <span class="slider"></span>
          </label>
        </div>
      </section>

      <section class="settings-section">
        <h3>ℹ️ 关于</h3>
        <div class="about-info">
          <p><strong>语记日历</strong></p>
          <p>版本 1.0.0</p>
          <p>开口即记，懂你所想</p>
        </div>
      </section>

      <button class="btn-save" @click="handleSave">保存设置</button>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '../styles/variables' as *;

.settings-view {
  min-height: 100vh;
  background: $color-bg-base;
}

.settings-header {
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

.settings-content {
  padding: $spacing-lg;
  max-width: 32rem;
  margin: 0 auto;
}

.settings-section {
  background: $color-bg-card;
  border-radius: $border-radius-lg;
  padding: $spacing-lg;
  margin-bottom: $spacing-lg;
  box-shadow: $shadow-sm;

  h3 {
    font-size: $font-size-base;
    font-weight: 600;
    color: $color-text-primary;
    margin: 0 0 $spacing-md;
  }
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $spacing-sm 0;
  border-bottom: 1px solid $color-border-light;

  &:last-child {
    border-bottom: none;
  }
}

.setting-info {
  flex: 1;
}

.setting-label {
  display: block;
  font-size: $font-size-base;
  color: $color-text-primary;
  margin-bottom: 2px;
}

.setting-desc {
  display: block;
  font-size: $font-size-xs;
  color: $color-text-muted;
}

.switch {
  position: relative;
  width: 2.8rem;
  height: 1.5rem;

  input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: $color-border;
    border-radius: 1.5rem;
    transition: $transition-base;

    &::before {
      content: '';
      position: absolute;
      height: 1.2rem;
      width: 1.2rem;
      left: 0.15rem;
      bottom: 0.15rem;
      background: white;
      border-radius: 50%;
      transition: $transition-base;
    }
  }

  input:checked + .slider {
    background: $color-primary;
  }

  input:checked + .slider::before {
    transform: translateX(1.3rem);
  }
}

.select-input {
  padding: $spacing-xs $spacing-md;
  border: 1px solid $color-border;
  border-radius: $border-radius-base;
  background: $color-bg-card;
  font-size: $font-size-sm;
  color: $color-text-primary;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: $color-primary;
  }
}

.about-info {
  text-align: center;
  color: $color-text-secondary;
  font-size: $font-size-sm;

  p {
    margin: $spacing-xs 0;
  }
}

.btn-save {
  width: 100%;
  padding: $spacing-md;
  border: none;
  background: linear-gradient(135deg, $color-primary 0%, $color-primary-dark 100%);
  color: white;
  border-radius: $border-radius-base;
  font-size: $font-size-base;
  font-weight: 600;
  cursor: pointer;
  transition: all $transition-base;

  &:hover {
    transform: translateY(-2px);
    box-shadow: $shadow-base;
  }
}
</style>