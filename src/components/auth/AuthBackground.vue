<template>
  <!-- 深商务藏青底色 + 极低饱和蓝紫角落径向点缀（禁止大面积高饱和粉紫） -->
  <div class="bg-base" />
  <div class="bg-corner bg-corner--tr" />
  <div class="bg-corner bg-corner--bl" />
</template>

<script setup>
// 纯展示背景层，仅提供底色与角落氛围光晕，无任何漂浮杂光斑、菱形装饰块
</script>

<style scoped>
.bg-base {
  position: fixed;
  inset: 0;
  z-index: 0;
  /* 深商务藏青基调 */
  background: #0F172A;
}

.bg-corner {
  position: fixed;
  z-index: 0;
  pointer-events: none;
  /* 极低透明度蓝紫径向渐变 —— 角落点缀，禁止弥散糊边 */
}

/* 右上角：冷蓝紫 */
.bg-corner--tr {
  top: 0;
  right: 0;
  width: 520px;
  height: 520px;
  background: radial-gradient(
    closest-side,
    rgba(99, 102, 241, 0.18) 0%,
    rgba(139, 92, 246, 0.08) 40%,
    rgba(15, 23, 42, 0) 75%
  );
  transform: translate(20%, -20%);
}

/* 左下角：深紫蓝 */
.bg-corner--bl {
  bottom: 0;
  left: 0;
  width: 480px;
  height: 480px;
  background: radial-gradient(
    closest-side,
    rgba(56, 189, 248, 0.10) 0%,
    rgba(99, 102, 241, 0.06) 45%,
    rgba(15, 23, 42, 0) 80%
  );
  transform: translate(-25%, 25%);
}
</style>