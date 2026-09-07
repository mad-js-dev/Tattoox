<script setup lang="ts">
import { onMounted, ref } from 'vue';
import gsap from 'gsap';

const container = ref<HTMLElement | null>(null);
const dots = ref<HTMLElement[]>([]);

const GRID_SIZE = 21; // 21x21 grid
const DOT_SIZE = 8;
const SPACING = 20;
const TOP_BAR_HEIGHT = 5;
const STEM_WIDTH = 4;

const getTCoords = () => {
  const coords: { r: number, c: number }[] = [];
  const mid = Math.floor(GRID_SIZE / 2);
  const stemOffset = Math.floor(STEM_WIDTH / 2);

  // Top bar of the T
  for (let r = 0; r < TOP_BAR_HEIGHT; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      coords.push({ r, c });
    }
  }
  // Stem of the T
  for (let r = TOP_BAR_HEIGHT; r < GRID_SIZE; r++) {
    for (let t = -stemOffset; t <= stemOffset; t++) {
      const c = mid + t;
      if (c >= 0 && c < GRID_SIZE) {
        coords.push({ r, c });
      }
    }
  }
  return coords;
};

onMounted(() => {
  if (!container.value) return;

  const setupGrid = () => {
    // Clear existing dots
    container.value!.innerHTML = '';
    dots.value = [];
    
    const tCoords = getTCoords();
    const gridWidth = (GRID_SIZE - 1) * SPACING;
    const gridHeight = (GRID_SIZE - 1) * SPACING;
    const offsetX = (window.innerWidth - gridWidth) / 2;
    const offsetY = (window.innerHeight - gridHeight) / 2;

    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        const dot = document.createElement('div');
        dot.className = 'dot';
        
        Object.assign(dot.style, {
          position: 'absolute',
          width: `${DOT_SIZE}px`,
          height: `${DOT_SIZE}px`,
          borderRadius: '50%',
          backgroundColor: '#cc0014',
          zIndex: '1',
          left: `${offsetX + c * SPACING}px`,
          top: `${offsetY + r * SPACING}px`,
        });

        container.value!.appendChild(dot);
        dots.value.push(dot);

        const isPartOfT = tCoords.some(coord => coord.r === r && coord.c === c);
        gsap.set(dot, { opacity: isPartOfT ? 1 : 0.2 });
      }
    }

    // 1. Initialize all dots to low opacity immediately
    dots.value.forEach(dot => {
      gsap.set(dot, { opacity: 0.1 });
    });

    // 2. Filter and shuffle only the dots that should become bright (the "T")
    const tDots = dots.value.filter((dot, i) => {
      const r = Math.floor(i / GRID_SIZE);
      const c = i % GRID_SIZE;
      return tCoords.some(coord => coord.r === r && coord.c === c);
    });
    
    const shuffledTDots = [...tDots].sort(() => Math.random() - 0.5);

    // 3. Animate only the "T" dots appearing and disappearing in a loop
    shuffledTDots.forEach((dot, i) => {
      const tl = gsap.timeline({
        repeat: -1,
        yoyo: true, // Reverse the animation back to original state
        repeatDelay: 1, // Wait 1 second before reversing
      });

      tl.to(dot, {
        opacity: 1,
        duration: 1.5,
        delay: i * 0.02,
        ease: 'power1.inOut'
      });
    });
  };

  setupGrid();
  window.addEventListener('resize', setupGrid);
});
</script>

<template>
  <div 
    ref="container" 
    class="bg-gsap-test-container"
  >
    <div style="position: absolute; top: 10px; left: 10px; color: red; z-index: 10000; font-weight: bold; font-size: 20px;">BG COMPONENT ACTIVE</div>
  </div>
</template>

<style scoped>
.bg-gsap-test-container {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  z-index: -1;
  background: transparent;
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dot {
  will-change: transform, opacity;
}
</style>
