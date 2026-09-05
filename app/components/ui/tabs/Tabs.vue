<script setup lang="ts">
import { TabsRoot, TabsList, TabsTrigger, TabsContent } from 'radix-vue'
import { cn } from '@/lib/utils'

defineProps<{
  defaultValue?: string
  modelValue?: string
}>()
</script>

<template>
  <TabsRoot 
    :default-value="defaultValue" 
    :model-value="modelValue"
    class="w-full"
  >
    <slot />
  </TabsRoot>
</template>
