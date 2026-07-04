<template>
  <section class="form-area">
    <div class="card-wrap">
      <span class="card-glow" />

      <div class="card">
        <header class="card-head">
          <h2>{{ isLogin ? '欢迎回来 👋' : '加入我们 🚀' }}</h2>
          <p>{{ isLogin ? '请登录以继续访问您的工作台' : '创建账号，开启全新协作之旅' }}</p>
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
    </div>
  </section>

  <!-- 成功弹窗 -->
  <el-dialog
    :model-value="successVisible"
    width="380px"
    :show-close="false"
    center
    class="success-dialog"
    @update:model-value="(v) => $emit('update:successVisible', v)"
  >
    <div class="success-box">
      <div class="check-circle">
        <el-icon :size="38" color="#fff"><Check /></el-icon>
      </div>
      <h3>{{ successTitle }}</h3>
      <p>{{ successMsg }}</p>
      <el-button class="ok-btn" size="large" @click="$emit('update:successVisible', false)">知道了</el-button>
    </div>
  </el-dialog>
</template>

<script setup>
import { computed } from 'vue'
import LoginForm from './LoginForm.vue'
import RegisterForm from './RegisterForm.vue'
import { Check } from '@element-plus/icons-vue'

const props = defineProps({
  // 当前是否为登录态（true=登录 / false=注册），支持 v-model
  modelValue:      { type: Boolean, default: true },
  loginLoading:    { type: Boolean, default: false },
  registerLoading: { type: Boolean, default: false },

  // 成功弹窗控制
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

// 子表单触发 switch('login' | 'register') -> 转为布尔 v-model
function onSwitch(target) {
  emit('update:modelValue', target === 'login')
}
</script>

<style scoped>
.form-area { display: flex; justify-content: center; }

.card-wrap {
  position: relative;
  width: 100%;
  max-width: 460px;
  animation: cardFloat 6s ease-in-out infinite;
}
@keyframes cardFloat {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-6px); }
}

.card-glow {
  position: absolute;
  inset: -2px;
  border-radius: 22px;
  background: conic-gradient(
    from 0deg,
    #8ec5fc, #e0c3fc, #fbc2eb, #84fab0, #8ec5fc
  );
  filter: blur(14px);
  opacity: 0.55;
  animation: rotateGlow 8s linear infinite;
  z-index: -1;
}
@keyframes rotateGlow {
  to { transform: rotate(360deg); }
}

.card {
  position: relative;
  background: rgba(20, 22, 50, 0.55);
  backdrop-filter: blur(22px) saturate(140%);
  -webkit-backdrop-filter: blur(22px) saturate(140%);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 20px;
  padding: 32px 32px 28px;
  box-shadow:
    0 30px 60px rgba(0, 0, 0, 0.45),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);
  color: #fff;
}

.card-head h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}
.card-head p {
  margin: 6px 0 22px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 13px;
}

/* Tab */
.tab-switch {
  position: relative;
  display: grid;
  grid-template-columns: 1fr 1fr;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 4px;
  margin-bottom: 22px;
}
.tab-switch .slider {
  position: absolute;
  top: 4px;
  bottom: 4px;
  left: 4px;
  width: calc(50% - 4px);
  background: linear-gradient(120deg, #6a7bff 0%, #a18cd1 100%);
  border-radius: 10px;
  box-shadow: 0 6px 18px rgba(106, 123, 255, 0.45);
  transition: transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
}
.tab-switch .slider.right { transform: translateX(100%); }
.tab-switch .tab-btn {
  position: relative;
  z-index: 1;
  padding: 10px 0;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.65);
  font-size: 14px;
  letter-spacing: 4px;
  cursor: pointer;
  transition: color 0.3s;
}
.tab-switch .tab-btn.active { color: #fff; font-weight: 600; }

/* 表单舞台 */
.form-stage { min-height: 360px; }

/* 切换动画 */
.swap-enter-active,
.swap-leave-active {
  transition: opacity 0.4s ease, transform 0.4s ease;
}
.swap-enter-from {
  opacity: 0;
  transform: translateX(28px) scale(0.97);
}
.swap-leave-to {
  opacity: 0;
  transform: translateX(-28px) scale(0.97);
}
.swap-enter-to,
.swap-leave-from {
  opacity: 1;
  transform: translateX(0) scale(1);
}

/* 成功弹窗 */
:deep(.success-dialog) { border-radius: 18px; overflow: hidden; }
:deep(.success-dialog .el-dialog__header) { display: none; }
:deep(.success-dialog .el-dialog__body) { padding: 32px 24px 24px; }

.success-box { text-align: center; color: #333; }
.check-circle {
  width: 64px; height: 64px; border-radius: 50%;
  display: grid; place-items: center;
  margin: 0 auto 16px;
  background: linear-gradient(135deg, #84fab0, #6a7bff);
  box-shadow: 0 10px 22px rgba(106, 123, 255, 0.4);
  animation: pop 0.45s cubic-bezier(0.2, 0.8, 0.2, 1.4);
}
@keyframes pop {
  0%   { transform: scale(0.4); opacity: 0; }
  100% { transform: scale(1);   opacity: 1; }
}
.success-box h3 { margin: 0 0 6px; font-size: 18px; }
.success-box p  { margin: 0 0 22px; color: #666; font-size: 13px; }
.ok-btn {
  width: 100%;
  border-radius: 10px !important;
  background: linear-gradient(120deg, #6a7bff, #a18cd1) !important;
  border: none !important;
  color: #fff !important;
}
</style>
