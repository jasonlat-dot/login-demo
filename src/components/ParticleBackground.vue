<template>
  <canvas ref="canvasRef" class="particle-canvas"></canvas>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

/**
 * 动态粒子背景组件
 * 特性:
 *  - 粒子大小随机
 *  - 缓慢无规则移动
 *  - 粒子相互靠近时产生连线
 *  - 鼠标移入产生吸附/排斥交互
 *  - 粒子半透明不遮挡表单
 */
const canvasRef = ref(null)
let ctx = null
let particles = []
let animationId = null
let mouse = { x: -9999, y: -9999, active: false }
let dpr = window.devicePixelRatio || 1

// 配色 - 浅色主题:粒子在奶油白底上配色,
// 暖色(粉/桃/蜜糖) + 冷色(海蓝/青绿) 各占一半,
// 完全移除紫色,避免画面被薰衣草色淹没
const COLORS = [
  '#0ea5e9', // sky blue
  '#38bdf8', // sky light
  '#14b8a6', // teal
  '#10b981', // mint
  '#34d399', // mint bright
  '#f59e0b', // amber
  '#fb923c', // peach
  '#f97316', // orange
  '#f43f5e', // rose
  '#ec4899', // pink
]  // 暖色 50% + 冷色 50%,紫色 0%


// 透明度基线 - 粒子有透明晕染,不抢戏
const ALPHA_BASE = 0.55
const ALPHA_JITTER = 0.35

// 性能预算:把连线距离 / 数量自适应,避免大屏 O(n²) 卡顿
const MAX_LINK_DIST_BASE = 130
class Particle {
  constructor(w, h) {
    this.w = w
    this.h = h
    this.reset()
  }

  reset() {
    this.x = Math.random() * this.w
    this.y = Math.random() * this.h
    // 大小丰富三档:微小(70%) / 小(20%) / 突出星点(10%)
    const r = Math.random()
    if (r < 0.7) {
      this.size = Math.random() * 1.4 + 0.5
    } else if (r < 0.9) {
      this.size = Math.random() * 2.2 + 1.4
    } else {
      this.size = Math.random() * 2.6 + 2.6
    }
    // 速度分两档:大粒子更慢,小粒子更活跃
    const speedFactor = this.size > 3 ? 0.18 : 0.32
    this.vx = (Math.random() - 0.5) * speedFactor
    this.vy = (Math.random() - 0.5) * speedFactor
    this.color = COLORS[Math.floor(Math.random() * COLORS.length)]
    this.alpha = Math.random() * ALPHA_JITTER + ALPHA_BASE
    // 闪烁相位 - 让一部分粒子呼吸,营造星光感
    this.twinklePhase = Math.random() * Math.PI * 2
    this.twinkleRate  = 0.015 + Math.random() * 0.02
  }

  update() {
    this.x += this.vx
    this.y += this.vy

    // 边界反弹
    if (this.x < 0 || this.x > this.w) this.vx *= -1
    if (this.y < 0 || this.y > this.h) this.vy *= -1

    // 鼠标吸附/排斥交互
    if (mouse.active) {
      const dx = mouse.x - this.x
      const dy = mouse.y - this.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < 160) {
        const force = (160 - dist) / 160
        // 排斥效果 - 中等强度,既能有反馈又不暴烈
        this.x -= (dx / dist) * force * 0.9
        this.y -= (dy / dist) * force * 0.9
      }
    }

    // 推进闪烁相位
    this.twinklePhase += this.twinkleRate
  }

  draw() {
    // 实时亮度 = 基础 alpha * (0.85 + 0.15*sin(相位))
    const twinkle = 0.85 + Math.sin(this.twinklePhase) * 0.15
    const a = this.alpha * twinkle

    // 主粒子 - 用 shadowBlur 做柔光,浅色背景下视觉亮点突出
    ctx.save()
    ctx.shadowColor = this.color
    ctx.shadowBlur  = this.size > 2.5 ? 10 : 5
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
    ctx.fillStyle = this.color
    ctx.globalAlpha = a
    ctx.fill()
    ctx.restore()
    ctx.globalAlpha = 1
  }
}

function initParticles() {
  // 使用逻辑像素作为粒子坐标基准（ctx 已按 dpr 缩放）
  const w = window.innerWidth
  const h = window.innerHeight
  // 提密度 + 加入三档大小,大小粒子混合,视觉上更灵动
  const count = Math.min(Math.floor((w * h) / 12000), 140)
  particles = Array.from({ length: count }, () => new Particle(w, h))
}

function drawLines() {
  // 自适应距离 - 屏越大、粒子越多,距离越短以避免 O(n²) 性能雪崩
  const maxDist = Math.max(
    90,
    MAX_LINK_DIST_BASE - Math.floor(particles.length / 12)
  )
  for (let i = 0; i < particles.length; i++) {
    const a = particles[i]
    for (let j = i + 1; j < particles.length; j++) {
      const b = particles[j]
      const dx = a.x - b.x
      const dy = a.y - b.y
      const distSq = dx * dx + dy * dy
      if (distSq > maxDist * maxDist) continue
      const dist = Math.sqrt(distSq)

      // 用两端颜色各取一个 stop,形成「微渐变」连线,更具活力
      const grad = ctx.createLinearGradient(a.x, a.y, b.x, b.y)
      grad.addColorStop(0, a.color)
      grad.addColorStop(1, b.color)

      ctx.beginPath()
      ctx.moveTo(a.x, a.y)
      ctx.lineTo(b.x, b.y)
      ctx.strokeStyle = grad
      ctx.globalAlpha = (1 - dist / maxDist) * 0.32
      ctx.lineWidth = 0.6
      ctx.stroke()
      ctx.globalAlpha = 1
    }
  }
}

function animate() {
  const c = canvasRef.value
  ctx.clearRect(0, 0, c.width, c.height)
  particles.forEach(p => {
    p.update()
    p.draw()
  })
  drawLines()
  animationId = requestAnimationFrame(animate)
}

function resize() {
  const c = canvasRef.value
  // 使用 CSS 像素作为逻辑坐标系，物理像素通过 dpr 缩放保证清晰
  const w = window.innerWidth
  const h = window.innerHeight
  c.style.width = w + 'px'
  c.style.height = h + 'px'
  c.width = w * dpr
  c.height = h * dpr
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  particles.forEach(p => { p.w = w; p.h = h })
  if (particles.length === 0) initParticles()
}

function handleMouseMove(e) {
  const rect = canvasRef.value.getBoundingClientRect()
  mouse.x = e.clientX - rect.left
  mouse.y = e.clientY - rect.top
  mouse.active = true
}

function handleMouseLeave() {
  mouse.active = false
  mouse.x = -9999
  mouse.y = -9999
}

onMounted(() => {
  ctx = canvasRef.value.getContext('2d')
  resize()
  initParticles()
  animate()
  window.addEventListener('resize', resize)
  canvasRef.value.addEventListener('mousemove', handleMouseMove)
  canvasRef.value.addEventListener('mouseleave', handleMouseLeave)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(animationId)
  window.removeEventListener('resize', resize)
  if (canvasRef.value) {
    canvasRef.value.removeEventListener('mousemove', handleMouseMove)
    canvasRef.value.removeEventListener('mouseleave', handleMouseLeave)
  }
})
</script>

<style scoped>
.particle-canvas {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  pointer-events: auto; /* 接收鼠标事件用于吸附交互 */
}
</style>
