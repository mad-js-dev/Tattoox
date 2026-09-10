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

// Reference to hold the observer so it can be disconnected in onUnmounted
let themeObserver: MutationObserver | null = null;

const resolveColor = () => {
  if (props.color) return props.color;
  return isDark.value ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.2)';
};

const overlayStyle = computed(() => ({
  backdropFilter: props.blur,
  WebkitBackdropFilter: props.blur as any,
  backgroundColor: resolveColor(),
  maskImage: `radial-gradient(circle ${props.radius}px at ${localX.value}px ${localY.value}px, transparent 0%, transparent 10%, black 30%)`,
  WebkitMaskImage: `radial-gradient(circle ${props.radius}px at ${localX.value}px ${localY.value}px, transparent 0%, transparent 10%, black 30%)`,
  zIndex: -1,
}));

const localX = ref(0);
const localY = ref(0);

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
  const globalX = (window as any).globalMouseX || 0;
  const globalY = (window as any).globalMouseY || 0;
  
  localX.value = globalX - rect.left;
  localY.value = globalY - rect.top;
};

const updateTheme = () => {
  if (typeof document !== 'undefined') {
    isDark.value = document.documentElement.classList.contains('dark');
  }
};

let animationFrameId: number;

onMounted(() => {
  updateTheme();
  
  // instantiate MutationObserver ONLY on the client
  themeObserver = new MutationObserver(() => updateTheme());
  themeObserver.observe(document.documentElement, { attributes: true });
  
  const tick = () => {
    updateCoordinates();
    animationFrameId = requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
});

onUnmounted(() => {
  if (themeObserver) {
    themeObserver.disconnect();
  }
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
