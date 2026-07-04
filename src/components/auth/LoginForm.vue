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
        @blur="triggerValidate('username')"
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
        @blur="triggerValidate('password')"
        @input="clearFieldErr('password')"
      >
        <template #suffix>
          <span class="eye" @click="showPwd = !showPwd">
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
import { ElMessage } from 'element-plus'
import { User, Lock, View, Hide } from '@element-plus/icons-vue'

const props = defineProps({
  loading: { type: Boolean, default: false },
})
const emit = defineEmits(['submit', 'switch', 'forgot'])

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

function fallbackOnForgot() {
  ElMessage.warning('请联系管理员或前往找回密码页面～')
}
defineExpose({ fallbackOnForgot })
</script>

<style scoped>
.auth-form { display: flex; flex-direction: column; }

/* ===== 入场：依次平缓淡入 ===== */
.stagger {
  opacity: 0;
  transform: translateY(8px);
  animation: fadeUp 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
  animation-delay: calc(var(--i) * 50ms + 60ms);
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
/* 聚焦：细蓝紫描边 + 极小外发光（仅 4px，弱强度） */
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

/* ===== 报错柔和浅红 ===== */
:deep(.el-form-item__error) {
  color: var(--color-danger) !important;
  font-size: 12px;
  padding-top: 4px;
}

/* ===== 复选框：单色 ===== */
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

/* ===== 提交按钮：低饱和蓝→蓝紫渐变 + 稳重商务 ===== */
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