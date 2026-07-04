<template>
  <div class="bg-gradient" />
  <div class="bg-aurora">
    <span class="orb orb-1" />
    <span class="orb orb-2" />
    <span class="orb orb-3" />
  </div>
</template>

<script setup>
// 纯展示组件：底层柔和渐变 + 光晕流光。
// 与 ParticleBackground 解耦，可单独使用。
</script>

<style scoped>
.bg-gradient {
  position: fixed;
  inset: 0;
  z-index: 0;
  background:
    radial-gradient(1200px 800px at 10% 10%, rgba(165, 180, 252, 0.55) 0%, transparent 60%),
    radial-gradient(1000px 700px at 90% 90%, rgba(251, 207, 232, 0.55) 0%, transparent 60%),
    radial-gradient(900px 600px at 55% 50%, rgba(167, 243, 208, 0.42) 0%, transparent 70%),
    linear-gradient(135deg, #f8faff 0%, #f5f0ff 50%, #fff5f7 100%);
}

.bg-aurora {
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
}

.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.55;
  animation: floatOrb 18s ease-in-out infinite;
}
.orb-1 { width: 480px; height: 480px; background: #a5b4fc; top: -120px; left: -120px; }
.orb-2 { width: 520px; height: 520px; background: #fbcfe8; bottom: -160px; right: -120px; animation-delay: -6s; }
.orb-3 { width: 360px; height: 360px; background: #a7f3d0; top: 40%; left: 55%; animation-delay: -12s; opacity: 0.4; }

@keyframes floatOrb {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50%      { transform: translate(60px, -40px) scale(1.12); }
}
</style>
