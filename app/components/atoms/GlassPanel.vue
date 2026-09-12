<template>
  <div 
    :class="[
      'backdrop-blur border shadow-sm transition-all duration-300',
      blurClass,
      roundedClass,
      variant === 'light' ? 'bg-white/20 border-white/30' : 
      variant === 'dark' ? 'bg-slate-900/20 border-slate-700/30' : 
      'bg-white/20 dark:bg-slate-900/20 border-white/30 dark:border-slate-700/30',
      customClass
    ]"
    :style="blurStyle"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

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

const blurClass = computed(() => {
  const map = {
    sm: 'backdrop-blur-sm',
    md: 'backdrop-blur-md',
    lg: 'backdrop-blur-lg',
    xl: 'backdrop-blur-xl',
    custom: '',
  };
  return map[props.blur || 'md'];
});

const blurStyle = computed(() => {
  return {
    backdropFilter: 'blur(4px)',
    WebkitBackdropFilter: 'blur(4px)'
  };
});

const roundedClass = computed(() => {
  const map = {
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
