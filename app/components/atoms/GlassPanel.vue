<template>
  <div 
    ref="panelRef"
    :class="[
      'relative border shadow-xl shadow-black/25 transition-all duration-300 overflow-hidden',
      roundedClass,
      props.variant === 'light' ? 'bg-white/20 border-white/30' : 
      props.variant === 'dark' ? 'bg-slate-900/20 border-slate-700/30' : 
      'bg-white/20 dark:bg-slate-900/20 border-white/30 dark:border-slate-700/30',
      customClass
    ]"
  >
    <!-- The Blur Layer: Masked to create the 'clear hole' effect -->
    <div 
      v-if="isMounted"
      class="absolute inset-0 pointer-events-none"
      :style="blurLayerStyle"
    ></div>
    
    <!-- Content Layer: Stays sharp and above the blur -->
    <div class="relative z-10">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import GlassLens from '@/components/ui/GlassLens.vue';

interface Props {
  variant?: 'light' | 'dark' | 'auto';
  blur?: 'sm' | 'md' | 'lg' | 'xl' | 'custom';
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  class?: string;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'auto',
  blur: 'md',
  rounded: '2xl',
  class: '',
});

const panelRef = ref<HTMLElement | null>(null);
const isMounted = ref(false);
const localX = ref(0);
const localY = ref(0);
let animationFrameId: number;

onMounted(() => {
  isMounted.value = true;
  
  const tick = () => {
    if (panelRef.value) {
      const rect = panelRef.value.getBoundingClientRect();
      const globalX = (window as any).globalMouseX || 0;
      const globalY = (window as any).globalMouseY || 0;
      localX.value = globalX - rect.left;
      localY.value = globalY - rect.top;
    }
    animationFrameId = requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
});

onUnmounted(() => {
  cancelAnimationFrame(animationFrameId);
});

const blurLayerStyle = computed(() => {
  const radius = 130; 
  return {
    backdropFilter: 'blur(4px)',
    WebkitBackdropFilter: 'blur(4px)',
    maskImage: `radial-gradient(circle ${radius}px at ${localX.value}px ${localY.value}px, transparent 0%, transparent 10%, black 30%)`,
    WebkitMaskImage: `radial-gradient(circle ${radius}px at ${localX.value}px ${localY.value}px, transparent 0%, transparent 10%, black 30%)`,
  };
});

const roundedClass = computed(() => {
  const map: Record<string, string> = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
    full: 'rounded-full',
  };
  return map[props.rounded || '2xl'];
});

const customClass = computed(() => props.class);
</script>
