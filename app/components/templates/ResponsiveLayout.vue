<template>
  <div class="flex flex-col w-full h-full gap-3">
    <!-- Header: Fills all available width -->
    <GlassPanel class="w-full shrink-0 rounded-2xl">
      <header class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-4">
        <div class="w-full md:w-auto text-left">
          <slot name="header" />
        </div>
        <div class="flex flex-col md:flex-row items-end md:items-center gap-3 w-full md:w-auto">
          <div class="w-full md:w-auto flex justify-end">
            <slot name="actions" />
          </div>
          <div class="w-full md:w-auto flex-shrink-0">
            <MultiValueSwitch 
              v-if="props.switchOptions"
              :options="props.switchOptions" 
              :model-value="props.switchModel"
              :range-map="props.switchRangeMap"
              :scroll-progress="computedScrollProgress"
              @update:model-value="$emit('update:switchModel', $event)"
            />
          </div>
        </div>
      </header>
    </GlassPanel>

    <!-- Columns Container: Horizontal scroll on mobile, grid-like on desktop -->
    <div ref="columnsContainer" class="flex flex-row overflow-x-auto snap-x snap-mandatory gap-3 no-scrollbar w-full flex-1">
      <!-- Column 1 -->
      <div ref="colRef1" class="min-w-full snap-center md:min-w-0 md:flex-1 h-full">
        <slot name="col1" />
      </div>
      <!-- Column 2 -->
      <div ref="colRef2" class="min-w-full snap-center md:min-w-0 md:flex-1 h-full">
        <slot name="col2" />
      </div>
      <!-- Column 3 -->
      <div ref="colRef3" class="min-w-full snap-center md:min-w-0 md:flex-1 h-full">
        <slot name="col3" />
      </div>
      <!-- Column 4 (Archive) -->
      <div 
        ref="colRef4" 
        class="min-w-full snap-center md:min-w-0 md:flex-1 h-full overflow-hidden"
        style="transition: none;"
      >
        <slot name="col4" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick, computed } from 'vue';
import MultiValueSwitch from '@/components/atoms/MultiValueSwitch.vue';
import GlassPanel from '@/components/atoms/GlassPanel.vue';
import gsap from 'gsap';

interface Props {
  switchModel: string;
  switchOptions?: any[];
  switchRangeMap?: any;
}

const props = defineProps<Props>();
const emit = defineEmits(['update:switchModel']);

const columnsContainer = ref<HTMLElement | null>(null);
const colRef1 = ref<HTMLElement | null>(null);
const colRef2 = ref<HTMLElement | null>(null);
const colRef3 = ref<HTMLElement | null>(null);
const colRef4 = ref<HTMLElement | null>(null);

const columnRefs = computed(() => [colRef1.value, colRef2.value, colRef3.value, colRef4.value]);

// State for continuous synchronization
const scrollProgress = ref(0);
const computedScrollProgress = computed(() => scrollProgress.value);
let activeObserver: IntersectionObserver | null = null;

const handleScroll = () => {
  const track = columnsContainer.value;
  if (!track) return;
  
  const maxScroll = track.scrollWidth - track.clientWidth;
  if (maxScroll <= 0) {
    scrollProgress.value = 0;
    return;
  }
  
  scrollProgress.value = track.scrollLeft / maxScroll;
};

const setupIntersectionObserver = () => {
  const options = {
    root: columnsContainer.value,
    threshold: 0.6 
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const idx = columnRefs.value.findIndex(ref => ref === entry.target);
        if (idx !== -1 && props.switchOptions) {
          const value = props.switchOptions[idx].value;
          if (value !== props.switchModel) {
            emit('update:switchModel', value);
          }
        }
      }
    });
  }, options);

  columnRefs.value.forEach(ref => {
    if (ref) observer.observe(ref);
  });

  return observer;
};

const handleAnimation = async () => {
  await nextTick();
  const isMobile = window.innerWidth < 768;
  const currentVal = props.switchModel;

  if (isMobile) {
    let targetIdx = -1;
    if (props.switchOptions) {
      targetIdx = props.switchOptions.findIndex((o: any) => o.value === currentVal);
    }

    if (targetIdx !== -1 && columnRefs.value[targetIdx]) {
        if (activeObserver) {
          activeObserver.disconnect();
          activeObserver = null;
        }

        columnRefs.value[targetIdx]?.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'start'
        });

        setTimeout(() => {
          if (window.innerWidth < 768) {
            activeObserver = setupIntersectionObserver();
          }
        }, 450);
    }
  } else {
    if (colRef4.value) {
      const el = colRef4.value;
      const track = columnsContainer.value;
      const measuredWidth = el.offsetWidth || 300; 
      const gapWidth = 12;
      const totalOffset = measuredWidth + gapWidth;

      if (currentVal === 'all') {
        if (track) track.style.overflow = 'hidden';
        el.style.display = 'block';
        gsap.to(el, {
          flexGrow: 1,
          flexBasis: '0%',
          x: 0,
          marginLeft: 0,
          opacity: 1,
          duration: 0.5,
          ease: 'power3.inOut'
        });
      } else if (currentVal === 'all_except_archive') {
        if (track) track.style.overflow = 'hidden';
        gsap.to(el, {
          flexGrow: 0,
          flexBasis: '0%',
          x: totalOffset,
          marginLeft: 0,
          opacity: 0,
          duration: 0.4,
          ease: 'power3.inOut',
          onComplete: () => {
            el.style.display = 'none';
            if (track) track.style.overflow = '';
          }
        });
      }
    }
  }
};

watch(() => props.switchModel, handleAnimation);

onMounted(() => {
  handleAnimation();
  if (window.innerWidth < 768) {
    activeObserver = setupIntersectionObserver();
    if (columnsContainer.value) {
      columnsContainer.value.addEventListener('scroll', handleScroll);
    }
  }
});

onUnmounted(() => {
  if (columnsContainer.value) {
    columnsContainer.value.removeEventListener('scroll', handleScroll);
  }
  activeObserver?.disconnect();
});
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
