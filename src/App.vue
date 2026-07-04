<template>
  <div class="auth-page">
    <!-- 背景层 -->
    <AuthBackground />

    <!-- 动态粒子背景（保留原有能力） -->
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

// 模拟登录/注册请求，可在此替换为真实 API
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
    // 注册成功 -> 自动切回登录
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
/* 页面容器与布局 */
.auth-page {
  position: relative;
  width: 100%;
  min-height: 100vh;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0f1024;
}

.auth-main {
  position: relative;
  z-index: 2;
  width: min(1180px, 92vw);
  min-height: 640px;
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  gap: 32px;
  align-items: center;
}

@media (max-width: 960px) {
  .auth-main {
    grid-template-columns: 1fr;
    gap: 16px;
    padding: 32px 0;
  }
}
</style>
