<template>
  <div ref="container" class="fixed inset-0" style="z-index: -10 !important; pointer-events: none; overflow: hidden;">
    <!-- Canvas will be injected here by PixiJS -->
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import gsap from 'gsap';

const container = ref<HTMLElement | null>(null);
let app: any = null;
let mousePos = { x: 0, y: 0 };
let blobs: any[] = [];

onMounted(async () => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const PIXI = await import('pixi.js');
    
    app = new PIXI.Application();
    await app.init({
      resizeTo: window,
      backgroundAlpha: 0,
      antialias: true,
    });

    if (container.value) {
      container.value.appendChild(app.canvas);
      app.canvas.style.position = 'absolute';
      app.canvas.style.top = '0';
      app.canvas.style.left = '0';
      app.canvas.style.width = '100vw';
      app.canvas.style.height = '100vh';
    } else {
      console.error('[InkBackground] Container ref is null!');
    }

    const blobCount = 6;
    const colors = [0x0a0a1a, 0x1a2a4a, 0x2a4a8a, 0x101030, 0x050515, 0x3a5a9a];

    const graphics = new PIXI.Graphics();
    graphics.circle(0, 0, 300);
    graphics.fill(0xffffff);
    const texture = app.renderer.generateTexture(graphics);

    for (let i = 0; i < blobCount; i++) {
      const blob = new PIXI.Sprite(texture);
      blob.anchor.set(0.5);
      blob.x = Math.random() * app.screen.width;
      blob.y = Math.random() * app.screen.height;
      
      const scale = 2 + Math.random() * 3;
      blob.scale.set(scale);
      
      const color = colors[i % colors.length];
      if (color !== undefined) {
        blob.tint = color;
      }
      
      const blur = new PIXI.BlurFilter();
      blur.strength = 40;
      blob.filters = [blur];
      blob.alpha = 0.6;

      app.stage.addChild(blob);
      blobs.push(blob);

      gsap.to(blob, {
        x: () => Math.random() * app.screen.width,
        y: () => Math.random() * app.screen.height,
        duration: 15 + Math.random() * 10,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });
    }

    app.ticker.add(() => {
      for (let i = 0; i < blobs.length; i++) {
        const blob = blobs[i];
        const dx = mousePos.x * app.screen.width - blob.x;
        const dy = mousePos.y * app.screen.height - blob.y;
        const distSq = dx * dx + dy * dy;
        if (distSq < 640000) {
          const force = (800 - Math.sqrt(distSq)) * 0.00015;
          blob.x += dx * force;
          blob.y += dy * force;
        }
      }
    });

    window.addEventListener('mousemove', (e) => {
      mousePos.x = e.clientX / window.innerWidth;
      mousePos.y = e.clientY / window.innerHeight;
    });
  } catch (err) {
    console.error('[InkBackground] Critical Init Error:', err);
  }
});

onUnmounted(() => {
  
  // 1. Stop ALL GSAP animations globally to be absolutely sure no zombies remain
  gsap.killTweensOf('*');

  // 2. Destroy the PIXI application and its resources
  if (app) {
    app.destroy(true, { children: true, texture: true });
    app = null;
  }
});
</script>

<style scoped>
canvas {
  display: block;
  width: 100% !important;
  height: 100% !important;
}
</style>
