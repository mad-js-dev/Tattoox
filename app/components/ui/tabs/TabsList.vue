<script setup lang="ts">
import { TabsList } from 'radix-vue'
import { cn } from '../../../lib/utils.ts'

defineProps<{
  classCn?: string
}>()
</script>

<template>
  <TabsList 
    :class="cn('inline-flex h-10 items-center justify-center rounded-md bg-slate-100 p-1 text-slate-500 dark:bg-slate-800 dark:text-slate-400', classCn)"
  >
    <slot />
  </TabsList>
</template>