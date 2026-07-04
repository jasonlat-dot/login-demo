<template>
  <div class="auth-page">
    <!-- 背景层 -->
    <AuthBackground />

    <!-- 极简粒子背景（低密度、慢动、少连线） -->
    <ParticleBackground />

    <!-- 主体左右分栏 -->
    <main class="auth-main">
      <AuthBrand />

      <AuthFormCard
        v-model="isLogin"
        v-model:success-visible="successVisible"
        :login-loading="loginLoading"
        :register-loading="registerLoading"
        :success-title="successTitle"
        :success-msg="successMsg"
        @login="onLogin"
        @register="onRegister"
        @forgot="handleForgot"
      />
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

import AuthBackground from './components/auth/AuthBackground.vue'
import AuthBrand      from './components/auth/AuthBrand.vue'
import AuthFormCard   from './components/auth/AuthFormCard.vue'
import ParticleBackground from './components/ParticleBackground.vue'

/* ===== 业务状态 ===== */
const isLogin          = ref(true)
const loginLoading     = ref(false)
const registerLoading  = ref(false)

const successVisible   = ref(false)
const successTitle     = ref('')
const successMsg       = ref('')

/* ===== 业务行为 ===== */
function mockRequest() {
  return new Promise(r => setTimeout(r, 900))
}

async function onLogin(payload) {
  loginLoading.value = true
  try {
    await mockRequest()
    successTitle.value = '登录成功'
    successMsg.value   = `欢迎回来，${payload.username}！即将进入工作台…`
    successVisible.value = true
  } finally {
    loginLoading.value = false
  }
}

async function onRegister(payload) {
  registerLoading.value = true
  try {
    await mockRequest()
    successTitle.value = '注册成功'
    successMsg.value   = `账号 ${payload.username} 已创建，请前往登录～`
    successVisible.value = true
    isLogin.value = true
  } finally {
    registerLoading.value = false
  }
}

function handleForgot() {
  ElMessage.warning('请联系管理员或前往找回密码页面～')
}
</script>

<style scoped>
/* ===== 设计令牌：深色商务 SaaS 风格 ===== */
.auth-page {
  /* 色板 —— 深商务藏青 + 低饱和蓝紫强调 */
  --color-bg:          #0F172A;
  --color-bg-2:        #0B1224;

  /* 卡片表面：需求指定 rgba(30, 41, 59, 0.85) */
  --color-surface:     rgba(30, 41, 59, 0.85);
  --color-surface-2:   rgba(15, 23, 42, 0.6);

  --color-border:      rgba(148, 163, 184, 0.14);
  --border-soft:       rgba(148, 163, 184, 0.08);
  --color-border-strong:rgba(148, 163, 184, 0.24);

  --color-text:        #E2E8F0;          /* 主文字：纯白偏冷 */
  --color-text-muted:  #94A3B8;          /* 次要文字：浅灰蓝 */
  --color-text-dim:    #64748B;          /* 辅助文字：淡灰 */

  /* 提交按钮渐变：低饱和蓝 → 蓝紫（克制商务） */
  --color-accent:        #3B82F6;
  --color-accent-2:      #6366F1;
  --color-accent-hover:  #2563EB;
  --color-accent-soft:   rgba(59, 130, 246, 0.15);

  --color-danger:      #F87171;          /* 柔和浅红 */
  --color-success:     #6EE7B7;          /* 淡绿 */

  /* 统一圆角（克制，4/8/12 三档） */
  --r-sm: 4px;
  --r-md: 8px;
  --r-lg: 12px;

  /* 栅格基准 4px */
  --s-1: 4px;
  --s-2: 8px;
  --s-3: 12px;
  --s-4: 16px;
  --s-5: 20px;
  --s-6: 24px;
  --s-8: 32px;
  --s-10: 40px;
  --s-12: 48px;
  --s-16: 64px;

  /* 阴影：写实分层投影，厚重感收敛 */
  --shadow-card:
    0 1px 0 rgba(255, 255, 255, 0.04) inset,
    0 12px 32px rgba(0, 0, 0, 0.40),
    0 2px 6px rgba(0, 0, 0, 0.20);
  --shadow-card-hover:
    0 1px 0 rgba(255, 255, 255, 0.05) inset,
    0 18px 40px rgba(0, 0, 0, 0.48),
    0 4px 10px rgba(0, 0, 0, 0.24);

  position: relative;
  width: 100%;
  min-height: 100vh;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg);
  color: var(--color-text);
  font-size: 14px;
  line-height: 1.5;
}

.auth-main {
  position: relative;
  z-index: 2;
  width: min(1120px, 92vw);
  min-height: 600px;
  display: grid;
  grid-template-columns: 1.05fr 1fr;
  gap: var(--s-16); /* 64px —— 栅格统一间距 */
  align-items: center;
  padding: var(--s-8) 0;
}

@media (max-width: 960px) {
  .auth-main {
    grid-template-columns: 1fr;
    gap: var(--s-8);
    padding: var(--s-8) 0;
  }
}
</style>