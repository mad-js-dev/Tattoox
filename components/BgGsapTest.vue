<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import gsap from 'gsap';

const container = ref<HTMLElement | null>(null);
const dots = ref<HTMLElement[]>([]);

const DOT_SIZE = 8;
const SPACING = 20;

const getTCoords = (rows: number, cols: number) => {
  const coords: { r: number, c: number }[] = [];
  
  // Final balanced T dimensions
  const tHeight = 16; 
  const tWidth = 16;
  
  // Center the T in the grid
  const startCol = Math.floor((cols - tWidth) / 2);
  const startRow = Math.floor((rows - tHeight) / 2);
  
  const topBarHeight = 3; // Adjusted to 3 dots tall
  const stemWidth = 3;
  const stemOffset = Math.floor(stemWidth / 2);
  const midCol = startCol + Math.floor(tWidth / 2);

  // Top bar of the T
  for (let r = 0; r < topBarHeight; r++) {
    for (let c = 0; c < tWidth; c++) {
      coords.push({ r: startRow + r, c: startCol + c });
    }
  }
  // Stem of the T
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

const setupGrid = () => {
  if (!container.value) return;

  container.value.innerHTML = '';
  dots.value = [];
  
  const cols = Math.ceil(window.innerWidth / SPACING) + 1;
  const rows = Math.ceil(window.innerHeight / SPACING) + 1;
  
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
      });

      container.value!.appendChild(dot);
      dots.value.push(dot);

      const isPartOfT = tCoords.some(coord => coord.r === r && coord.c === c);
      gsap.set(dot, { opacity: isPartOfT ? 1 : 0.2 });
    }
  }

  dots.value.forEach(dot => {
    gsap.set(dot, { opacity: 0.1 });
  });

  const tDots = dots.value.filter((dot, i) => {
    const r = Math.floor(i / cols);
    const c = i % cols;
    return tCoords.some(coord => coord.r === r && coord.c === c);
  });
  
  const shuffledTDots = [...tDots].sort(() => Math.random() - 0.5);

  shuffledTDots.forEach((dot, i) => {
    const tl = gsap.timeline({
      repeat: -1,
      yoyo: true,
      repeatDelay: 1,
    });

    tl.to(dot, {
      opacity: 1,
      duration: 1.5,
      delay: i * 0.02,
      ease: 'power1.inOut'
    });
  });
};

onMounted(() => {
  setupGrid();
  window.addEventListener('resize', setupGrid);
});

onUnmounted(() => {
  window.removeEventListener('resize', setupGrid);
});
</script>

<template>
  <div 
    ref="container" 
    class="bg-gsap-test-container"
  >
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
}

.dot {
  will-change: transform, opacity;
}
</style>
