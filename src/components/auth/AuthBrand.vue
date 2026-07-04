<template>
  <section class="brand">
    <div class="brand-inner">
      <div class="brand-badge anim-up" style="--d:0ms">
        <span class="dot" />{{ badgeText }}
      </div>

      <h1 class="brand-title anim-up" style="--d:80ms">
        欢迎来到 <span class="grad-text">{{ productName }}</span>
      </h1>

      <p class="brand-slogan anim-up" style="--d:160ms">
        {{ sloganLine1 }}<br />
        {{ sloganLine2 }}
      </p>

      <div class="brand-divider anim-up" style="--d:240ms" />

      <ul class="brand-features anim-up" style="--d:320ms">
        <li v-for="(f, i) in features" :key="i">
          <span class="feat-icon">{{ f.icon }}</span>
          <div class="feat-text">
            <b>{{ f.title }}</b>
            <span>{{ f.desc }}</span>
          </div>
        </li>
      </ul>

      <div class="brand-footer anim-up" style="--d:400ms">
        © {{ year }} {{ copyright }}. All Rights Reserved.
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  badgeText:  { type: String,  default: '企业级 · 一站式工作台' },
  productName:{ type: String,  default: 'Nexus Apex' },
  sloganLine1:{ type: String,  default: '以极简之力，构筑企业级协作体验。' },
  sloganLine2:{ type: String,  default: '安全 · 高效 · 优雅，一触即达。' },
  copyright:  { type: String,  default: 'Nexus Apex Inc.' },
  features: {
    type: Array,
    default: () => [
      { icon: '01', title: '极速接入',   desc: '全球加速节点，平均延迟 ≤ 60ms' },
      { icon: '02', title: '金融级加密', desc: 'AES-256 + 国密 SM4 双算法守护' },
      { icon: '03', title: '优雅交互',   desc: '细节打磨，为沉浸体验而生' },
    ],
  },
})

const year = computed(() => new Date().getFullYear())
</script>

<style scoped>
.brand { color: var(--color-text); }
.brand-inner { padding: 8px 4px; }

/* ===== 顶部徽章：实心暗色块，去除模糊光晕 ===== */
.brand-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 4px 10px;
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  border-radius: var(--r-sm);
  font-size: 12px;
  letter-spacing: 1px;
  color: var(--color-text-muted);
}
.brand-badge .dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: var(--color-success);
}

/* ===== 标题层级：主标题大字号 + 蓝色重点词 + 细线条渐变 ===== */
.brand-title {
  margin: 24px 0 12px;
  font-size: 38px;
  font-weight: 600;
  line-height: 1.25;
  letter-spacing: 0;
  color: var(--color-text);
}
/* 重点词采用低饱和蓝紫渐变（克制商务） */
.grad-text {
  background: linear-gradient(90deg, #60A5FA 0%, #818CF8 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

/* ===== 副标题 ===== */
.brand-slogan {
  color: var(--color-text-muted);
  font-size: 14px;
  line-height: 1.7;
  max-width: 420px;
}

/* ===== 分隔线：细线条渐变 + 短宽度 ===== */
.brand-divider {
  width: 48px; height: 2px;
  background: linear-gradient(90deg, var(--color-accent) 0%, var(--color-accent-2) 100%);
  margin: 28px 0;
  border-radius: 1px;
}

/* ===== 特性列表：深色细边框弱透明，hover 轻微上浮 ===== */
.brand-features {
  list-style: none; padding: 0; margin: 0;
  display: grid;
  gap: 12px;
}
.brand-features li {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: rgba(15, 23, 42, 0.35);
  border: 1px solid var(--color-border);
  border-radius: var(--r-md);
  transition: transform 0.2s ease, border-color 0.2s ease, background 0.2s ease;
}
.brand-features li:hover {
  transform: translateY(-2px);
  border-color: var(--color-border-strong);
  background: rgba(15, 23, 42, 0.5);
}
.brand-features .feat-icon {
  flex-shrink: 0;
  width: 32px; height: 32px;
  display: grid; place-items: center;
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  border-radius: var(--r-sm);
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-muted);
  font-variant-numeric: tabular-nums;
}
.brand-features .feat-text { display: block; min-width: 0; }
.brand-features b {
  display: block;
  color: var(--color-text);
  font-size: 14px;
  font-weight: 600;
}
.brand-features span {
  display: block;
  color: var(--color-text-muted);
  font-size: 12px;
  margin-top: 2px;
}

/* ===== 页脚 ===== */
.brand-footer {
  margin-top: 36px;
  font-size: 12px;
  color: var(--color-text-dim);
  letter-spacing: 0.5px;
}

/* ===== 入场动画：平缓轻微上浮，幅度克制 ===== */
.anim-up {
  opacity: 0;
  transform: translateY(10px);
  animation: fadeUp 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
  animation-delay: var(--d, 0ms);
}
@keyframes fadeUp {
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 960px) {
  .brand { text-align: center; }
  .brand-features { grid-template-columns: 1fr; }
  .brand-title { font-size: 30px; }
}
</style>