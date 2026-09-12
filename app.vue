<template>
  <div class="relative min-h-screen w-full">
    <!-- Global Environmental Background -->
    <ClientOnly>
      <InkBackground />
    </ClientOnly>
    
    <!-- Page Content -->
    <NuxtPage />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import InkBackground from '@/components/InkBackground.vue';

onMounted(() => {
  window.addEventListener('mousemove', (e) => {
    (window as any).globalMouseX = e.clientX;
    (window as any).globalMouseY = e.clientY;
  });
});
</script>

<style>
body {
  margin: 0;
  padding: 0;
  background-color: #0f172a; /* Dark slate base to ensure glass contrast */
}
</style>
