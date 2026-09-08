<script setup lang="ts">
import { onMounted, onUnmounted, ref, nextTick } from 'vue';
import gsap from 'gsap';

const container = ref<HTMLElement | null>(null);
const dots = ref<HTMLElement[]>([]);

const DOT_SIZE = 8;
const SPACING = 20;

const getTCoords = (rows: number, cols: number) => {
  const coords: { r: number, c: number }[] = [];
  const isMobile = window.innerWidth < 768;
  const tHeight = isMobile ? 10 : 16; 
  const tWidth = isMobile ? 10 : 16;
  const startCol = Math.floor((cols - tWidth) / 2);
  const startRow = Math.floor((rows - tHeight) / 2);
  const topBarHeight = isMobile ? 2 : 3; 
  const stemWidth = 3;
  const stemOffset = Math.floor(stemWidth / 2);
  const midCol = startCol + Math.floor(tWidth / 2);

  for (let r = 0; r < topBarHeight; r++) {
    for (let c = 0; c < tWidth; c++) {
      coords.push({ r: startRow + r, c: startCol + c });
    }
  }
  for (let r = topBarHeight; r < tHeight; r++) {
    for (let t = -stemOffset; t <= stemOffset; t++) {
      const c = midCol + t;
      if (c >= 0 && c < cols) {
        coords.push({ r: startRow + r, c });
      }
    }
  }
  return coords;
};

const setupGrid = async () => {
  if (!container.value) return;
  await nextTick();
  const width = container.value.clientWidth;
  const height = container.value.clientHeight;
  container.value.innerHTML = '';
  dots.value = [];
  const cols = Math.ceil(width / SPACING) + 1;
  const rows = Math.ceil(height / SPACING) + 1;
  const tCoords = getTCoords(rows, cols);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const dot = document.createElement('div');
      dot.className = 'dot';
      Object.assign(dot.style, {
        position: 'absolute',
        width: `${DOT_SIZE}px`,
        height: `${DOT_SIZE}px`,
        borderRadius: '50%',
        backgroundColor: '#cc0014',
        zIndex: '1',
        left: `${c * SPACING}px`,
        top: `${r * SPACING}px`,
        opacity: '0',
      });
      container.value!.appendChild(dot);
      dots.value.push(dot);
    }
  }
  const nonTDots = dots.value.filter((dot, i) => {
    const r = Math.floor(i / cols);
    const c = i % cols;
    return !tCoords.some(coord => coord.r === r && coord.c === c);
  });
  nonTDots.forEach((dot, i) => {
    const r = Math.floor(i / cols);
    const c = i % cols;
    gsap.to(dot, { opacity: 0.1, duration: 2, delay: (r + c) * 0.01, ease: 'power1.out' });
  });
  const tDots = dots.value.filter((dot, i) => {
    const r = Math.floor(i / cols);
    const c = i % cols;
    return tCoords.some(coord => coord.r === r && coord.c === c);
  });
  gsap.to(tDots, { opacity: 1, duration: 1, delay: 1, stagger: { amount: 0.5, from: 'random' }, ease: 'power2.out' });
  tDots.forEach((dot, i) => {
    const tl = gsap.timeline({ delay: 2.5, repeat: -1, yoyo: true, repeatDelay: 1 });
    tl.to(dot, { opacity: 0.1, duration: 1, ease: 'power2.in' })
      .to(dot, { opacity: 1, duration: 1.5, delay: Math.random() * 2, ease: 'power1.inOut' });
  });
};

onMounted(() => {
  setTimeout(setupGrid, 100);
  window.addEventListener('resize', setupGrid);
});

onUnmounted(() => {
  window.removeEventListener('resize', setupGrid);
});
</script>

<template>
  <div 
    ref="container" 
    class="bg-gsap-test-container bg-slate-100 dark:bg-slate-950"
  >
  </div>
</template>

<style scoped>
.bg-gsap-test-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  z-index: -1;
  pointer-events: none;
}
.dot {
  will-change: transform, opacity;
}
</style>
