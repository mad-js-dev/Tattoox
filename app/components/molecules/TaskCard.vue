<template>
  <div 
    :data-id="task.id" 
    class="group hover:shadow-md transition-all cursor-grab active:cursor-grabbing select-none"
    @click="$emit('click', task.id)"
  >
    <Card>
      <CardHeader class="p-3 pb-1">
        <div class="flex justify-between items-start mb-2">
          <Badge :class="priorityColor" class="text-[10px] uppercase font-bold">
            {{ t(`priorities.${task.priority}`) }}
          </Badge>
          <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button 
              variant="ghost" 
              size="icon" 
              class="w-6 h-6" 
              @click.stop="$emit('archive', task.id)"
            >
              <span class="text-xs">📦</span>
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              class="w-6 h-6" 
              @click.stop="$emit('delete', task.id)"
            >
              <span class="text-xs">🗑️</span>
            </Button>
          </div>
        </div>
        <CardTitle class="text-base font-semibold leading-tight">
          {{ task.title }}
        </CardTitle>
      </CardHeader>
      <CardContent class="p-3 pt-0">
        <p class="text-sm text-muted-foreground line-clamp-2 max-h-0 opacity-0 overflow-hidden transition-all duration-300 group-hover:max-h-20 group-hover:opacity-100 mb-0 group-hover:mb-4 translate-y-1 group-hover:translate-y-0">
          {{ task.description || t('task.description_none') }}
        </p>
        <div class="flex justify-between items-center">
          <span class="text-[10px] text-muted-foreground">ID: {{ task.id.slice(-4) }}</span>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card/index';
import { Badge } from '@/components/ui/badge/index';
import { Button } from '@/components/ui/button/index';

interface Task {
  id: string;
  title: string;
  description?: string;
  priority: string;
  status: string;
}

interface Props {
  task: Task;
  priorityColor: string;
  t: (key: string) => string;
}

defineProps<Props>();
defineEmits(['click', 'delete', 'archive']);
</script>
