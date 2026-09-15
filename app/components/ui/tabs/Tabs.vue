<script setup lang="ts">
import { TabsRoot } from 'radix-vue'

defineProps<{
  defaultValue?: string
  modelValue?: string
}>()

const emit = defineEmits(['update:modelValue']);
</script>

<template>
  <TabsRoot 
    :default-value="defaultValue" 
    :model-value="modelValue"
    @update:model-value="(val) => emit('update:modelValue', val)"
    class="w-full"
  >
    <slot />
  </TabsRoot>
</template>