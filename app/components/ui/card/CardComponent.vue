<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { cn } from "@/lib/utils"
import GlassPanel from '@/components/atoms/GlassPanel.vue'

const props = defineProps<{
  class?: HTMLAttributes["class"]
}>()
</script>

<template>
  <GlassPanel rounded="lg" :class="cn('text-card-foreground ', props.class)">
    <slot />
  </GlassPanel>
</template>
