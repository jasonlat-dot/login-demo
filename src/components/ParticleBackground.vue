<template>
  <canvas ref="canvasRef" class="particle-canvas"></canvas>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

/**
 * 动态粒子连线背景 —— 企业克制风格
 *
 * 设计约束：
 *  - 粒子与连线统一使用半透浅灰蓝色，避免光点杂乱刺眼
 *  - 粒子尺寸偏小（1~2px），数量疏密适中（按面积自适应）
 *  - 粒子缓慢漂浮 + 近距离自动连线
 *  - 鼠标附近粒子轻微吸引（极弱、不抢夺交互重心）
 *  - 整体固定在最底层，仅作为纹理背景
 */
const canvasRef = ref(null)
let ctx = null
let particles = []
let animationId = null
let dpr = 1

// 鼠标状态（用于粒子轻微吸引）
const mouse = { x: -9999, y: -9999, active: false }

// 统一配色：浅灰蓝色（slate-300，透明度压低）
const DOT_COLOR   = 'rgba(148, 163, 184, 0.55)'
const LINE_COLOR  = 'rgba(148, 163, 184, ALPHA)' // 运行时按距离替换 ALPHA

class Particle {
  constructor(w, h) {
    this.w = w
    this.h = h
    this.reset(true)
  }

  reset(initial = false) {
    this.x = Math.random() * this.w
    this.y = Math.random() * this.h
    // 尺寸偏小且带轻微随机（1.0 ~ 2.0）
    this.size = Math.random() * 1.0 + 1.0
    // 缓慢匀速漂浮
    const angle = Math.random() * Math.PI * 2
    const speed = Math.random() * 0.25 + 0.08
    this.vx = Math.cos(angle) * speed
    this.vy = Math.sin(angle) * speed
    if (initial) {
      this.vx *= 0.4
      this.vy *= 0.4
    }
  }

  update() {
    this.x += this.vx
    this.y += this.vy

    // 边界软回弹
    if (this.x < 0)  { this.x = 0;  this.vx = -this.vx }
    if (this.x > this.w) { this.x = this.w;  this.vx = -this.vx }
    if (this.y < 0)  { this.y = 0;  this.vy = -this.vy }
    if (this.y > this.h) { this.y = this.h;  this.vy = -this.vy }

    // 鼠标轻微吸引（极弱作用力，不抢交互重心）
    if (mouse.active) {
      const dx = mouse.x - this.x
      const dy = mouse.y - this.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist > 0 && dist < 140) {
        const force = (140 - dist) / 140 * 0.08
        this.vx += (dx / dist) * force
        this.vy += (dy / dist) * force
      }
    }
  }

  draw() {
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
    ctx.fillStyle = DOT_COLOR
    ctx.fill()
  }
}

/** 按面积自适应粒子数量（疏密适中） */
function initParticles() {
  const w = window.innerWidth
  const h = window.innerHeight
  const count = Math.min(Math.floor((w * h) / 18000), 70)
  particles = Array.from({ length: count }, () => new Particle(w, h))
}

/** 近距离连线（最大距离 + 透明度随距离衰减） */
function drawConnections() {
  const maxDist = 120
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const a = particles[i]
      const b = particles[j]
      const dx = a.x - b.x
      const dy = a.y - b.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < maxDist) {
        const alpha = (1 - dist / maxDist) * 0.25
        ctx.beginPath()
        ctx.moveTo(a.x, a.y)
        ctx.lineTo(b.x, b.y)
        ctx.strokeStyle = LINE_COLOR.replace('ALPHA', alpha.toFixed(3))
        ctx.lineWidth = 0.6
        ctx.stroke()
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
  drawConnections()
  animationId = requestAnimationFrame(animate)
}

function resize() {
  const c = canvasRef.value
  const w = window.innerWidth
  const h = window.innerHeight
  c.style.width  = w + 'px'
  c.style.height = h + 'px'
  c.width  = w * dpr
  c.height = h * dpr
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  particles.forEach(p => { p.w = w; p.h = h })
  if (particles.length === 0) initParticles()
}

function handleMouseMove(e) {
  mouse.x = e.clientX
  mouse.y = e.clientY
  mouse.active = true
}

function handleMouseLeave() {
  mouse.active = false
  mouse.x = -9999
  mouse.y = -9999
}

onMounted(() => {
  dpr = window.devicePixelRatio || 1
  ctx = canvasRef.value.getContext('2d')
  resize()
  initParticles()
  animate()
  window.addEventListener('resize', resize)
  window.addEventListener('mousemove', handleMouseMove)
  window.addEventListener('mouseout', handleMouseLeave)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(animationId)
  window.removeEventListener('resize', resize)
  window.removeEventListener('mousemove', handleMouseMove)
  window.removeEventListener('mouseout', handleMouseLeave)
})
</script>

<style scoped>
.particle-canvas {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  /* 粒子层位于最底，仅作纹理，不抢表单重心 */
  z-index: 1;
  pointer-events: none;
}
</style>