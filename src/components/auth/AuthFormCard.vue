<template>
  <section class="form-area">
    <div class="card">
      <header class="card-head">
        <h2 class="card-title">{{ isLogin ? '欢迎回来' : '创建账号' }}</h2>
        <p class="card-sub">{{ isLogin ? '请登录以继续访问工作台' : '填写以下信息加入我们' }}</p>
      </header>

      <!-- Tab 切换 -->
      <div class="tab-switch">
        <span class="slider" :class="{ right: !isLogin }" />
        <button
          :class="['tab-btn', { active: isLogin }]"
          type="button"
          @click="$emit('update:modelValue', true)"
        >登 录</button>
        <button
          :class="['tab-btn', { active: !isLogin }]"
          type="button"
          @click="$emit('update:modelValue', false)"
        >注 册</button>
      </div>

      <!-- 表单舞台 -->
      <div class="form-stage">
        <transition name="swap" mode="out-in">
          <LoginForm
            v-if="isLogin"
            key="login"
            :loading="loginLoading"
            @submit="(payload) => $emit('login', payload)"
            @switch="onSwitch"
            @forgot="$emit('forgot')"
          />
          <RegisterForm
            v-else
            key="register"
            :loading="registerLoading"
            @submit="(payload) => $emit('register', payload)"
            @switch="onSwitch"
          />
        </transition>
      </div>
    </div>
  </section>

  <!-- 成功弹窗 -->
  <el-dialog
    :model-value="successVisible"
    width="360px"
    :show-close="false"
    center
    class="success-dialog"
    @update:model-value="(v) => $emit('update:successVisible', v)"
  >
    <div class="success-box">
      <div class="check-circle">
        <el-icon :size="22" color="#fff"><Check /></el-icon>
      </div>
      <h3>{{ successTitle }}</h3>
      <p>{{ successMsg }}</p>
      <el-button class="ok-btn" size="default" @click="$emit('update:successVisible', false)">知道了</el-button>
    </div>
  </el-dialog>
</template>

<script setup>
import { computed } from 'vue'
import LoginForm from './LoginForm.vue'
import RegisterForm from './RegisterForm.vue'
import { Check } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue:      { type: Boolean, default: true },
  loginLoading:    { type: Boolean, default: false },
  registerLoading: { type: Boolean, default: false },
  successVisible:  { type: Boolean, default: false },
  successTitle:    { type: String,  default: '' },
  successMsg:      { type: String,  default: '' },
})

const emit = defineEmits([
  'update:modelValue',
  'update:successVisible',
  'login',
  'register',
  'forgot',
])

const isLogin = computed(() => props.modelValue)

function onSwitch(target) {
  emit('update:modelValue', target === 'login')
}
</script>

<style scoped>
.form-area { display: flex; justify-content: center; }

/* ===== 卡片：半透暗色 + 毛玻璃 + hover 轻微上浮 ===== */
.card {
  width: 100%;
  max-width: 420px;
  background: var(--color-surface);
  /* 毛玻璃模糊度降低，质感克制 */
  backdrop-filter: blur(14px) saturate(120%);
  -webkit-backdrop-filter: blur(14px) saturate(120%);
  border: 1px solid var(--color-border);
  border-radius: var(--r-lg);
  padding: 36px 32px 32px;
  box-shadow: var(--shadow-card);
  color: var(--color-text);
  transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
  will-change: transform;
}

/* 卡片 hover：仅轻微平缓上浮，阴影舒展 */
.card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-card-hover);
  border-color: var(--color-border-strong);
}

/* ===== 标题层级 ===== */
.card-head { margin-bottom: 4px; }
.card-title {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  letter-spacing: 0;
  color: var(--color-text);
}
.card-sub {
  margin: 8px 0 24px;
  color: var(--color-text-muted);
  font-size: 13px;
}

/* ===== Tab：底部 2px 实线指示器，克制商务 ===== */
.tab-switch {
  position: relative;
  display: grid;
  grid-template-columns: 1fr 1fr;
  margin-bottom: 24px;
  border-bottom: 1px solid var(--color-border);
}
.tab-switch .tab-btn {
  position: relative;
  z-index: 1;
  padding: 10px 0;
  background: transparent;
  border: none;
  color: var(--color-text-muted);
  font-size: 14px;
  letter-spacing: 2px;
  cursor: pointer;
  transition: color 0.15s ease;
}
.tab-switch .tab-btn.active {
  color: var(--color-text);
  font-weight: 600;
}
.tab-switch .slider {
  position: absolute;
  left: 0;
  bottom: -1px;
  width: 50%;
  height: 2px;
  background: var(--color-accent);
  transition: transform 0.25s ease;
}
.tab-switch .slider.right { transform: translateX(100%); }

/* ===== 表单舞台 ===== */
.form-stage { min-height: 360px; }

/* ===== 切换动画：平缓淡入 + 小幅横向位移 + 极轻微缩放 ===== */
.swap-enter-active,
.swap-leave-active {
  transition:
    opacity 0.28s ease,
    transform 0.28s ease;
}
.swap-enter-from {
  opacity: 0;
  transform: translateX(12px) scale(0.985);
}
.swap-leave-to {
  opacity: 0;
  transform: translateX(-12px) scale(0.985);
}
.swap-enter-to,
.swap-leave-from {
  opacity: 1;
  transform: translateX(0) scale(1);
}

/* ===== 成功弹窗：极简，柔和色 ===== */
:deep(.success-dialog) {
  border-radius: var(--r-lg);
  overflow: hidden;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
}
:deep(.success-dialog .el-dialog__header) { display: none; }
:deep(.success-dialog .el-dialog__body) { padding: 28px 24px; }

.success-box { text-align: center; color: var(--color-text); }
.check-circle {
  width: 44px; height: 44px; border-radius: 50%;
  display: grid; place-items: center;
  margin: 0 auto 16px;
  background: var(--color-success);
}
.success-box h3 { margin: 0 0 6px; font-size: 16px; font-weight: 600; }
.success-box p  { margin: 0 0 20px; color: var(--color-text-muted); font-size: 13px; }
.ok-btn {
  width: 100%;
  border-radius: var(--r-md) !important;
  background: var(--color-accent) !important;
  border: none !important;
  color: #fff !important;
}
.ok-btn:hover { background: var(--color-accent-hover) !important; }
</style>