<script setup lang="ts">
import { TabsContent } from 'radix-vue'
import { cn } from '@/lib/utils.ts'

defineProps<{
  value: string
  classCn?: string
}>()
</script>

<template>
  <TabsContent 
    :value="value"
    :class="cn('mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2', classCn)"
  >
    <slot />
  </TabsContent>
</template>
