<script setup lang="ts">
import { ref } from 'vue';
import GlassLens from './GlassLens.vue';

interface Props {
  rounded?: string;
  padding?: string;
  className?: string;
  style?: any;
}

withDefaults(defineProps<Props>(), {
  rounded: 'rounded-2xl',
  padding: 'p-4',
  className: '',
  style: '',
});

const containerRef = ref<HTMLElement | null>(null);
</script>

<template>
  <div 
    ref="containerRef" 
    :class="['relative overflow-hidden shadow-lg transition-all duration-500', rounded, className]"
    :style="style"
  >
    <GlassLens :target="containerRef" />
    <div :class="['relative z-10 w-full h-full flex flex-col', padding]">
      <slot />
    </div>
  </div>
</template>

<style scoped>
</style>
