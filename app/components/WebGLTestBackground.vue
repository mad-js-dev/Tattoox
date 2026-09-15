<template>
  <div 
    ref="container" 
    class="fixed inset-0" 
    style="z-index: -10; pointer-events: none; overflow: hidden; background-color: #ffffff;"
  >
    <div class="canvas-target"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import * as THREE from 'three';

const props = defineProps({
  theme: {
    type: String,
    default: 'light' // 'light' or 'dark'
  }
});

const container = ref<HTMLElement | null>(null);
let renderer: THREE.WebGLRenderer | null = null;
let scene: THREE.Scene | null = null;
let camera: THREE.PerspectiveCamera | null = null;
let liquidMesh: THREE.Mesh | null = null;
let animationId: number | null = null;

// RTT (Render-to-Texture) State
let inkRenderTarget: THREE.WebGLRenderTarget | null = null;
let inkScene: THREE.Scene | null = null;
let inkCamera: THREE.OrthographicCamera | null = null;

// Cycle State
let globalSaturation = 0.0;
let globalFade = 1.0; 
let isFading = false;
let currentTheme: 'BLACK' | 'WHITE' = 'WHITE';

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  varying vec2 vUv;
  uniform float uTime;
  uniform sampler2D uInkTexture;
  uniform vec3 uThemeColor;
  uniform vec3 uBaseColor;
  uniform float uGlobalSaturation;
  uniform float uGlobalFade;
  uniform vec3 uFadeStartColor;
  uniform vec3 uLightPos;

  // Helper for the "Studio Shine" - calculating the gradient of the ink
  vec3 calculateNormal(sampler2D tex, vec2 uv) {
    float offset = 0.002;
    float left = texture2D(tex, uv + vec2(-offset, 0.0)).r;
    float right = texture2D(tex, uv + vec2(offset, 0.0)).r;
    float up = texture2D(tex, uv + vec2(0.0, offset)).r;
    float down = texture2D(tex, uv + vec2(0.0, -offset)).r;
    
    return normalize(vec3(left - right, down - up, 0.2));
  }

  void main() {
    float ink = texture2D(uInkTexture, vUv).r;
    
    // 1. DEPTH & SATURATION: Ink is darker/more saturated in the center
    vec3 inkColor = uThemeColor;
    float thickness = smoothstep(0.0, 1.0, ink);
    
    // Logic to darken if black ink, lighten if white ink
    float isBlackInk = step(0.5, uThemeColor.r); 
    vec3 depthColor = mix(uThemeColor, uThemeColor * (isBlackInk == 0.0 ? 0.7 : 1.3), thickness * 0.3);
    
    vec3 saturatedColor = mix(uBaseColor, depthColor, max(ink, uGlobalSaturation));
    
    // 2. SPECULAR SHINE: Calculate highlights based on the ink "slope"
    vec3 normal = calculateNormal(uInkTexture, vUv);
    vec3 lightDir = normalize(uLightPos);
    float spec = pow(max(dot(normal, lightDir), 0.0), 32.0);
    vec3 highlight = vec3(1.0) * spec * ink * 0.8;
    
    // 3. STUDIO REFLECTION: Fake a soft environment reflection
    float env = (vUv.y * 0.2) + 0.1;
    vec3 reflection = vec3(env) * ink * 0.3;
    
    vec3 finalInk = saturatedColor + highlight + reflection;
    vec3 finalColor = mix(uFadeStartColor, finalInk, uGlobalFade);
    
    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

const splatVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const splatFragmentShader = `
  varying vec2 vUv;
  uniform float uSeed;
  uniform vec3 uThemeColor;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }

  void main() {
    vec2 uv = vUv * 2.0 - 1.0;
    float dist = length(uv);
    float angle = atan(uv.y, uv.x);
    float irregularity = noise(vec2(angle * 2.0, uSeed)) * 0.6;
    float distortedDist = dist / (1.0 + irregularity);
    float mask = smoothstep(0.6, 0.4, distortedDist);
    gl_FragColor = vec4(mask, mask, mask, 1.0);
  }
`;

const updateThemeColors = (target: 'light' | 'dark') => {
  if (!liquidMesh) return;
  const mat = liquidMesh.material as THREE.ShaderMaterial;
  const isLight = target === 'light';
  
  if (mat.uniforms) {
    if (mat.uniforms.uBaseColor) mat.uniforms.uBaseColor.value.set(isLight ? 0xFAFAFA : 0x1A1A1A);
    if (mat.uniforms.uThemeColor) mat.uniforms.uThemeColor.value.set(isLight ? 0x000000 : 0xffffff);
    if (mat.uniforms.uFadeStartColor) mat.uniforms.uFadeStartColor.value.set(isLight ? 0xffffff : 0x000000);
  }
  
  currentTheme = isLight ? 'BLACK' : 'WHITE';
};

watch(() => props.theme, (newTheme) => {
  updateThemeColors(newTheme as 'light' | 'dark');
}, { immediate: true });

onMounted(async () => {
  try {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 20, 0);
    camera.lookAt(0, 0, 0);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    const target = container.value?.querySelector('.canvas-target');
    if (target) {
      target.appendChild(renderer.domElement);
      renderer.domElement.style.position = 'absolute';
      renderer.domElement.style.top = '0';
      renderer.domElement.style.left = '0';
      renderer.domElement.style.width = '100vw';
      renderer.domElement.style.height = '100vh';
    }

    inkRenderTarget = new THREE.WebGLRenderTarget(2048, 2048, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat
    });

    inkScene = new THREE.Scene();
    inkCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    inkCamera.position.z = 1;

    const geometry = new THREE.PlaneGeometry(200, 200);
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uBaseColor: { value: new THREE.Color(0xFAFAFA) },
        uThemeColor: { value: new THREE.Color(0x000000) },
        uGlobalSaturation: { value: 0.0 },
        uGlobalFade: { value: 1.0 },
        uFadeStartColor: { value: new THREE.Color(0xffffff) },
        uLightPos: { value: new THREE.Vector3(10, 10, 10) },
        uInkTexture: { value: inkRenderTarget.texture }
      },
      vertexShader,
      fragmentShader,
      side: THREE.DoubleSide
    });

    liquidMesh = new THREE.Mesh(geometry, material);
    liquidMesh.rotation.x = -Math.PI / 2;
    scene.add(liquidMesh);

    updateThemeColors(props.theme as 'light' | 'dark');

    const growingDrops: { mesh: THREE.Mesh, scale: number, targetScale: number, time: number }[] = [];

    const spawnRefinedDrop = () => {
      if (!renderer || !inkRenderTarget || !inkScene || !inkCamera) return;
      const x = (Math.random() - 0.5) * 1.6;
      const y = (Math.random() - 0.5) * 1.6;
      const isLargeSplat = Math.random() > 0.8;
      const startSize = isLargeSplat 
        ? 0.04 + Math.random() * 0.12 
        : 0.01 + Math.random() * 0.02;
      const targetSize = startSize * (isLargeSplat ? 1.3 + Math.random() * 0.5 : 1.1 + Math.random() * 0.2);
      
      const dropGeo = new THREE.PlaneGeometry(1, 1);
      const dropMat = new THREE.ShaderMaterial({
        uniforms: {
          uSeed: { value: Math.random() * 100.0 },
          uThemeColor: { value: new THREE.Color(currentTheme === 'BLACK' ? 0x000000 : 0xffffff) }
        },
        vertexShader: splatVertexShader,
        fragmentShader: splatFragmentShader,
        transparent: true,
        blending: THREE.AdditiveBlending
      });
      
      const drop = new THREE.Mesh(dropGeo, dropMat);
      drop.position.set(x, y, 0);
      drop.scale.set(startSize, startSize, 1);
      inkScene.add(drop);
      
      growingDrops.push({
        mesh: drop,
        scale: startSize,
        targetScale: targetSize,
        time: 0
      });
    };

    const animate = (time: number) => {
      if (!renderer || !scene || !camera || !liquidMesh) return;
      
      if (isFading) {
        globalFade += 0.008;
        if (globalFade >= 1.0) {
          globalFade = 1.0;
          globalSaturation = 0.0;
          isFading = false;
          
          const mat = liquidMesh.material as THREE.ShaderMaterial;
          const isBlack = currentTheme === 'BLACK';
          if (mat.uniforms) {
            if (mat.uniforms.uBaseColor) mat.uniforms.uBaseColor.value.set(isBlack ? 0xFAFAFA : 0x1A1A1A);
            if (mat.uniforms.uThemeColor) mat.uniforms.uThemeColor.value.set(isBlack ? 0x000000 : 0xffffff);
            if (mat.uniforms.uFadeStartColor) mat.uniforms.uFadeStartColor.value.set(0xffffff);
          }
          
          renderer.setRenderTarget(inkRenderTarget);
          renderer.clear();
          renderer.setRenderTarget(null);
          
          if (inkScene) {
            const currentInkS = inkScene;
            growingDrops.forEach(gd => {
              if (gd.mesh) currentInkS.remove(gd.mesh);
            });
          }
          growingDrops.length = 0;
        }
      } else {
        for (let i = 0; i < 10; i++) {
          if (Math.random() < 0.5) spawnRefinedDrop();
        }
        globalSaturation += 0.001;
        if (globalSaturation >= 1.0) {
          globalFade = 0.0;
          isFading = true;
        }
      }

      for (let i = growingDrops.length - 1; i >= 0; i--) {
        const gd = growingDrops[i];
        if (!gd) continue;
        gd.time += 0.016;
        gd.scale = gd.scale + (gd.targetScale - gd.scale) * 0.1;
        gd.mesh.scale.set(gd.scale, gd.scale, 1);
        
        if (renderer && inkRenderTarget && inkScene && inkCamera) {
          renderer.setRenderTarget(inkRenderTarget);
          renderer.render(inkScene, inkCamera);
          renderer.setRenderTarget(null);
        }

        if (Math.abs(gd.scale - gd.targetScale) < 0.001) {
          growingDrops.splice(i, 1);
        }
      }

      const material = liquidMesh.material as THREE.ShaderMaterial;
      if (material.uniforms) {
        if (material.uniforms.uTime) material.uniforms.uTime.value = time * 0.001;
        if (material.uniforms.uGlobalSaturation) material.uniforms.uGlobalSaturation.value = globalSaturation;
        if (material.uniforms.uGlobalFade) material.uniforms.uGlobalFade.value = globalFade;
      }
      
      renderer.render(scene, camera);
      animationId = requestAnimationFrame(animate);
    };
    animationId = requestAnimationFrame(animate);

    window.addEventListener('resize', () => {
      if (!camera || !renderer) return;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

  } catch (err) {
    console.error('[LiquidBackground-Three] Init Error:', err);
  }
});

onUnmounted(() => {
  if (animationId) cancelAnimationFrame(animationId);
  renderer?.dispose();
  scene?.clear();
});
</script>

<style scoped>
.canvas-target {
  width: 100%;
  height: 100%;
}
</style>