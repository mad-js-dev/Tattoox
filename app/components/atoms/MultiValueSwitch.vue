<template>
  <div 
    ref="trackRef" 
    class="relative p-1 flex items-center rounded-full bg-slate-200/50 dark:bg-slate-800/50 backdrop-blur-sm border border-white/20 dark:border-white/10 w-full md:w-fit"
  >
    <!-- The Animated Pill -->
    <div 
      ref="pillRef" 
      class="absolute top-1 bottom-1 left-0 rounded-full shadow-sm bg-white dark:bg-slate-700 z-0"
      style="width: 0px"
    />

    <!-- The Options -->
    <div class="flex relative z-10 w-full">
      <button 
        v-for="(option, index) in props.options" 
        :key="option.value"
        :ref="el => { if (el) optionRefs[index] = el as HTMLElement }"
        @click="selectOption(option.value)"
        :class="[
          'flex-1 px-4 py-1.5 rounded-full text-[13px] md:text-sm transition-none outline-none border-none bg-transparent cursor-pointer text-center truncate',
          modelValue === option.value ? 'font-medium text-slate-900 dark:text-white' : 'font-normal text-slate-500 dark:text-slate-400'
        ]"
        class="option-text"
      >
        {{ t(option.label) }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import gsap from 'gsap';

interface Option {
  label: string;
  value: string;
}

interface Props {
  options: Option[];
  modelValue: string;
  rangeMap?: Record<string, { start: number; end: number }>;
  autoRange?: boolean;
  scrollProgress?: number; // 0 to 1, used for mobile sync
}

const props = defineProps<Props>();
const emit = defineEmits(['update:modelValue']);

const { t } = useI18n();
const trackRef = ref<HTMLElement | null>(null);
const pillRef = ref<HTMLElement | null>(null);
const optionRefs = ref<HTMLElement[]>([]);

const selectOption = (value: string) => {
  const currentVal = props.modelValue;
  const isMobile = window.innerWidth < 768;

  if (isMobile) {
    emit('update:modelValue', value);
    return;
  }

  // DESKTOP LOGIC: Intent-Based Selection
  
  // 1. The "Archive" boundary trigger
  if (value === 'archive') {
    if (currentVal === 'all_except_archive') {
      emit('update:modelValue', 'all');
    } else if (currentVal === 'all') {
      emit('update:modelValue', 'all_except_archive');
    } else {
      emit('update:modelValue', 'all');
    }
    return;
  }

  // 2. Range Toggling (if the clicked value is explicitly a range key)
  if (value === 'all' || value === 'all_except_archive') {
    if (currentVal === 'all' && value === 'all') {
      emit('update:modelValue', 'all_except_archive');
    } else if (currentVal === 'all_except_archive' && value === 'all_except_archive') {
      emit('update:modelValue', 'all');
    } else {
      emit('update:modelValue', value);
    }
    return;
  }

  // 3. Default: Single item selection
  // On desktop we should not switch to a single-item value. Instead,
  // clicking any non-range option should toggle the visible range
  // (e.g. between `all` and `all_except_archive`) so the desktop view
  // always shows a range of columns.
  const rangeKeys = props.rangeMap ? Object.keys(props.rangeMap) : [];
  const hasAllExcept = rangeKeys.includes('all_except_archive');
  const defaultRange = hasAllExcept ? 'all_except_archive' : (rangeKeys[0] || 'all');

  if (value !== 'archive' && value !== 'all' && value !== 'all_except_archive') {
    if (currentVal === 'all') {
      emit('update:modelValue', hasAllExcept ? 'all_except_archive' : 'all');
    } else if (currentVal === 'all_except_archive') {
      emit('update:modelValue', 'all');
    } else {
      emit('update:modelValue', defaultRange);
    }
    return;
  }

  emit('update:modelValue', value);
};

const updatePill = async () => {
  await nextTick();
  if (!pillRef.value || optionRefs.value.length === 0) return;

  const isMobile = window.innerWidth < 768;

  if (isMobile && props.scrollProgress !== undefined) {
    const progress = props.scrollProgress;
    const totalOptions = optionRefs.value.length;
    const floatIdx = progress * (totalOptions - 1);
    const startIdx = Math.floor(floatIdx);
    const endIdx = Math.ceil(floatIdx);
    const lerpFactor = floatIdx - startIdx;

    const startEl = optionRefs.value[startIdx];
    const endEl = optionRefs.value[endIdx] || startEl;

    if (startEl && endEl) {
      const trackRect = trackRef.value?.getBoundingClientRect();
      const startRect = startEl.getBoundingClientRect();
      const endRect = endEl.getBoundingClientRect();

      const leftStart = startRect.left - (trackRect?.left || 0);
      const leftEnd = endRect.left - (trackRect?.left || 0);
      const widthStart = startRect.width;
      const widthEnd = endRect.width;

      gsap.set(pillRef.value, {
        left: leftStart + (leftEnd - leftStart) * lerpFactor,
        width: widthStart + (widthEnd - widthStart) * lerpFactor
      });
      
      const closestIdx = Math.round(floatIdx);
      optionRefs.value.forEach((el, idx) => {
        const isActive = (idx === closestIdx);
        gsap.to(el, {
          color: isActive ? (isDarkMode() ? '#ffffff' : '#0f172a') : (isDarkMode() ? '#94a3b8' : '#64748b'),
          duration: 0.2
        });
      });
      return;
    }
  }

  const currentVal = props.modelValue;
  
  let startIdx = -1;
  let endIdx = -1;

  if (!isMobile && props.rangeMap && props.rangeMap[currentVal]) {
    const range = props.rangeMap[currentVal];
    startIdx = range.start;
    endIdx = range.end;
  } else {
    startIdx = props.options.findIndex((o: Option) => o.value === currentVal);
    endIdx = startIdx;
  }

  if (startIdx === -1 || startIdx < 0 || startIdx >= props.options.length) return;

  const startEl = optionRefs.value[startIdx];
  const endEl = optionRefs.value[endIdx];

  if (!startEl || !endEl) return;

  const trackRect = trackRef.value?.getBoundingClientRect();
  const startRect = startEl.getBoundingClientRect();
  const endRect = endEl.getBoundingClientRect();

  const left = startRect.left - (trackRect?.left || 0);
  const width = (endRect.right - startRect.left);

  gsap.to(pillRef.value, {
    left: left,
    width: width,
    duration: 0.3,
    ease: 'power2.out'
  });

  optionRefs.value.forEach((el, idx) => {
    const isActive = (idx >= startIdx && idx <= endIdx);
    gsap.to(el, {
      color: isActive ? (isDarkMode() ? '#ffffff' : '#0f172a') : (isDarkMode() ? '#94a3b8' : '#64748b'),
      duration: 0.2,
      ease: 'linear'
    });
  });
};

const isDarkMode = () => {
  if (typeof document === 'undefined') return false;
  return document.documentElement.classList.contains('dark');
};

watch([() => props.modelValue, () => props.scrollProgress], updatePill);

onMounted(() => {
  updatePill();
});

watch(() => props.options, () => {
  updatePill();
}, { deep: true });
</script>

<style scoped>
.option-text {
  transition: none !important;
}
</style>