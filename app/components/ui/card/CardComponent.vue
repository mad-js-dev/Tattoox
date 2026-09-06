<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { cn } from "@/lib/utils"

const props = defineProps<{
  class?: HTMLAttributes["class"]
}>()
</script>

<template>
  <div
    :class="
      cn(
        'rounded-lg border bg-white/40 dark:bg-slate-900/40 backdrop-blur-md text-card-foreground shadow-sm',
        props.class,
      )"
  >
    <slot />
  </div>
</template>
