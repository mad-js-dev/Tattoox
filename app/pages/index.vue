<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useKanbanStore } from '@/stores/useKanbanStore';
import { useRouter } from 'vue-router';
import { VueDraggable } from 'vue-draggable-plus';
import gsap from 'gsap';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-vue-next';
import Tabs from '@/components/ui/tabs/Tabs.vue';
import TabsList from '@/components/ui/tabs/TabsList.vue';
import TabsTrigger from '@/components/ui/tabs/TabsTrigger.vue';
import Switch from '@/components/ui/switch/Switch.vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const store = useKanbanStore();
const router = useRouter();
const isDialogOpen = ref(false);

// Navigation state
const activeColumn = ref('TODO');
const showArchive = ref(false);

const newTask = ref({
  title: '',
  description: '',
  status: 'TODO',
  priority: 'MEDIUM'
});

const handleAddTask = async () => {
  if (!newTask.value.title) return;
  await store.addTask({
    title: newTask.value.title,
    description: newTask.value.description,
    status: newTask.value.status as any,
    priority: newTask.value.priority as any,
  });
  newTask.value = { title: '', description: '', status: 'TODO', priority: 'MEDIUM' };
  isDialogOpen.value = false;
};

const columns = computed(() => [
  { id: 'TODO', label: t('statuses.TODO'), color: 'bg-slate-100 dark:bg-slate-900' },
  { id: 'IN_PROGRESS', label: t('statuses.IN_PROGRESS'), color: 'bg-blue-50 dark:bg-blue-900/20' },
  { id: 'DONE', label: t('statuses.DONE'), color: 'bg-green-50 dark:bg-green-900/20' },
  { id: 'ARCHIVE', label: t('board.archive'), color: 'bg-slate-50 dark:bg-slate-800/50' },
]);

const priorityColors: Record<string, string> = {
  LOW: 'bg-slate-400 text-white',
  MEDIUM: 'bg-yellow-500 text-white',
  HIGH: 'bg-red-500 text-white',
};

const isColumnVisible = (colId: string) => {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  if (isMobile) {
    return true;
  } else {
    if (colId === 'ARCHIVE') return showArchive.value;
    return true;
  }
};

const boardContainer = ref<HTMLElement | null>(null);

// Intersection Observer to sync activeColumn with the visible column on mobile
let observer: IntersectionObserver | null = null;

onMounted(async () => {
  // 1. Hydrate store from server/local first
  await store.loadTasks();

  if (typeof window === 'undefined' || window.innerWidth >= 768) return;

  observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const colId = entry.target.getAttribute('data-col-id');
        if (colId) {
          activeColumn.value = colId;
        }
      }
    });
  }, {
    threshold: 0.6, // Trigger when 60% of the column is visible
  });

  // Observe all columns
  const columns = document.querySelectorAll('.kanban-column');
  columns.forEach((col) => observer?.observe(col));
});

onUnmounted(() => {
  observer?.disconnect();
});

watch(activeColumn, (newCol) => {
  if (typeof window === 'undefined' || window.innerWidth >= 768) return;
  const colIndex = columns.value.findIndex(col => col.id === newCol);
  if (colIndex === -1 || !boardContainer.value) return;
  const columnElements = boardContainer.value.querySelectorAll('.kanban-column');
  const targetElement = columnElements[colIndex] as HTMLElement;
  if (targetElement) {
    gsap.to(boardContainer.value, {
      scrollLeft: targetElement.offsetLeft,
      duration: 0.6,
      ease: 'power2.out',
      overwrite: true
    });
  }
});

const onTaskMove = async (evt: any, newStatus: string) => {
  console.log('onTaskMove triggered:', { evt, newStatus });
  
  const data = evt.detail || evt;
  
  // Based on your logs: data is a CustomEvent with { to, from, item, ... }
  // Movement between columns is indicated when 'to' and 'from' are different
  const isColumnChange = data.to && data.from && data.to !== data.from;
  const isAdded = data.added;
  
  if (isAdded || isColumnChange) {
    console.log('Movement detected. New status:', newStatus);
    
    // The element is usually in data.item or data.added
    const draggedElement = data.added?.element || data.added || data.item || evt.item;
    
    if (!draggedElement) {
      console.error('Could not find the dragged element in event data');
      return;
    }

    // Look for data-id on the element or its closest parent/child
    const taskId = draggedElement.getAttribute?.('data-id') || 
                   draggedElement.closest?.('[data-id]')?.getAttribute('data-id') ||
                   draggedElement.querySelector?.('[data-id]')?.getAttribute('data-id') || 
                   draggedElement['data-id'];
    
    console.log('Resolved Task ID:', taskId);
    if (!taskId) {
      console.error('No task ID found on the dragged element', draggedElement);
      return;
    }
    
    try {
      await store.moveTask(taskId, newStatus);
      console.log('Successfully moved task', taskId, 'to', newStatus);
    } catch (e) {
      console.error('Store moveTask failed:', e);
    } finally {
      if (typeof window !== 'undefined' && window.innerWidth < 768) {
        activeColumn.value = newStatus;
      }
    }
  } else if (data.moved || (data.item && data.to === data.from)) {
    console.log('Item moved within the same column:', newStatus);
  } else {
    console.log('onTaskMove triggered but no recognized movement pattern found:', data);
  }
};

const onDragStart = (evt: any) => {
  gsap.to(evt.item, {
    scale: 1.05,
    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    duration: 0.3,
    ease: 'power2.out',
    zIndex: 1000
  });
};

const onDragEnd = (evt: any) => {
  gsap.to(evt.item, {
    scale: 1,
    boxShadow: 'none',
    duration: 0.3,
    ease: 'power2.in',
    zIndex: 1
  });
};

const scrollIntoArchive = () => {
  if (!boardContainer.value) return;
  const archiveCol = boardContainer.value.querySelector('[data-col-id=\"ARCHIVE\"]') as HTMLElement;
  if (archiveCol) {
    gsap.to(boardContainer.value, {
      scrollLeft: archiveCol.offsetLeft,
      duration: 0.6,
      ease: 'power2.out',
      overwrite: true
    });
  }
};
</script>

<template>
  <div class="space-y-6 h-full flex flex-col">
    <div class="flex flex-row justify-between items-center gap-4 flex-shrink-0">
      <div>
        <h2 class="text-3xl font-bold tracking-tight">{{ $t('board.title') }}</h2>
        <p class="text-muted-foreground">{{ $t('board.subtitle') }}</p>
      </div>
      
      <div class="flex items-center gap-4 flex-shrink-0">
        <!-- Desktop Archive Toggle -->
        <div class="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800">
          <span class="text-xs font-medium">{{ $t('board.show_archive') }}</span>
          <Switch :checked="showArchive" @update:checked="(val: boolean) => { 
            showArchive = val; 
            if (val) {
              scrollIntoArchive();
            }
          }" />
        </div>

        <Dialog v-model:open="isDialogOpen">
          <DialogTrigger as-child>
            <Button class="gap-2">
              <Plus class="w-4 h-4" />
              {{ $t('board.new_task') }}
            </Button>
          </DialogTrigger>
          <DialogContent class="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{{ $t('task.create_title') }}</DialogTitle>
              <DialogDescription>{{ $t('task.create_description') }}</DialogDescription>
            </DialogHeader>
            <div class="grid gap-4 py-4">
              <div class="grid gap-2">
                <label class="text-sm font-medium">{{ $t('task.title') }}</label>
                <Input v-model="newTask.title" :placeholder="$t('task.title_placeholder')" />
              </div>
              <div class="grid gap-2">
                <label class="text-sm font-medium">{{ $t('task.description') }}</label>
                <Textarea v-model="newTask.description" :placeholder="$t('task.description_placeholder')" />
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div class="grid gap-2">
                  <label class="text-sm font-medium">{{ $t('task.priority') }}</label>
                  <Select v-model="newTask.priority">
                    <SelectTrigger>
                      <SelectValue :placeholder="$t('task.priority_placeholder')" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">{{ $t('priorities.LOW') }}</SelectItem>
                      <SelectItem value="MEDIUM">{{ $t('priorities.MEDIUM') }}</SelectItem>
                      <SelectItem value="HIGH">{{ $t('priorities.HIGH') }}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div class="grid gap-2">
                  <label class="text-sm font-medium">{{ $t('task.status') }}</label>
                  <Select v-model="newTask.status">
                    <SelectTrigger>
                      <SelectValue :placeholder="$t('task.status_placeholder')" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TODO">{{ $t('statuses.TODO') }}</SelectItem>
                      <SelectItem value="IN_PROGRESS">{{ $t('statuses.IN_PROGRESS') }}</SelectItem>
                      <SelectItem value="DONE">{{ $t('statuses.DONE') }}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" @click="isDialogOpen = false">{{ $t('task.cancel') }}</Button>
              <Button @click="handleAddTask">{{ $t('board.create_task') }}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>

    <!-- Mobile Navigation Tabs -->
    <div class="md:hidden flex-shrink-0">
      <Tabs v-model="activeColumn" defaultValue="TODO">
        <TabsList class="w-full justify-start overflow-x-auto">
          <TabsTrigger v-for="col in columns" :key="col.id" :value="col.id" class="flex-1">
            {{ col.label }}
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>

    <div 
      ref="boardContainer"
      class="flex flex-row gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth w-full no-scrollbar flex-1 min-h-0"
    >
      <div 
        v-for="col in columns" 
        :key="col.id" 
        :data-col-id="col.id"
        class="kanban-column flex flex-col gap-2 flex-1 min-w-full md:min-w-0 snap-center whitespace-normal h-full"
        v-show="isColumnVisible(col.id)"
      >
        <div class="flex items-center justify-between px-2 flex-shrink-0">
          <div class="flex items-center gap-2">
            <h3 class="font-semibold text-lg">{{ col.label }}</h3>
            <Badge variant="outline" class="rounded-full">
              {{ col.id === 'ARCHIVE' ? store.archivedTasks.length : store.tasksByStatus(col.id).length }}
            </Badge>
          </div>
        </div>

        <div :class="['flex flex-col gap-2 p-2 rounded-xl border-2 border-dashed overflow-y-auto flex-1 relative', col.color]"
             style="min-height: 150px;">
          <VueDraggable
            :model-value="(col.id === 'ARCHIVE' ? store.archivedTasks : store.tasksByStatus(col.id))"
            group="tasks"
            ghost-class="draggable-ghost"
            :animation="200"
            :key="col.id + (col.id === 'ARCHIVE' ? store.archivedTasks.length : store.tasksByStatus(col.id).length)"
            @start="onDragStart"
            @end="onDragEnd"
            @change="(evt) => onTaskMove(evt, col.id)"
            :disabled="false"
            class="h-full w-full"
          >
            <div 
              v-for="task in (col.id === 'ARCHIVE' ? store.archivedTasks : store.tasksByStatus(col.id))" 
              :key="task.id" 
              :data-id="task.id"
              class="group hover:shadow-md transition-all cursor-pointer" 
              @click="router.push(`/task/${task.id}`)"
            >
              <Card>
                <CardHeader class="p-3 pb-1">
                  <div class="flex justify-between items-start mb-2">
                    <Badge :class="priorityColors[task.priority]" class="text-[10px] uppercase font-bold">
                      {{ $t('priorities.' + task.priority) }}
                    </Badge>
                    <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                       <Button variant="ghost" size="icon" class="w-6 h-6" @click.stop="col.id === 'ARCHIVE' ? store.unarchiveTask(task.id) : store.archiveTask(task.id)">
                         <span class="text-xs">📦</span>
                       </Button>
                       <Button variant="ghost" size="icon" class="w-6 h-6" @click.stop="store.deleteTask(task.id)">
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
                    {{ task.description || $t('task.description_none') }}
                  </p>
                  <div class="flex justify-between items-center">
                    <span class="text-[10px] text-muted-foreground">ID: {{ task.id.slice(-4) }}</span>
                    <div class="flex gap-1">
                      <Button 
                        v-if="task.status !== 'TODO' && col.id !== 'ARCHIVE'" 
                        variant="ghost" 
                        size="sm" 
                        class="h-7 px-2 text-xs"
                        @click.stop="store.updateTask({ id: task.id, status: 'TODO' })"
                      >
                        ←
                      </Button>
                      <Button 
                        v-if="task.status !== 'DONE' && col.id !== 'ARCHIVE'" 
                        variant="ghost" 
                        size="sm" 
                        class="h-7 px-2 text-xs"
                        @click.stop="store.updateTask({ id: task.id, status: col.id === 'DONE' ? 'DONE' : 'IN_PROGRESS' })"
                      >
                        →
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </VueDraggable>
          
          <div v-if="(col.id === 'ARCHIVE' ? store.archivedTasks : store.tasksByStatus(col.id)).length === 0" class="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm italic opacity-50 pointer-events-none">
            {{ $t('board.no_tasks') }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.draggable-ghost {
  opacity: 0.5 !important;
  background-color: #e2e8f0 !important;
}

/* Custom thin scrollbars for columns */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.3);
  border-radius: 10px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: rgba(156, 163, 175, 0.5);
}

.overflow-y-auto {
  scrollbar-width: thin;
  scrollbar-color: rgba(156, 163, 175, 0.3) transparent;
}
</style>
