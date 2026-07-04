<template>
  <!-- 调试模块:状态页预览。开启时占满整个 viewport,关闭时不渲染 -->
  <DebugLayer />

  <div v-show="!debugActive || !debugComponent" class="auth-page theme-light">
    <!-- 背景层 -->
    <AuthBackground />

    <!-- 动态粒子背景（保留原有能力） -->
    <ParticleBackground />

    <!-- 主体左右分栏 -->
    <main class="auth-main">
      <AuthBrand>
        <template #characters>
          <AnimatedCharacters
            :typing-username="formCardRef?.scene?.typingUsername ?? false"
            :typing-password="formCardRef?.scene?.typingPassword ?? false"
            :show-password="formCardRef?.scene?.showPassword ?? false"
            :password-length="formCardRef?.scene?.passwordLength ?? 0"
            :login-error="formCardRef?.scene?.loginError ?? false"
            :error-key="formCardRef?.scene?.errorKey ?? 0"
          />
        </template>
      </AuthBrand>

      <AuthFormCard
        ref="formCardRef"
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

  <!-- 调试模块 UI:浮动面板 + 总开关 + 小齿轮 -->
  <DebugPanel />
  <DebugCorner />
  <DebugReopen />
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

import AuthBackground from './components/auth/AuthBackground.vue'
import AuthBrand      from './components/auth/AuthBrand.vue'
import AuthFormCard   from './components/auth/AuthFormCard.vue'
import AnimatedCharacters from './components/auth/AnimatedCharacters.vue'
import ParticleBackground from './components/ParticleBackground.vue'

import {
  DebugLayer,
  DebugPanel,
  DebugCorner,
  DebugReopen,
  useDebug,
} from './debug'

/* ===== 业务状态 ===== */
const isLogin          = ref(true)
const loginLoading     = ref(false)
const registerLoading  = ref(false)

const successVisible   = ref(false)
const successTitle     = ref('')
const successMsg       = ref('')

/* 表单卡片引用 - 用于访问其内部 scene 状态 */
const formCardRef      = ref(null)

/* ===== 业务行为 ===== */

// 模拟登录/注册请求，可在此替换为真实 API
function mockRequest() {
  return new Promise(r => setTimeout(r, 900))
}

async function onLogin(payload) {
  loginLoading.value = true
  try {
    // 客户端校验：为空或密码过短 -> 角色沮丧摇头
    if (!payload.username || !payload.password) {
      triggerLoginError()
      ElMessage.error('请输入账号和密码')
      return
    }
    if (payload.password.length < 6) {
      triggerLoginError()
      ElMessage.error('密码长度不能少于 6 位')
      return
    }

    await mockRequest()

    // 真实接入时可改为失败分支触发 triggerLoginError()
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

/* 触发角色沮丧摇头 (2.5s 自动恢复) */
function triggerLoginError() {
  const sc = formCardRef.value?.scene
  if (!sc) return
  sc.loginError = true
  sc.errorKey += 1
  setTimeout(() => {
    sc.loginError = false
  }, 2500)
}

defineExpose({ triggerLoginError })

/* ===== 调试模块共享状态(从 useDebug 拿,模板里用到的两个字段) ===== */
const { debugActive, debugComponent } = useDebug()
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
  background: var(--bg-base);
}

/* 浅色主题下的整体页面背景 - 在 .theme-light 上叠加柔和渐变 */
.theme-light.auth-page {
  background:
    radial-gradient(1200px 800px at 8% 10%, rgba(186, 230, 253, 0.55) 0%, transparent 60%),
    radial-gradient(1000px 700px at 92% 90%, rgba(254, 215, 170, 0.55) 0%, transparent 60%),
    radial-gradient(900px 600px at 55% 50%, rgba(187, 247, 208, 0.45) 0%, transparent 70%),
    linear-gradient(135deg, #fffaf0 0%, #f0f9ff 50%, #fef3e8 100%);
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