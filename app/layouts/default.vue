<script setup lang="ts">
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useI18n } from 'vue-i18n';
import { useDark, useToggle } from '@vueuse/core';
import WebGLTestBackground from '../components/WebGLTestBackground.vue';

const { locale, setLocale } = useI18n();
const isDark = useDark();
const toggleDark = useToggle(isDark);

const switchLanguage = () => {
  setLocale(locale.value === 'es' ? 'en' : 'es');
};
</script>

<template>
  <div class="h-screen flex flex-col text-slate-900 dark:text-slate-100 transition-colors duration-300 overflow-hidden">
    <WebGLTestBackground />
    <header class="border-b bg-white/50 dark:bg-slate-900/50 backdrop-blur-md sticky top-0 z-50 flex-shrink-0">
      <div class="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 border-2 border-primary rounded-lg flex items-center justify-center text-primary font-bold">T</div>
          <span class="text-xl font-bold tracking-tight">Tattoox <span class="text-primary text-sm font-medium">Kanban</span></span>
        </div>

        <div class="flex items-center gap-3">
          <!-- Language Switcher -->
          <Button variant="ghost" size="sm" @click="switchLanguage" class="gap-2">
            {{ locale === 'es' ? '🇺🇸 EN' : '🇪🇸 ES' }}
          </Button>

          <!-- Theme Toggle -->
          <Button variant="ghost" size="icon" @click="toggleDark()" class="w-9 h-9">
            <span v-if="isDark">☀️</span>
            <span v-else>🌙</span>
          </Button>
        </div>
      </div>
    </header>

    <main class="flex-1 max-w-7xl mx-auto p-6 w-full overflow-hidden">
      <slot />
    </main>
  </div>
</template>

<style scoped>
/* Removed @apply bg-background to prevent PostCSS errors */
</style>
