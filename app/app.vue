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
  // Set CSS variables on the root element so all GlassLens components can access them
  document.documentElement.style.setProperty('--global-mouse-x', `${e.clientX}px`);
  document.documentElement.style.setProperty('--global-mouse-y', `${e.clientY}px`);
  
  // Also keep the window properties for any legacy local coordinate calculations
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