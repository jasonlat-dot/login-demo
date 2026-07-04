<template>
  <!-- ====== DEBUG START ====== 调试状态页预览 - 正式开发时删除 DEBUG 标记之间的全部内容即可 ====== -->
  <div v-if="debugActive && debugComponent" class="status-debug-page">
    <component :is="debugComponent" v-bind="debugProps" />
  </div>
  <!-- ====== DEBUG END ====== -->

  <div v-show="!debugActive || !debugComponent" class="auth-page">
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

  <!-- ====== DEBUG START ====== 浮动调试面板,正式开发时删除 -->
  <transition name="debug-fade">
    <div v-if="showDebugPanel" class="debug-floating">
      <div class="debug-header">
        <span class="debug-title">🐞 状态页调试</span>
        <div class="debug-header-actions">
          <button class="debug-mini" type="button" :title="debugPanelCollapsed ? '展开' : '收起'" @click="debugPanelCollapsed = !debugPanelCollapsed">
            {{ debugPanelCollapsed ? '▴' : '▾' }}
          </button>
          <button class="debug-mini" type="button" title="关闭面板(仅隐藏,#debug-on 可恢复)" @click="showDebugPanel = false">×</button>
        </div>
      </div>

      <div v-show="!debugPanelCollapsed" class="debug-body">
        <div class="debug-hint">
          当前路径:<code>{{ currentHash || '/' }}</code>
        </div>

        <div class="debug-grid">
          <button
            v-for="p in statusPages"
            :key="p.path"
            type="button"
            class="debug-chip"
            :class="{ active: currentHash === p.path }"
            @click="goStatus(p.path)"
          >
            <span class="chip-icon">{{ p.icon }}</span>
            <span class="chip-label">{{ p.label }}</span>
          </button>
        </div>

        <div class="debug-actions">
          <button type="button" class="debug-link" @click="goStatus('')">↩ 回登录页</button>
        </div>

        <details class="debug-tips">
          <summary>使用方式</summary>
          <ul>
            <li>地址栏直接访问:<code>#/404</code> / <code>#/403</code> / <code>#/500</code> / <code>#/network</code> / <code>#/maintenance</code> / <code>#/empty</code> / <code>#/session</code></li>
            <li>也可点击上方胶囊按钮一键跳转</li>
            <li>正式开发:删除 <code>DEBUG START</code> 与 <code>DEBUG END</code> 之间的全部内容即可</li>
          </ul>
        </details>
      </div>
    </div>
  </transition>

  <!-- 关闭面板后,留一个常驻小齿轮方便恢复 -->
  <button
    v-if="!showDebugPanel && debugActive"
    type="button"
    class="debug-reopen"
    title="打开状态页调试面板"
    @click="showDebugPanel = true"
  >🐞</button>

  <!-- 完全关闭调试的总开关:点击后什么都不显示,刷新页面或访问 ?debug=1 恢复 -->
  <div v-if="debugActive" class="debug-corner">
    <button type="button" class="debug-toggle" :title="debugEnabled ? '关闭调试(整个 Debug 模块隐藏)' : '开启调试'" @click="toggleDebug">
      {{ debugEnabled ? '调试:开' : '调试:关' }}
    </button>
  </div>
  <!-- ====== DEBUG END ====== -->
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, shallowRef } from 'vue'
import { ElMessage } from 'element-plus'

import AuthBackground from './components/auth/AuthBackground.vue'
import AuthBrand      from './components/auth/AuthBrand.vue'
import AuthFormCard   from './components/auth/AuthFormCard.vue'
import AnimatedCharacters from './components/auth/AnimatedCharacters.vue'
import ParticleBackground from './components/ParticleBackground.vue'

/* DEBUG START — 状态页调试预览 - 正式开发时删除 DEBUG START 与 DEBUG END 之间的全部代码即可 */
import NotFoundPage       from './components/status/NotFoundPage.vue'
import ForbiddenPage      from './components/status/ForbiddenPage.vue'
import ServerErrorPage    from './components/status/ServerErrorPage.vue'
import NetworkErrorPage   from './components/status/NetworkErrorPage.vue'
import MaintenancePage    from './components/status/MaintenancePage.vue'
import EmptyPage          from './components/status/EmptyPage.vue'
import SessionExpiredPage from './components/status/SessionExpiredPage.vue'
/* DEBUG END */

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

/* DEBUG START — 调试逻辑:hash 路由 + 浮动面板 */

/* 调试开关:默认开启,localStorage / URL 参数可覆盖 */
const urlParams = new URLSearchParams(window.location.search)
const DEBUG_STORAGE_KEY = '__loginDemoDebug__'

const debugEnabled = ref(true)
const urlDebug = urlParams.get('debug')
if (urlDebug === '1' || urlDebug === '0') {
  debugEnabled.value = urlDebug === '1'
  localStorage.setItem(DEBUG_STORAGE_KEY, urlDebug)
} else {
  const stored = localStorage.getItem(DEBUG_STORAGE_KEY)
  if (stored === '1' || stored === '0') debugEnabled.value = stored === '1'
}

const debugActive = computed(() => debugEnabled.value)

// 状态页注册表 - 新增页面只需在这里加一行
const statusPages = [
  { path: '/404',         label: '404 走丢',   icon: '🔍', comp: NotFoundPage },
  { path: '/403',         label: '403 无权限', icon: '🛡️', comp: ForbiddenPage },
  { path: '/500',         label: '500 服务器', icon: '💥', comp: ServerErrorPage },
  { path: '/network',     label: '网络异常',   icon: '📡', comp: NetworkErrorPage },
  { path: '/maintenance', label: '维护中',     icon: '🛠️', comp: MaintenancePage },
  { path: '/empty',       label: '空数据',     icon: '📭', comp: EmptyPage },
  { path: '/session',     label: '登录过期',   icon: '🔐', comp: SessionExpiredPage },
]

const currentHash = ref(window.location.hash.replace(/^#/, '') || '')

const debugComponent = shallowRef(null)
const debugProps = ref({})

function parseHash() {
  return window.location.hash.replace(/^#/, '')
}

function syncDebugFromHash() {
  const h = parseHash()
  currentHash.value = h
  const match = statusPages.find(p => p.path === h)
  if (match) {
    debugComponent.value = match.comp
    // 给每个组件传入示例 props,便于看到完整效果
    if (h === '/500')              debugProps.value = { traceId: 'ERR-20260704-8A3F1', retryAfter: 0 }
    else if (h === '/maintenance') debugProps.value = { endTime: Date.now() + 3600_000, announce: '' }
    else if (h === '/session')     debugProps.value = { remainSeconds: 90, redirect: '/' }
    else if (h === '/network')     debugProps.value = { lastError: 'net::ERR_CONNECTION_REFUSED' }
    else if (h === '/403')         debugProps.value = { role: 'guest' }
    else                           debugProps.value = {}
  } else {
    debugComponent.value = null
  }
}

function goStatus(path) {
  // 关键修复:点击调试入口时,如果总开关是关的,自动打开,避免点击无效果
  if (!debugEnabled.value) {
    debugEnabled.value = true
    localStorage.setItem(DEBUG_STORAGE_KEY, '1')
  }
  if (path) {
    window.location.hash = path
  } else {
    // 回登录页:清掉 hash 即可,hashchange 会触发 sync
    history.replaceState(null, '', window.location.pathname + window.location.search)
    currentHash.value = ''
    debugComponent.value = null
  }
}

const onHashChange = () => syncDebugFromHash()

const showDebugPanel      = ref(true)
const debugPanelCollapsed = ref(false)

function toggleDebug() {
  debugEnabled.value = !debugEnabled.value
  localStorage.setItem(DEBUG_STORAGE_KEY, debugEnabled.value ? '1' : '0')
  if (!debugEnabled.value) {
    // 关闭调试:清掉 hash,避免下次开启直接落到状态页
    history.replaceState(null, '', window.location.pathname + window.location.search)
    currentHash.value = ''
    debugComponent.value = null
  }
}

onMounted(() => {
  window.addEventListener('hashchange', onHashChange)
  syncDebugFromHash()
})
onBeforeUnmount(() => {
  window.removeEventListener('hashchange', onHashChange)
})
/* DEBUG END */
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

/* ============================================================
 *  DEBUG START — 调试面板样式,正式开发时一并删除
 * ============================================================ */
.status-debug-page {
  position: relative;
  z-index: 1;
  min-height: 100vh;
}

/* 浮动调试面板 */
.debug-floating {
  position: fixed;
  right: 18px;
  bottom: 18px;
  z-index: 9999;
  width: 320px;
  max-width: calc(100vw - 24px);
  background: rgba(20, 22, 50, 0.88);
  backdrop-filter: blur(18px) saturate(140%);
  -webkit-backdrop-filter: blur(18px) saturate(140%);
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 14px;
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.55);
  color: #fff;
  font-size: 13px;
  overflow: hidden;
  user-select: none;
}
.debug-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  background: linear-gradient(120deg, rgba(106, 123, 255, 0.25), rgba(246, 114, 202, 0.25));
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}
.debug-title { font-weight: 600; letter-spacing: 1px; }
.debug-header-actions { display: flex; gap: 6px; }
.debug-mini {
  width: 24px; height: 24px;
  display: grid; place-items: center;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 6px;
  color: #fff;
  font-size: 12px;
  cursor: pointer;
  transition: background 0.2s;
}
.debug-mini:hover { background: rgba(255, 255, 255, 0.18); }

.debug-body { padding: 12px 14px 14px; }
.debug-hint {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 10px;
}
.debug-hint code {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  color: #b8c6ff;
  background: rgba(255, 255, 255, 0.08);
  padding: 1px 6px;
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.14);
}

.debug-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}
.debug-chip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 10px;
  color: #fff;
  cursor: pointer;
  font-size: 12px;
  letter-spacing: 0.5px;
  transition: background 0.2s, border-color 0.2s, transform 0.15s;
}
.debug-chip:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.32);
  transform: translateY(-1px);
}
.debug-chip.active {
  background: linear-gradient(120deg, rgba(106, 123, 255, 0.45), rgba(246, 114, 202, 0.45));
  border-color: rgba(255, 255, 255, 0.5);
  box-shadow: 0 6px 14px rgba(122, 110, 255, 0.4);
}
.chip-icon { font-size: 16px; }
.chip-label { white-space: nowrap; }

.debug-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
}
.debug-link {
  background: none;
  border: none;
  color: #b8c6ff;
  font-size: 12px;
  cursor: pointer;
  padding: 4px 6px;
}
.debug-link:hover { color: #fff; text-decoration: underline; }

.debug-tips {
  margin-top: 10px;
  padding-top: 8px;
  border-top: 1px dashed rgba(255, 255, 255, 0.14);
  font-size: 12px;
  color: rgba(255, 255, 255, 0.72);
}
.debug-tips summary {
  cursor: pointer;
  user-select: none;
  outline: none;
}
.debug-tips ul { margin: 6px 0 0; padding-left: 18px; }
.debug-tips li { margin: 2px 0; }
.debug-tips code {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  color: #b8c6ff;
  background: rgba(255, 255, 255, 0.08);
  padding: 0 4px;
  border-radius: 3px;
}

/* 关闭后的小齿轮 */
.debug-reopen {
  position: fixed;
  right: 18px;
  bottom: 18px;
  z-index: 9999;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: rgba(20, 22, 50, 0.85);
  color: #fff;
  font-size: 18px;
  cursor: pointer;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.45);
  transition: transform 0.2s;
}
.debug-reopen:hover { transform: scale(1.08); }

/* 角落总开关 */
.debug-corner {
  position: fixed;
  left: 18px;
  bottom: 18px;
  z-index: 9999;
}
.debug-toggle {
  padding: 6px 12px;
  background: rgba(20, 22, 50, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 8px;
  color: #fff;
  font-size: 12px;
  cursor: pointer;
  letter-spacing: 1px;
  transition: background 0.2s;
}
.debug-toggle:hover { background: rgba(20, 22, 50, 0.95); }

.debug-fade-enter-active, .debug-fade-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}
.debug-fade-enter-from, .debug-fade-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

/* DEBUG END ================================================================ */
</style>
