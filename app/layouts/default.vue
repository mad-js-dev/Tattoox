<script setup lang="ts">
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useI18n } from 'vue-i18n';
import { useDark, useToggle } from '@vueuse/core';

const { locale, setLocale } = useI18n();
const isDark = useDark();
const toggleDark = useToggle(isDark);

const switchLanguage = () => {
  setLocale(locale.value === 'es' ? 'en' : 'es');
};
</script>

<template>
  <div class="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
    <header class="border-b bg-white/50 dark:bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">T</div>
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

    <main class="max-w-7xl mx-auto p-6">
      <slot />
    </main>
  </div>
</template>

<style scoped>
/* Removed @apply bg-background to prevent PostCSS errors */
</style>
