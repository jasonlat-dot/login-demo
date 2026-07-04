<template>
  <el-form
    ref="formRef"
    :model="form"
    :rules="rules"
    class="auth-form"
    hide-required-asterisk
    @submit.prevent
  >
    <el-form-item prop="username" class="stagger" style="--i:0">
      <el-input
        v-model="form.username"
        placeholder="请输入账号"
        size="large"
        :prefix-icon="User"
        clearable
        @focus="onUsernameFocus"
        @blur="onUsernameBlur"
        @input="clearFieldErr('username')"
      />
    </el-form-item>

    <el-form-item prop="password" class="stagger" style="--i:1">
      <el-input
        v-model="form.password"
        placeholder="请输入密码"
        size="large"
        :prefix-icon="Lock"
        :type="showPwd ? 'text' : 'password'"
        @focus="onPasswordFocus"
        @blur="onPasswordBlur"
        @input="onPasswordInput"
      >
        <template #suffix>
          <span class="eye" @click="toggleShowPwd">
            <el-icon><component :is="showPwd ? View : Hide" /></el-icon>
          </span>
        </template>
      </el-input>
    </el-form-item>

    <div class="form-row stagger" style="--i:2">
      <el-checkbox v-model="form.remember">记住我</el-checkbox>
      <a class="link" @click="$emit('forgot')">忘记密码？</a>
    </div>

    <el-form-item class="stagger" style="--i:3">
      <el-button
        class="submit-btn"
        size="large"
        :loading="loading"
        @click="handleSubmit"
      >{{ loading ? '登录中…' : '登 录' }}</el-button>
    </el-form-item>

    <div class="alt-tip stagger" style="--i:4">
      还没有账号？<a class="link" @click="$emit('switch', 'register')">立即注册</a>
    </div>
  </el-form>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { User, Lock, View, Hide } from '@element-plus/icons-vue'

const props = defineProps({
  loading: { type: Boolean, default: false },
})
const emit = defineEmits(['submit', 'switch', 'forgot', 'scene'])

const formRef = ref(null)
const showPwd = ref(false)

const form = reactive({
  username: '',
  password: '',
  remember: true,
})

const rules = {
  username: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
}

/* 派发给父组件的角色动画场景状态 */
function emitScene(extra = {}) {
  emit('scene', {
    typingUsername: usernameFocused.value,
    typingPassword: passwordFocused.value,
    showPassword:    showPwd.value,
    passwordLength:  form.password.length,
    ...extra,
  })
}

const usernameFocused = ref(false)
const passwordFocused = ref(false)

function onUsernameFocus() {
  usernameFocused.value = true
  triggerValidate('username')
  emitScene()
}
function onUsernameBlur() {
  usernameFocused.value = false
  triggerValidate('username')
  emitScene()
}
function onPasswordFocus() {
  passwordFocused.value = true
  triggerValidate('password')
  emitScene()
}
function onPasswordBlur() {
  passwordFocused.value = false
  triggerValidate('password')
  emitScene()
}
function onPasswordInput() {
  clearFieldErr('password')
  emitScene()
}
function toggleShowPwd() {
  showPwd.value = !showPwd.value
  emitScene()
}

function triggerValidate(field) {
  formRef.value?.validateField(field)
}
function clearFieldErr(field) {
  formRef.value?.clearValidate([field])
}

function focusFirstError() {
  const errEl = document.querySelector('.auth-form .el-form-item.is-error input')
  if (errEl) errEl.focus()
}

async function handleSubmit() {
  try {
    await formRef.value.validate()
  } catch {
    focusFirstError()
    return
  }
  // 子组件只负责表单与事件，业务交由父级
  emit('submit', { ...form })
}

/* 暴露给父级 - 用于外部(如 App)主动聚焦输入等场景 */
defineExpose({
  focusUsername: () => {
    const el = formRef.value?.$el?.querySelector('input')
    el?.focus()
  },
})
</script>

<style scoped>
.auth-form { display: flex; flex-direction: column; }

.stagger {
  opacity: 0;
  transform: translateY(10px);
  animation: fadeUp 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
  animation-delay: calc(var(--i) * 60ms + 80ms);
}
@keyframes fadeUp {
  to { opacity: 1; transform: translateY(0); }
}

.form-row {
  display: flex; align-items: center; justify-content: space-between;
  margin: 4px 0 18px;
  font-size: 13px;
}

.alt-tip {
  text-align: center;
  font-size: 13px;
  color: rgba(30, 41, 59, 0.65);
  margin-top: 8px;
}

.eye {
  display: inline-flex; align-items: center;
  padding: 6px;
  cursor: pointer;
  color: rgba(30, 41, 59, 0.55);
  transition: color 0.2s;
}
.eye:hover { color: #4338ca; }

.link {
  color: #6366f1;
  cursor: pointer;
  transition: color 0.2s;
}
.link:hover { color: #4338ca; text-decoration: underline; }

:deep(.el-input__wrapper) {
  background: rgba(255, 255, 255, 0.85) !important;
  border-radius: 10px !important;
  box-shadow: 0 0 0 1px rgba(165, 180, 252, 0.5) inset !important;
  transition: all 0.3s ease !important;
  padding: 4px 12px !important;
}
:deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px rgba(165, 180, 252, 0.85) inset !important;
}
:deep(.el-input__wrapper.is-focus) {
  box-shadow:
    0 0 0 1px #6366f1 inset,
    0 0 0 4px rgba(99, 102, 241, 0.16),
    0 0 18px rgba(99, 102, 241, 0.25) !important;
  background: rgba(255, 255, 255, 0.95) !important;
}
:deep(.el-input__inner) {
  color: #1e1b4b !important;
  height: 42px;
  font-size: 14px;
}
:deep(.el-input__inner::placeholder) { color: rgba(30, 41, 59, 0.42); }
:deep(.el-input__prefix .el-icon),
:deep(.el-input__suffix .el-icon) { color: rgba(30, 41, 59, 0.55); }

:deep(.el-form-item__error) {
  color: #ef4444 !important;
  font-size: 12px;
  padding-top: 2px;
}

:deep(.el-checkbox__label) { color: rgba(30, 41, 59, 0.78); }
:deep(.el-checkbox__inner) {
  background: rgba(255, 255, 255, 0.9) !important;
  border-color: rgba(99, 102, 241, 0.5) !important;
}
:deep(.el-checkbox.is-checked .el-checkbox__inner) {
  background: linear-gradient(120deg, #6366f1, #a855f7) !important;
  border-color: transparent !important;
}

:deep(.submit-btn) {
  width: 100%;
  border-radius: 12px !important;
  border: none !important;
  height: 46px;
  font-size: 15px;
  letter-spacing: 8px;
  color: #fff !important;
  background: linear-gradient(120deg, #6366f1 0%, #a855f7 60%, #ec4899 100%) !important;
  box-shadow: 0 10px 24px rgba(99, 102, 241, 0.45);
  transition: transform 0.15s ease, box-shadow 0.3s ease, filter 0.3s ease;
}
:deep(.submit-btn:hover) {
  filter: brightness(1.05) saturate(1.1);
  box-shadow: 0 16px 30px rgba(168, 85, 247, 0.55);
  transform: translateY(-1px);
}
:deep(.submit-btn:active) {
  transform: scale(0.97);
  box-shadow: 0 6px 14px rgba(99, 102, 241, 0.4);
}
</style>
