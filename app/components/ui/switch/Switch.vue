<script setup lang="ts">
import { SwitchRoot } from 'radix-vue'
import { cn } from '@/lib/utils'

defineProps<{
  modelValue?: boolean
  classCn?: string
}>()

const emit = defineEmits(['update:modelValue', 'update:checked'])

const handleCheckedChange = (checked: boolean) => {
  emit('update:modelValue', checked);
}
</script>

<template>
  <SwitchRoot 
    :checked="modelValue"
    @update:checked="handleCheckedChange"
    :class="cn(
      'group peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=unchecked]:bg-slate-200 data-[state=checked]:bg-blue-600 dark:data-[state=unchecked]:bg-slate-700 dark:data-[state=checked]:bg-blue-600',
      classCn
    )"
  >
    <span 
      class="pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform duration-200 group-data-[state=checked]:translate-x-5 group-data-[state=unchecked]:translate-x-0" 
    />
  </SwitchRoot>
</template>
