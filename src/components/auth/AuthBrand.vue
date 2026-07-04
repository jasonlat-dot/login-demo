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
          <i class="feat-icon">{{ f.icon }}</i>
          <div>
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
  badgeText:  { type: String,  default: '轻奢商务 · 一站式工作台' },
  productName:{ type: String,  default: 'Nexus Apex' },
  sloganLine1:{ type: String,  default: '以极简之力，构筑企业级协作体验。' },
  sloganLine2:{ type: String,  default: '安全 · 高效 · 优雅，一触即达。' },
  copyright:  { type: String,  default: 'Nexus Apex Inc.' },
  features: {
    type: Array,
    default: () => [
      { icon: '⚡', title: '极速接入',   desc: '全球加速节点，平均延迟 ≤ 60ms' },
      { icon: '🛡️', title: '金融级加密', desc: 'AES-256 + 国密 SM4 双算法守护' },
      { icon: '✨', title: '优雅交互',   desc: '每一处细节皆为沉浸体验而生' },
    ],
  },
})

const year = computed(() => new Date().getFullYear())
</script>

<style scoped>
.brand { color: #fff; }
.brand-inner { padding: 24px 12px; }

.brand-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(8px);
  border-radius: 999px;
  font-size: 12px;
  letter-spacing: 1px;
}
.brand-badge .dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: #84fab0; box-shadow: 0 0 8px #84fab0;
}

.brand-title {
  margin: 22px 0 14px;
  font-size: 44px;
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: 1px;
}
.grad-text {
  background: linear-gradient(120deg, #8ec5fc 0%, #e0c3fc 50%, #fbc2eb 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.brand-slogan {
  color: rgba(255, 255, 255, 0.78);
  font-size: 15px;
  line-height: 1.8;
}

.brand-divider {
  width: 64px; height: 3px;
  border-radius: 3px;
  margin: 28px 0;
  background: linear-gradient(90deg, #8ec5fc, #e0c3fc, #fbc2eb);
  box-shadow: 0 0 12px rgba(189, 167, 255, 0.5);
}

.brand-features {
  list-style: none; padding: 0; margin: 0;
  display: grid; gap: 14px;
}
.brand-features li {
  display: flex; align-items: center; gap: 14px;
  padding: 12px 14px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  backdrop-filter: blur(6px);
}
.brand-features .feat-icon {
  width: 36px; height: 36px;
  display: grid; place-items: center;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  font-size: 18px;
}
.brand-features b {
  display: block; color: #fff; font-size: 14px; font-weight: 600;
}
.brand-features span {
  display: block; color: rgba(255, 255, 255, 0.6); font-size: 12px; margin-top: 2px;
}

.brand-footer {
  margin-top: 36px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.45);
  letter-spacing: 1px;
}

.anim-up {
  opacity: 0;
  transform: translateY(18px);
  animation: fadeUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
  animation-delay: var(--d, 0ms);
}
@keyframes fadeUp {
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 960px) {
  .brand { text-align: center; }
  .brand-features { grid-template-columns: 1fr; }
  .brand-title { font-size: 32px; }
}
</style>
