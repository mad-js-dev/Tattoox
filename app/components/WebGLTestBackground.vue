<template>
  <div 
    ref="container" 
    class="fixed inset-0" 
    style="z-index: -10; pointer-events: none; overflow: hidden; background-color: #ffffff;"
  >
    <div class="liquid-filter-wrapper">
      <div class="canvas-target"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import gsap from 'gsap';

const container = ref<HTMLElement | null>(null);
let app: any = null;
let blobs: any[] = [];
let mousePos = { x: 0, y: 0 };

onMounted(async () => {
  console.log('[InkBackground-Liquid] Mounting...');
  
  try {
    const PIXI = await import('pixi.js');
    app = new PIXI.Application();
    
    await app.init({
      resizeTo: window,
      backgroundAlpha: 0, 
      antialias: true,
    });
    
    const target = container.value?.querySelector('.canvas-target');
    if (target) {
      target.appendChild(app.canvas);
      app.canvas.style.position = 'absolute';
      app.canvas.style.top = '0';
      app.canvas.style.left = '0';
      app.canvas.style.width = '100vw';
      app.canvas.style.height = '100vh';
    }

    const blobCount = 15;
    const colors = [0x000000, 0x0a0a0a, 0x111111];

    const graphics = new PIXI.Graphics();
    graphics.circle(0, 0, 50);
    graphics.fill(0xffffff);
    const texture = app.renderer.generateTexture(graphics);

    for (let i = 0; i < blobCount; i++) {
      const blob = new PIXI.Sprite(texture);
      blob.anchor.set(0.5);
      blob.x = Math.random() * app.screen.width;
      blob.y = Math.random() * app.screen.height;
      
      const scale = 0.5 + Math.random() * 1.5; 
      blob.scale.set(scale);
      
      const color = colors[i % colors.length] ?? 0x000000;
      blob.tint = color;
      blob.alpha = 0.6; 

      const blur = new PIXI.BlurFilter();
      blur.strength = 15;
      
      // --- FIX: Remove "Frame" effect by expanding filter padding ---
      // Blur filters clip at the sprite's edge by default. 
      // We add padding to ensure the blur renders outside the sprite's bounding box.
      blur.padding = 100; 
      
      blob.filters = [blur];

      app.stage.addChild(blob);
      blobs.push(blob);

      gsap.to(blob, {
        x: () => Math.random() * app.screen.width,
        y: () => Math.random() * app.screen.height,
        duration: 10 + Math.random() * 10,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });
    }
    
    const handleMouseMove = (e: MouseEvent) => {
      mousePos.x = e.clientX / window.innerWidth;
      mousePos.y = e.clientY / window.innerHeight;
    };
    window.addEventListener('mousemove', handleMouseMove);

    app.ticker.add(() => {
      for (let i = 0; i < blobs.length; i++) {
        const blob = blobs[i];
        const dx = mousePos.x * app.screen.width - blob.x;
        const dy = mousePos.y * app.screen.height - blob.y;
        const distSq = dx * dx + dy * dy;
        if (distSq < 400000) {
          const dist = Math.sqrt(distSq);
          const force = (600 - dist) * 0.0002;
          blob.x += dx * force;
          blob.y += dy * force;
        }
      }
    });

    console.log('[InkBackground-Liquid] Fixed clipping edges. Setup complete.');
  } catch (err) {
    console.error('[InkBackground-Liquid] Critical Init Error:', err);
  }
});

onUnmounted(() => {
  gsap.killTweensOf('*');
  if (app) {
    app.destroy(true, { children: true, texture: true });
    app = null;
  }
});
</script>

<style scoped>
.liquid-filter-wrapper {
  filter: contrast(25) brightness(1.2); 
  width: 100%;
  height: 100%;
}

canvas {
  display: block;
  width: 100% !important;
  height: 100% !important;
}
</style>
