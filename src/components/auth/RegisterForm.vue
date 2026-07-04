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
        placeholder="请输入用户名"
        size="large"
        :prefix-icon="User"
        clearable
        @blur="triggerValidate('username')"
        @input="clearFieldErr('username')"
      />
    </el-form-item>

    <el-form-item prop="phone" class="stagger" style="--i:1">
      <el-input
        v-model="form.phone"
        placeholder="请输入手机号"
        size="large"
        :prefix-icon="Phone"
        maxlength="11"
        @blur="triggerValidate('phone')"
        @input="clearFieldErr('phone')"
      />
    </el-form-item>

    <el-form-item prop="password" class="stagger" style="--i:2">
      <el-input
        v-model="form.password"
        placeholder="请输入密码 (8-16位，字母+数字)"
        size="large"
        :prefix-icon="Lock"
        :type="showPwd ? 'text' : 'password'"
        @blur="triggerValidate('password')"
        @input="clearFieldErr('password')"
      >
        <template #suffix>
          <span class="eye" @click="showPwd = !showPwd">
            <el-icon><component :is="showPwd ? View : Hide" /></el-icon>
          </span>
        </template>
      </el-input>
      <div v-if="pwdHint" class="hint" :class="pwdHintClass">{{ pwdHint }}</div>
    </el-form-item>

    <el-form-item prop="confirm" class="stagger" style="--i:3">
      <el-input
        v-model="form.confirm"
        placeholder="请再次输入密码"
        size="large"
        :prefix-icon="Lock"
        :type="showConfirm ? 'text' : 'password'"
        @blur="triggerValidate('confirm')"
        @input="clearFieldErr('confirm')"
      >
        <template #suffix>
          <span class="eye" @click="showConfirm = !showConfirm">
            <el-icon><component :is="showConfirm ? View : Hide" /></el-icon>
          </span>
        </template>
      </el-input>
      <div v-if="confirmHint" class="hint" :class="confirmHintClass">{{ confirmHint }}</div>
    </el-form-item>

    <el-form-item prop="agree" class="stagger" style="--i:4">
      <el-checkbox v-model="form.agree">
        我已阅读并同意 <a class="link" @click.stop>《用户协议》</a>
      </el-checkbox>
    </el-form-item>

    <el-form-item class="stagger" style="--i:5">
      <el-button
        class="submit-btn"
        size="large"
        :loading="loading"
        @click="handleSubmit"
      >{{ loading ? '注册中…' : '注 册' }}</el-button>
    </el-form-item>

    <div class="alt-tip stagger" style="--i:6">
      已有账号？<a class="link" @click="$emit('switch', 'login')">前往登录</a>
    </div>
  </el-form>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { User, Lock, Phone, View, Hide } from '@element-plus/icons-vue'

const props = defineProps({
  loading: { type: Boolean, default: false },
})
const emit = defineEmits(['submit', 'switch'])

const formRef = ref(null)
const showPwd = ref(false)
const showConfirm = ref(false)

const form = reactive({
  username: '',
  phone: '',
  password: '',
  confirm: '',
  agree: false,
})

/* ===== 自定义校验：实时失焦双模式 ===== */
const validatePasswordStrength = (_, value, cb) => {
  if (!value) return cb(new Error('请输入密码'))
  if (value.length < 8 || value.length > 16) return cb(new Error('密码长度需 8-16 位'))
  const hasLetter = /[A-Za-z]/.test(value)
  const hasDigit  = /[0-9]/.test(value)
  if (!hasLetter || !hasDigit) return cb(new Error('密码必须同时包含字母和数字'))
  cb()
}

const validateConfirm = (_, value, cb) => {
  if (!value) return cb(new Error('请再次输入密码'))
  if (value !== form.password) return cb(new Error('两次输入的密码不一致'))
  cb()
}

const validateAgree = (_, value, cb) => {
  if (!value) return cb(new Error('请勾选用户协议'))
  cb()
}

const validatePhone = (_, value, cb) => {
  if (!value) return cb(new Error('请输入手机号'))
  if (!/^1[3-9]\d{9}$/.test(value)) return cb(new Error('请输入有效的 11 位手机号'))
  cb()
}

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  phone:    [{ validator: validatePhone,    trigger: 'blur' }],
  password: [{ validator: validatePasswordStrength, trigger: 'blur' }],
  confirm:  [{ validator: validateConfirm,  trigger: 'blur' }],
  agree:    [{ validator: validateAgree,    trigger: 'change' }],
}

/* ===== 实时提示 ===== */
const pwdHint = computed(() => {
  const v = form.password
  if (!v) return ''
  if (v.length < 8) return `还需 ${8 - v.length} 位达到最低长度`
  if (v.length > 16) return '超过最大长度 16 位'
  if (!/[A-Za-z]/.test(v)) return '还需包含字母'
  if (!/[0-9]/.test(v))   return '还需包含数字'
  return '密码强度符合要求'
})
const pwdHintClass = computed(() => {
  const v = form.password
  if (!v) return ''
  const ok = v.length >= 8 && v.length <= 16 && /[A-Za-z]/.test(v) && /[0-9]/.test(v)
  return ok ? 'hint-ok' : 'hint-warn'
})

const confirmHint = computed(() => {
  const v = form.confirm
  if (!v) return ''
  if (v !== form.password) return '两次密码不一致'
  return '两次密码一致'
})
const confirmHintClass = computed(() => {
  const v = form.confirm
  if (!v) return ''
  return v === form.password ? 'hint-ok' : 'hint-err'
})

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
  emit('submit', { ...form })
}
</script>

<style scoped>
.auth-form { display: flex; flex-direction: column; }

.stagger {
  opacity: 0;
  transform: translateY(8px);
  animation: fadeUp 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
  animation-delay: calc(var(--i) * 50ms + 60ms);
}
@keyframes fadeUp {
  to { opacity: 1; transform: translateY(0); }
}

/* ===== 实时提示：柔和浅色 ===== */
.hint {
  margin-top: 4px;
  font-size: 12px;
  line-height: 1;
  padding-left: 2px;
  transition: color 0.15s;
}
.hint-warn { color: #FCD34D; }              /* 柔和浅黄 */
.hint-err  { color: var(--color-danger); }   /* 柔和浅红 */
.hint-ok   { color: var(--color-success); }  /* 淡绿 */

.alt-tip {
  text-align: center;
  font-size: 13px;
  color: var(--color-text-muted);
  margin-top: 12px;
}

.eye {
  display: inline-flex; align-items: center;
  padding: 6px;
  cursor: pointer;
  color: var(--color-text-dim);
  transition: color 0.15s;
}
.eye:hover { color: var(--color-text); }

.link {
  color: var(--color-accent);
  cursor: pointer;
  transition: color 0.15s;
}
.link:hover { color: var(--color-accent-hover); text-decoration: underline; }

/* ===== 输入框：细描边 + 极小范围微弱外发光 ===== */
:deep(.el-input__wrapper) {
  background: rgba(15, 23, 42, 0.4) !important;
  border-radius: var(--r-md) !important;
  box-shadow: 0 0 0 1px var(--color-border) inset !important;
  transition: box-shadow 0.2s ease, background 0.2s ease !important;
  padding: 2px 12px !important;
}
:deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px var(--color-border-strong) inset !important;
}
:deep(.el-input__wrapper.is-focus) {
  box-shadow:
    0 0 0 1px var(--color-accent) inset,
    0 0 0 4px rgba(99, 102, 241, 0.15) !important;
  background: rgba(15, 23, 42, 0.55) !important;
}
:deep(.el-input__inner) {
  color: var(--color-text) !important;
  height: 40px;
  font-size: 14px;
}
:deep(.el-input__inner::placeholder) { color: var(--color-text-dim); }
:deep(.el-input__prefix .el-icon),
:deep(.el-input__suffix .el-icon) { color: var(--color-text-dim); }

:deep(.el-form-item__error) {
  color: var(--color-danger) !important;
  font-size: 12px;
  padding-top: 4px;
}

/* ===== 复选框 ===== */
:deep(.el-checkbox__label) { color: var(--color-text-muted); }
:deep(.el-checkbox__inner) {
  background: transparent !important;
  border-color: var(--color-border-strong) !important;
}
:deep(.el-checkbox.is-checked .el-checkbox__inner) {
  background: var(--color-accent) !important;
  border-color: var(--color-accent) !important;
}
:deep(.el-checkbox.is-checked .el-checkbox__label) {
  color: var(--color-text);
}

/* ===== 提交按钮：低饱和蓝→蓝紫渐变 ===== */
:deep(.submit-btn) {
  width: 100%;
  border-radius: var(--r-md) !important;
  border: none !important;
  height: 42px;
  font-size: 14px;
  letter-spacing: 4px;
  color: #fff !important;
  background: linear-gradient(90deg, #3B82F6 0%, #6366F1 100%) !important;
  box-shadow:
    0 4px 12px rgba(59, 130, 246, 0.28),
    0 1px 0 rgba(255, 255, 255, 0.08) inset !important;
  transition:
    transform 0.18s ease,
    box-shadow 0.25s ease,
    filter 0.2s ease !important;
}
:deep(.submit-btn:hover) {
  filter: brightness(1.06);
  box-shadow:
    0 8px 20px rgba(99, 102, 241, 0.38),
    0 1px 0 rgba(255, 255, 255, 0.1) inset !important;
}
:deep(.submit-btn:active) {
  transform: scale(0.985);
  filter: brightness(0.95);
}
</style>