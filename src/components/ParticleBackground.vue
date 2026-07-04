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

// 配色 - 与页面轻奢商务渐变风格统一
const COLORS = ['#7c8cff', '#a18cd1', '#fbc2eb', '#84fab0', '#8fd3f4']

class Particle {
  constructor(w, h) {
    this.w = w
    this.h = h
    this.reset()
  }

  reset() {
    this.x = Math.random() * this.w
    this.y = Math.random() * this.h
    // 大小随机 - 给整体节奏感
    this.size = Math.random() * 2.2 + 0.6
    this.vx = (Math.random() - 0.5) * 0.4
    this.vy = (Math.random() - 0.5) * 0.4
    this.color = COLORS[Math.floor(Math.random() * COLORS.length)]
    this.alpha = Math.random() * 0.5 + 0.4
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
      if (dist < 150) {
        const force = (150 - dist) / 150
        // 排斥效果
        this.x -= (dx / dist) * force * 1.2
        this.y -= (dy / dist) * force * 1.2
      }
    }
  }

  draw() {
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
    ctx.fillStyle = this.color
    ctx.globalAlpha = this.alpha
    ctx.fill()
    ctx.globalAlpha = 1
  }
}

function initParticles() {
  // 使用逻辑像素作为粒子坐标基准（ctx 已按 dpr 缩放）
  const w = window.innerWidth
  const h = window.innerHeight
  // 根据屏幕面积自适应密度
  const count = Math.min(Math.floor((w * h) / 14000), 120)
  particles = Array.from({ length: count }, () => new Particle(w, h))
}

function drawLines() {
  const maxDist = 130
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const a = particles[i]
      const b = particles[j]
      const dx = a.x - b.x
      const dy = a.y - b.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < maxDist) {
        ctx.beginPath()
        ctx.moveTo(a.x, a.y)
        ctx.lineTo(b.x, b.y)
        ctx.strokeStyle = a.color
        ctx.globalAlpha = (1 - dist / maxDist) * 0.35
        ctx.lineWidth = 0.6
        ctx.stroke()
        ctx.globalAlpha = 1
      }
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
