<template>
  <div 
    ref="lensRef"
    class="glass-overlay pointer-events-none absolute inset-0"
    :style="overlayStyle"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';

interface Props {
  target: any; 
  blur?: string;
  radius?: number;
  color?: string;
}

const props = withDefaults(defineProps<Props>(), {
  blur: 'blur(4px)',
  radius: 120,
  color: 'rgba(255, 255, 255, 0.2)',
});

const lensRef = ref<HTMLElement | null>(null);

const overlayStyle = computed(() => ({
  backdropFilter: props.blur,
  WebkitBackdropFilter: props.blur as any,
  backgroundColor: props.color,
  maskImage: `radial-gradient(circle ${props.radius}px at var(--x, 50%) var(--y, 50%), transparent 0%, transparent 10%, black 30%)`,
  WebkitMaskImage: `radial-gradient(circle ${props.radius}px at var(--x, 50%) var(--y, 50%), transparent 0%, transparent 10%, black 30%)`,
  zIndex: -1,
}));

const handleMouseMove = (e: MouseEvent) => {
  if (!props.target) return;
  
  // Handle cases where target is a Vue component or a plain element
  let targetEl: HTMLElement | null = null;
  if (props.target instanceof HTMLElement) {
    targetEl = props.target;
  } else if (props.target && typeof props.target === 'object') {
    targetEl = (props.target as any).$el || (props.target as any).element;
  }
  
  if (!targetEl || !lensRef.value) return;
  
  const rect = targetEl.getBoundingClientRect();
  
  // We must check if the mouse is actually inside the target element
  if (
    e.clientX >= rect.left &&
    e.clientX <= rect.right &&
    e.clientY >= rect.top &&
    e.clientY <= rect.bottom
  ) {
    lensRef.value.style.setProperty('--x', `${e.clientX - rect.left}px`);
    lensRef.value.style.setProperty('--y', `${e.clientY - rect.top}px`);
  }
};

onMounted(() => {
  window.addEventListener('mousemove', handleMouseMove);
});

onUnmounted(() => {
  window.removeEventListener('mousemove', handleMouseMove);
});
</script>

<style scoped>
.glass-overlay {
  will-change: mask-image;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}
</style>
