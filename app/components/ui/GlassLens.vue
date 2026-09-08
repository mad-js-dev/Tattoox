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
  radius: 130,
  color: '', 
});

const lensRef = ref<HTMLElement | null>(null);
const isDark = ref(false);

// Local coordinates to fix the offset
const localX = ref(0);
const localY = ref(0);

const resolveColor = () => {
  if (props.color) return props.color;
  return isDark.value ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.2)';
};

const overlayStyle = computed(() => ({
  backdropFilter: props.blur,
  WebkitBackdropFilter: props.blur as any,
  backgroundColor: resolveColor(),
  // We use the local X and Y here to ensure the lens is aligned with the mouse
  maskImage: `radial-gradient(circle ${props.radius}px at ${localX.value}px ${localY.value}px, transparent 0%, transparent 10%, black 30%)`,
  WebkitMaskImage: `radial-gradient(circle ${props.radius}px at ${localX.value}px ${localY.value}px, transparent 0%, transparent 10%, black 30%)`,
  zIndex: -1,
}));

const updateCoordinates = () => {
  if (!props.target) return;
  
  let targetEl: HTMLElement | null = null;
  if (props.target instanceof HTMLElement) {
    targetEl = props.target;
  } else if (props.target && typeof props.target === 'object') {
    targetEl = (props.target as any).$el || (props.target as any).element;
  }
  
  if (!targetEl) return;
  
  const rect = targetEl.getBoundingClientRect();
  // Use the global coordinates provided by app.vue
  const globalX = (window as any).globalMouseX || 0;
  const globalY = (window as any).globalMouseY || 0;
  
  // Calculate position relative to this specific container
  localX.value = globalX - rect.left;
  localY.value = globalY - rect.top;
};

const updateTheme = () => {
  isDark.value = document.documentElement.classList.contains('dark');
};

const themeObserver = new MutationObserver(() => updateTheme());

let animationFrameId: number;

onMounted(() => {
  updateTheme();
  themeObserver.observe(document.documentElement, { attributes: true });
  
  // Start a high-performance loop to keep the lens perfectly aligned
  const tick = () => {
    updateCoordinates();
    animationFrameId = requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
});

onUnmounted(() => {
  themeObserver.disconnect();
  cancelAnimationFrame(animationFrameId);
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
