<template>
  <div class="status-page">
    <AuthBackground />

    <main class="status-main">
      <div class="status-card">
        <div class="status-illu" :style="illuStyle">
          <span class="illu-glow" :style="{ background: glowBg }" />
          <span class="illu-icon">{{ icon }}</span>
          <span v-if="code" class="illu-code">{{ code }}</span>
        </div>

        <h1 class="status-title">{{ title }}</h1>
        <p class="status-desc">{{ description }}</p>

        <div v-if="$slots.default" class="status-extra">
          <slot />
        </div>

        <div class="status-actions">
          <button
            v-for="(btn, i) in actions"
            :key="i"
            :class="['status-btn', btn.type === 'primary' ? 'btn-primary' : 'btn-ghost']"
            type="button"
            @click="btn.onClick"
          >{{ btn.text }}</button>
        </div>

        <div v-if="tips && tips.length" class="status-tips">
          <span
            v-for="(t, i) in tips"
            :key="i"
            class="tip-chip"
          >{{ t }}</span>
        </div>
      </div>

      <footer class="status-footer">
        © {{ year }} Nexus Apex Inc. All Rights Reserved.
      </footer>
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import AuthBackground from '../auth/AuthBackground.vue'

const props = defineProps({
  // 视觉
  icon:         { type: String, default: '✨' },     // 顶部 emoji 大图标
  code:         { type: String, default: '' },        // 大号数字(404/500)留空则不显示
  glowColor:    { type: String, default: '#6a7bff' }, // 光晕主色
  gradientFrom: { type: String, default: '#8ec5fc' },
  gradientTo:   { type: String, default: '#fbc2eb' },

  // 文案
  title:       { type: String, required: true },
  description: { type: String, default: '' },

  // 操作按钮
  actions: {
    type: Array,
    default: () => [],
    // { text: '返回首页', type: 'primary' | 'ghost', onClick: fn }
  },

  // 底部小提示 chip
  tips: { type: Array, default: () => [] },
})

const year = computed(() => new Date().getFullYear())

const illuStyle = computed(() => ({
  '--g-from': props.gradientFrom,
  '--g-to':   props.gradientTo,
}))

const glowBg = computed(
  () => `radial-gradient(closest-side, ${props.glowColor}, transparent 70%)`
)
</script>

<style scoped>
.status-page {
  position: relative;
  width: 100%;
  min-height: 100vh;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7ff;
}

.theme-light.status-page {
  background:
    radial-gradient(1200px 800px at 8% 10%, rgba(165, 180, 252, 0.55) 0%, transparent 60%),
    radial-gradient(1000px 700px at 92% 90%, rgba(251, 207, 232, 0.55) 0%, transparent 60%),
    radial-gradient(900px 600px at 55% 50%, rgba(167, 243, 208, 0.42) 0%, transparent 70%),
    linear-gradient(135deg, #f8faff 0%, #f5f0ff 50%, #fff5f7 100%);
}

.status-main {
  position: relative;
  z-index: 2;
  width: min(640px, 92vw);
  padding: 32px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* ===== 玻璃卡片 ===== */
.status-card {
  position: relative;
  width: 100%;
  padding: 44px 36px 36px;
  background: rgba(255, 255, 255, 0.78);
  backdrop-filter: blur(22px) saturate(160%);
  -webkit-backdrop-filter: blur(22px) saturate(160%);
  border: 1px solid rgba(165, 180, 252, 0.4);
  border-radius: 22px;
  box-shadow:
    0 30px 60px -10px rgba(122, 110, 255, 0.22),
    0 12px 30px -8px rgba(122, 110, 255, 0.18),
    inset 0 1px 0 rgba(255, 255, 255, 0.95);
  color: #1e1b4b;
  text-align: center;
  animation: cardFloat 6s ease-in-out infinite;
}
@keyframes cardFloat {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-6px); }
}

/* ===== 顶部插画(emoji + 大号 code + 光晕) ===== */
.status-illu {
  position: relative;
  width: 160px;
  height: 160px;
  margin: 0 auto 18px;
  display: grid;
  place-items: center;
}
.illu-glow {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  filter: blur(34px);
  opacity: 0.7;
  animation: pulse 3.4s ease-in-out infinite;
}
@keyframes pulse {
  0%, 100% { transform: scale(1);   opacity: 0.7; }
  50%      { transform: scale(1.12); opacity: 0.45; }
}

.illu-icon {
  position: relative;
  font-size: 64px;
  line-height: 1;
  filter: drop-shadow(0 6px 18px rgba(0, 0, 0, 0.35));
  animation: bob 4s ease-in-out infinite;
}
@keyframes bob {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-6px); }
}

.illu-code {
  position: absolute;
  bottom: -2px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 30px;
  font-weight: 800;
  letter-spacing: 4px;
  background: linear-gradient(120deg, var(--g-from), var(--g-to));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-shadow: 0 0 28px rgba(165, 180, 252, 0.45);
}

/* ===== 文案 ===== */
.status-title {
  margin: 6px 0 8px;
  font-size: 26px;
  font-weight: 700;
  letter-spacing: 1px;
  color: #1e1b4b;
}
.status-desc {
  margin: 0 0 24px;
  color: rgba(30, 41, 59, 0.7);
  font-size: 14px;
  line-height: 1.7;
}

.status-extra {
  margin-bottom: 22px;
  color: rgba(30, 41, 59, 0.75);
  font-size: 13px;
}

/* ===== 按钮组 ===== */
.status-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 18px;
}
.status-btn {
  min-width: 132px;
  height: 44px;
  padding: 0 22px;
  border-radius: 12px;
  font-size: 14px;
  letter-spacing: 2px;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.3s ease, filter 0.3s ease, background 0.3s ease;
  border: 1px solid transparent;
}
.btn-primary {
  color: #fff;
  background: linear-gradient(120deg, #6366f1 0%, #a855f7 60%, #ec4899 100%);
  box-shadow: 0 10px 24px rgba(99, 102, 241, 0.45);
}
.btn-primary:hover {
  filter: brightness(1.05) saturate(1.1);
  box-shadow: 0 16px 30px rgba(168, 85, 247, 0.55);
  transform: translateY(-1px);
}
.btn-primary:active { transform: scale(0.97); }

.btn-ghost {
  color: #1e1b4b;
  background: rgba(255, 255, 255, 0.7);
  border-color: rgba(165, 180, 252, 0.55);
}
.btn-ghost:hover {
  color: #312e81;
  background: rgba(255, 255, 255, 0.95);
  border-color: rgba(99, 102, 241, 0.6);
  box-shadow: 0 6px 14px rgba(122, 110, 255, 0.22);
}
.btn-ghost:active { transform: scale(0.97); }

/* ===== 底部小提示 ===== */
.status-tips {
  display: flex;
  gap: 8px;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 6px;
}
.tip-chip {
  padding: 4px 10px;
  font-size: 12px;
  color: rgba(30, 41, 59, 0.7);
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(165, 180, 252, 0.4);
  border-radius: 999px;
}

/* ===== 页脚 ===== */
.status-footer {
  margin-top: 26px;
  font-size: 12px;
  color: rgba(30, 41, 59, 0.5);
  letter-spacing: 1px;
}

/* ===== 入场动画 ===== */
.status-card {
  animation:
    cardIn 0.7s cubic-bezier(0.2, 0.8, 0.2, 1),
    cardFloat 6s ease-in-out 0.7s infinite;
}
@keyframes cardIn {
  from { opacity: 0; transform: translateY(24px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0)    scale(1); }
}

@media (max-width: 520px) {
  .status-card { padding: 36px 22px 28px; }
  .status-illu { width: 132px; height: 132px; }
  .illu-icon   { font-size: 54px; }
  .illu-code   { font-size: 26px; }
  .status-title { font-size: 22px; }
}
</style>