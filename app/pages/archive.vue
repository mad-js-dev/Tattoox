<script setup lang="ts">
import { useKanbanStore } from '@/stores/useKanbanStore.ts';
import { Button } from '@/components/ui/button/index.ts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card/index.ts';
import { Badge } from '@/components/ui/badge/index.ts';
import { useRouter } from 'vue-router';
import { Archive, RotateCcw } from 'lucide-vue-next';

const store = useKanbanStore();
const router = useRouter();

const priorityColors: Record<string, string> = {
  LOW: 'bg-slate-400 text-white',
  MEDIUM: 'bg-yellow-500 text-white',
  HIGH: 'bg-red-500 text-white',
};
</script>

<template>
  <div class="space-y-8">
    <div class="flex justify-between items-center">
      <div>
        <h2 class="text-3xl font-bold tracking-tight">Archive</h2>
        <p class="text-muted-foreground">View and restore your archived tasks.</p>
      </div>
      <Button variant="outline" @click="router.push('/')" class="gap-2">
        Return to Board
      </Button>
    </div>

    <div v-if="store.archivedTasks.length === 0" class="text-center py-20">
      <Archive class="w-12 h-12 mx-auto text-muted-foreground opacity-20 mb-4" />
      <h3 class="text-lg font-medium">No archived tasks</h3>
      <p class="text-muted-foreground">Tasks you archive will appear here.</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="task in store.archivedTasks" 
        :key="task.id" 
        class="group hover:shadow-md transition-all"
      >
        <Card>
          <CardHeader class="p-4 pb-2">
            <div class="flex justify-between items-start mb-2">
              <Badge :class="priorityColors[task.priority]" class="text-[10px] uppercase font-bold">
                {{ task.priority }}
              </Badge>
              <Button 
                variant="ghost" 
                size="sm" 
                class="h-8 px-2 text-slate-500 hover:text-slate-900"
                @click="store.unarchiveTask(task.id)"
              >
                <RotateCcw class="w-3 h-3 mr-1" />
                Restore
              </Button>
            </div>
            <CardTitle class="text-lg font-semibold leading-tight">
              {{ task.title }}
            </CardTitle>
          </CardHeader>
          <CardContent class="p-4 pt-0">
            <p class="text-sm text-muted-foreground line-clamp-2">
              {{ task.description }}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>
