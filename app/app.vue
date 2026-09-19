<template>
  <BgGsapTest />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import BgGsapTest from "../components/BgGsapTest.vue";

const handleMouseMove = (e: MouseEvent) => {
  document.documentElement.style.setProperty('--global-mouse-x', `${e.clientX}px`);
  document.documentElement.style.setProperty('--global-mouse-y', `${e.clientY}px`);
  (window as any).globalMouseX = e.clientX;
  (window as any).globalMouseY = e.clientY;
};

onMounted(() => {
  window.addEventListener('mousemove', handleMouseMove);
});

onUnmounted(() => {
  window.removeEventListener('mousemove', handleMouseMove);
});
</script>