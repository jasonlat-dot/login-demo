<template>
  <div ref="scene" class="char-scene" aria-hidden="true">
    <!-- Purple rectangle -->
    <div ref="purple" class="character char-purple" :style="purpleBodyStyle">
      <div
        ref="purpleEyes"
        class="eyes"
        :style="purpleEyesContainerStyle"
      >
        <div ref="purpleEyeL" class="eyeball" :style="purpleEyeballStyle">
          <div ref="purplePupilL" class="pupil" :style="purplePupilStyle" />
        </div>
        <div ref="purpleEyeR" class="eyeball" :style="purpleEyeballStyle">
          <div ref="purplePupilR" class="pupil" :style="purplePupilStyle" />
        </div>
      </div>
    </div>

    <!-- Black rectangle -->
    <div ref="black" class="character char-black" :style="blackBodyStyle">
      <div
        ref="blackEyes"
        class="eyes"
        :style="blackEyesContainerStyle"
      >
        <div ref="blackEyeL" class="eyeball" :style="blackEyeballStyle">
          <div ref="blackPupilL" class="pupil" :style="blackPupilStyle" />
        </div>
        <div ref="blackEyeR" class="eyeball" :style="blackEyeballStyle">
          <div ref="blackPupilR" class="pupil" :style="blackPupilStyle" />
        </div>
      </div>
    </div>

    <!-- Orange semi-circle -->
    <div ref="orange" class="character char-orange" :style="orangeBodyStyle">
      <div
        ref="orangeEyes"
        class="eyes"
        :style="orangeEyesContainerStyle"
      >
        <div ref="orangePupilL" class="bare-pupil" :style="orangePupilStyle" />
        <div ref="orangePupilR" class="bare-pupil" :style="orangePupilStyle" />
      </div>
      <div
        ref="orangeMouth"
        class="orange-mouth"
        :class="{ visible: isLoginError }"
        :style="orangeMouthStyle"
      />
    </div>

    <!-- Yellow rounded -->
    <div ref="yellow" class="character char-yellow" :style="yellowBodyStyle">
      <div
        ref="yellowEyes"
        class="eyes"
        :style="yellowEyesContainerStyle"
      >
        <div ref="yellowPupilL" class="bare-pupil" :style="yellowPupilStyle" />
        <div ref="yellowPupilR" class="bare-pupil" :style="yellowPupilStyle" />
      </div>
      <div ref="yellowMouth" class="yellow-mouth" :style="yellowMouthStyle" />
    </div>
  </div>
</template>

<script setup>
import { computed, inject, onBeforeUnmount, onMounted, ref } from 'vue'

/* ===== Inject shared state from App.vue ===== */
const charState = inject('charState', {
  focusedField: null,
  passwordShown: false,
  passwordLen: 0,
  isLoginError: false,
})

/* ===== Element refs ===== */
const scene        = ref(null)
const purple       = ref(null)
const purpleEyes   = ref(null)
const purpleEyeL   = ref(null)
const purplePupilL = ref(null)
const purplePupilR = ref(null)
const black        = ref(null)
const blackEyes    = ref(null)
const blackEyeL    = ref(null)
const blackPupilL  = ref(null)
const blackPupilR  = ref(null)
const orange       = ref(null)
const orangeEyes   = ref(null)
const orangePupilL = ref(null)
const orangePupilR = ref(null)
const orangeMouth  = ref(null)
const yellow       = ref(null)
const yellowEyes   = ref(null)
const yellowPupilL = ref(null)
const yellowPupilR = ref(null)
const yellowMouth  = ref(null)

/* ===== Local UI state ===== */
let mouseX = 0
let mouseY = 0

let isTyping = false          // 聚焦在 username / phone
let isLookingAtEachOther = false
let isPurpleBlinking = false
let isBlackBlinking = false
let isPurplePeeking = false

let blinkPurpleTimer = null
let blinkBlackTimer = null
let peekTimer = null
let typingTimer = null
let errorRecoverTimer = null
let shakeHandlers = []

/* ===== Mode detection (single source of truth) ===== */
const isUsernameFocused = computed(
  () => charState.focusedField === 'username' || charState.focusedField === 'phone',
)
const isPasswordFocused = computed(() => charState.focusedField === 'password' || charState.focusedField === 'confirm')
const isShowingPwd = computed(() => charState.passwordShown && charState.passwordLen > 0)
const isLookingAway = computed(() => isPasswordFocused.value && !charState.passwordShown)
const isLoginError = computed(() => charState.isLoginError)

/* ===== Helpers ===== */
function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v))
}

function calcPosition(el) {
  if (!el) return { faceX: 0, faceY: 0, bodySkew: 0 }
  const rect = el.getBoundingClientRect()
  const cx = rect.left + rect.width / 2
  const cy = rect.top + rect.height / 3
  const dx = mouseX - cx
  const dy = mouseY - cy
  const faceX = clamp(dx / 20, -15, 15)
  const faceY = clamp(dy / 30, -10, 10)
  const bodySkew = clamp(-dx / 120, -6, 6)
  return { faceX, faceY, bodySkew }
}

function calcPupilOffset(el, maxDist) {
  if (!el) return { x: 0, y: 0 }
  const rect = el.getBoundingClientRect()
  const cx = rect.left + rect.width / 2
  const cy = rect.top + rect.height / 2
  const dx = mouseX - cx
  const dy = mouseY - cy
  const dist = Math.min(Math.sqrt(dx * dx + dy * dy), maxDist)
  const angle = Math.atan2(dy, dx)
  return { x: Math.cos(angle) * dist, y: Math.sin(angle) * dist }
}

/* ===== Style bindings (computed) — declarative, just like the original JS mutates inline ===== */
const purpleBodyStyle = computed(() => {
  if (isLoginError.value) return { transform: 'skewX(0deg)', height: '370px' }
  if (isShowingPwd.value) return { transform: 'skewX(0deg)', height: '370px' }
  if (isLookingAway.value) return { transform: 'skewX(-14deg) translateX(-20px)', height: '410px' }
  if (isUsernameFocused.value) {
    const p = calcPosition(purple.value)
    return { transform: `skewX(${(p.bodySkew || 0) - 12}deg) translateX(40px)`, height: '410px' }
  }
  const p = calcPosition(purple.value)
  return { transform: `skewX(${p.bodySkew}deg)`, height: '370px' }
})

const blackBodyStyle = computed(() => {
  if (isLoginError.value) return { transform: 'skewX(0deg)' }
  if (isShowingPwd.value) return { transform: 'skewX(0deg)' }
  if (isLookingAway.value) return { transform: 'skewX(12deg) translateX(-10px)' }
  if (isLookingAtEachOther) {
    const b = calcPosition(black.value)
    return { transform: `skewX(${(b.bodySkew || 0) * 1.5 + 10}deg) translateX(20px)` }
  }
  if (isTyping) {
    const b = calcPosition(black.value)
    return { transform: `skewX(${(b.bodySkew || 0) * 1.5}deg)` }
  }
  const b = calcPosition(black.value)
  return { transform: `skewX(${b.bodySkew}deg)` }
})

const orangeBodyStyle = computed(() => {
  if (isShowingPwd.value) return { transform: 'skewX(0deg)' }
  const o = calcPosition(orange.value)
  return { transform: `skewX(${o.bodySkew}deg)` }
})

const yellowBodyStyle = computed(() => {
  if (isShowingPwd.value) return { transform: 'skewX(0deg)' }
  const y = calcPosition(yellow.value)
  return { transform: `skewX(${y.bodySkew}deg)` }
})

/* ----- Purple eyes ----- */
const purpleEyesContainerStyle = computed(() => {
  if (isLoginError.value) return { left: '30px', top: '55px' }
  if (isLookingAway.value) return { left: '20px', top: '25px' }
  if (isShowingPwd.value) return { left: '20px', top: '35px' }
  if (isLookingAtEachOther) return { left: '55px', top: '65px' }
  const p = calcPosition(purple.value)
  return { left: `${45 + p.faceX}px`, top: `${40 + p.faceY}px` }
})

const purpleEyeballStyle = computed(() => ({
  width: '18px',
  height: isPurpleBlinking ? '2px' : '18px',
}))

const purplePupilStyle = computed(() => {
  if (isLoginError.value) return { transform: 'translate(-3px, 4px)' }
  if (isLookingAway.value) return { transform: 'translate(-5px, -5px)' }
  if (isShowingPwd.value) {
    const px = isPurplePeeking ? 4 : -4
    const py = isPurplePeeking ? 5 : -4
    return { transform: `translate(${px}px, ${py}px)` }
  }
  if (isLookingAtEachOther) return { transform: 'translate(3px, 4px)' }
  const po = calcPupilOffset(purpleEyeL.value, 5)
  return { transform: `translate(${po.x.toFixed(2)}px, ${po.y.toFixed(2)}px)` }
})

/* ----- Black eyes ----- */
const blackEyesContainerStyle = computed(() => {
  if (isLoginError.value) return { left: '15px', top: '40px' }
  if (isLookingAway.value) return { left: '10px', top: '20px' }
  if (isShowingPwd.value) return { left: '10px', top: '28px' }
  if (isLookingAtEachOther) return { left: '32px', top: '12px' }
  const b = calcPosition(black.value)
  return { left: `${26 + b.faceX}px`, top: `${32 + b.faceY}px` }
})

const blackEyeballStyle = computed(() => ({
  width: '16px',
  height: isBlackBlinking ? '2px' : '16px',
}))

const blackPupilStyle = computed(() => {
  if (isLoginError.value) return { transform: 'translate(-3px, 4px)' }
  if (isLookingAway.value) return { transform: 'translate(-4px, -5px)' }
  if (isShowingPwd.value) return { transform: 'translate(-4px, -4px)' }
  if (isLookingAtEachOther) return { transform: 'translate(0px, -4px)' }
  const bo = calcPupilOffset(blackEyeL.value, 4)
  return { transform: `translate(${bo.x.toFixed(2)}px, ${bo.y.toFixed(2)}px)` }
})

/* ----- Orange eyes / mouth ----- */
const orangeEyesContainerStyle = computed(() => {
  if (isLoginError.value) return { left: '60px', top: '95px' }
  if (isLookingAway.value) return { left: '50px', top: '75px' }
  if (isShowingPwd.value) return { left: '50px', top: '85px' }
  const o = calcPosition(orange.value)
  return { left: `${82 + o.faceX}px`, top: `${90 + o.faceY}px` }
})

const orangePupilStyle = computed(() => {
  if (isLoginError.value) return { transform: 'translate(-3px, 4px)' }
  if (isLookingAway.value) return { transform: 'translate(-5px, -5px)' }
  if (isShowingPwd.value) return { transform: 'translate(-5px, -4px)' }
  const oo = calcPupilOffset(orangePupilL.value, 5)
  return { transform: `translate(${oo.x.toFixed(2)}px, ${oo.y.toFixed(2)}px)` }
})

const orangeMouthStyle = computed(() => {
  if (isLoginError.value) {
    const o = calcPosition(orange.value)
    return { left: `${80 + o.faceX}px`, top: '130px' }
  }
  return { left: '90px', top: '120px' }
})

/* ----- Yellow eyes / mouth ----- */
const yellowEyesContainerStyle = computed(() => {
  if (isLoginError.value) return { left: '35px', top: '45px' }
  if (isLookingAway.value) return { left: '20px', top: '30px' }
  if (isShowingPwd.value) return { left: '20px', top: '35px' }
  const y = calcPosition(yellow.value)
  return { left: `${52 + y.faceX}px`, top: `${40 + y.faceY}px` }
})

const yellowPupilStyle = computed(() => {
  if (isLoginError.value) return { transform: 'translate(-3px, 4px)' }
  if (isLookingAway.value) return { transform: 'translate(-5px, -5px)' }
  if (isShowingPwd.value) return { transform: 'translate(-5px, -4px)' }
  const yo = calcPupilOffset(yellowPupilL.value, 5)
  return { transform: `translate(${yo.x.toFixed(2)}px, ${yo.y.toFixed(2)}px)` }
})

const yellowMouthStyle = computed(() => {
  if (isLoginError.value) {
    return { left: '30px', top: '92px', transform: 'rotate(-8deg)' }
  }
  if (isLookingAway.value) {
    return { left: '15px', top: '78px', transform: 'rotate(0deg)' }
  }
  if (isShowingPwd.value) {
    return { left: '10px', top: '88px', transform: 'rotate(0deg)' }
  }
  const y = calcPosition(yellow.value)
  return {
    left: `${40 + y.faceX}px`,
    top: `${88 + y.faceY}px`,
    transform: 'rotate(0deg)',
  }
})

/* ===== Shake-head (login error) ===== */
function restartShakeHead() {
  const ids = [purpleEyes, blackEyes, orangeEyes, yellowEyes, yellowMouth, orangeMouth]
  shakeHandlers = ids
    .map((r) => r.value)
    .filter(Boolean)

  shakeHandlers.forEach((el) => el.classList.remove('shake-head'))
  // Force reflow so re-adding restarts the animation even after repeated triggers
  void scene.value?.offsetHeight
  setTimeout(() => {
    shakeHandlers.forEach((el) => el.classList.add('shake-head'))
  }, 350)
}

function clearShakeHead() {
  shakeHandlers.forEach((el) => el.classList.remove('shake-head'))
  shakeHandlers = []
}

/* ===== Blinking ===== */
function scheduleBlinkPurple() {
  blinkPurpleTimer = setTimeout(() => {
    isPurpleBlinking = true
    setTimeout(() => {
      isPurpleBlinking = false
      scheduleBlinkPurple()
    }, 150)
  }, Math.random() * 4000 + 3000)
}

function scheduleBlinkBlack() {
  blinkBlackTimer = setTimeout(() => {
    isBlackBlinking = true
    setTimeout(() => {
      isBlackBlinking = false
      scheduleBlinkBlack()
    }, 150)
  }, Math.random() * 4000 + 3000)
}

/* ===== Purple peek when password is visible ===== */
function schedulePeek() {
  if (!isShowingPwd.value) return
  peekTimer = setTimeout(() => {
    if (!isShowingPwd.value) return
    isPurplePeeking = true
    setTimeout(() => {
      isPurplePeeking = false
      schedulePeek()
    }, 800)
  }, Math.random() * 3000 + 2000)
}

/* ===== Mouse tracking ===== */
function onMouseMove(e) {
  mouseX = e.clientX
  mouseY = e.clientY
}

/* ===== Watchers (login typing state) ===== */
function syncTypingState() {
  const nextTyping = isUsernameFocused.value
  if (nextTyping === isTyping) return
  isTyping = nextTyping
  if (nextTyping) {
    isLookingAtEachOther = true
    if (typingTimer) clearTimeout(typingTimer)
    typingTimer = setTimeout(() => {
      isLookingAtEachOther = false
    }, 800)
  } else {
    isLookingAtEachOther = false
  }
}

/* ===== Watch password-shown for peek ===== */
function syncPeekState() {
  if (isShowingPwd.value) schedulePeek()
  else {
    if (peekTimer) {
      clearTimeout(peekTimer)
      peekTimer = null
    }
    isPurplePeeking = false
  }
}

/* ===== Watch login error for shake-head ===== */
function syncErrorState() {
  if (charState.isLoginError) {
    if (errorRecoverTimer) {
      clearTimeout(errorRecoverTimer)
      errorRecoverTimer = null
    }
    restartShakeHead()
    errorRecoverTimer = setTimeout(() => {
      errorRecoverTimer = null
      charState.isLoginError = false
      clearShakeHead()
    }, 2500)
  } else {
    if (errorRecoverTimer) {
      clearTimeout(errorRecoverTimer)
      errorRecoverTimer = null
    }
    clearShakeHead()
  }
}

/* ===== Lifecycle ===== */
onMounted(() => {
  window.addEventListener('mousemove', onMouseMove)
  scheduleBlinkPurple()
  scheduleBlinkBlack()
})

onBeforeUnmount(() => {
  window.removeEventListener('mousemove', onMouseMove)
  if (blinkPurpleTimer) clearTimeout(blinkPurpleTimer)
  if (blinkBlackTimer) clearTimeout(blinkBlackTimer)
  if (peekTimer) clearTimeout(peekTimer)
  if (typingTimer) clearTimeout(typingTimer)
  if (errorRecoverTimer) clearTimeout(errorRecoverTimer)
  clearShakeHead()
})

/* ===== Effects ===== */
import { watch } from 'vue'
watch(() => charState.focusedField, syncTypingState, { flush: 'post' })
watch(isShowingPwd, syncPeekState, { flush: 'post' })
watch(() => charState.isLoginError, syncErrorState, { flush: 'post' })
</script>

<style scoped>
.char-scene {
  position: relative;
  width: 480px;
  height: 360px;
  pointer-events: none;
  user-select: none;
}

/* ===== Character base styles ===== */
.character {
  position: absolute;
  bottom: 0;
  transition: all 0.7s ease-in-out;
  transform-origin: bottom center;
}

/* Purple rectangle */
.char-purple {
  left: 60px;
  width: 170px;
  height: 370px;
  background: #6C3FF5;
  border-radius: 10px 10px 0 0;
  z-index: 1;
}

/* Black rectangle */
.char-black {
  left: 220px;
  width: 115px;
  height: 290px;
  background: #2D2D2D;
  border-radius: 8px 8px 0 0;
  z-index: 2;
}

/* Orange semi-circle */
.char-orange {
  left: 0;
  width: 230px;
  height: 190px;
  background: #FF9B6B;
  border-radius: 115px 115px 0 0;
  z-index: 3;
}

/* Yellow rounded */
.char-yellow {
  left: 290px;
  width: 135px;
  height: 215px;
  background: #E8D754;
  border-radius: 68px 68px 0 0;
  z-index: 4;
}

/* ===== Eyes container ===== */
.eyes {
  position: absolute;
  display: flex;
  gap: 28px;
  transition: all 0.7s ease-in-out;
}

.char-black .eyes { gap: 20px; }
.char-orange .eyes { gap: 28px; }
.char-yellow .eyes { gap: 20px; }

/* Eyeball (white with pupil) */
.eyeball {
  border-radius: 50%;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: height 0.15s ease;
  overflow: hidden;
}

/* Pupil */
.pupil {
  border-radius: 50%;
  background: #2D2D2D;
  transition: transform 0.1s ease-out;
}

/* Bare pupil (no white eyeball) */
.bare-pupil {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #2D2D2D;
  transition: transform 0.7s ease-in-out;
}

/* Yellow mouth */
.yellow-mouth {
  position: absolute;
  width: 50px;
  height: 4px;
  background: #2D2D2D;
  border-radius: 2px;
  transition: all 0.7s ease-in-out;
}

/* ===== Shake-head animation ===== */
@keyframes shakeHead {
  0%, 100% { translate: 0 0; }
  10% { translate: -9px 0; }
  20% { translate: 7px 0; }
  30% { translate: -6px 0; }
  40% { translate: 5px 0; }
  50% { translate: -4px 0; }
  60% { translate: 3px 0; }
  70% { translate: -2px 0; }
  80% { translate: 1px 0; }
  90% { translate: -0.5px 0; }
}

.eyes.shake-head,
.yellow-mouth.shake-head,
.orange-mouth.shake-head {
  animation: shakeHead 0.8s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
}

/* Sad mouth (curved down) — shown on login error */
.orange-mouth {
  position: absolute;
  width: 28px;
  height: 14px;
  border: 3px solid #2D2D2D;
  border-top: none;
  border-radius: 0 0 14px 14px;
  opacity: 0;
  transition: all 0.7s ease-in-out;
}

.orange-mouth.visible {
  opacity: 1;
}
</style>