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

onMounted(() => {
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
  if (evt.added) {
    // In vue-draggable-plus, evt.added is the DOM element itself
    const element = evt.added.element || evt.added;
    const taskId = element.getAttribute('data-id');
    if (!taskId) return;
    
    try {
      await store.moveTask(taskId, newStatus);
    } catch (e) {
      console.error('Failed to move task:', e);
    } finally {
      // Sync the active tab when dragging on mobile regardless of store result
      if (typeof window !== 'undefined' && window.innerWidth < 768) {
        activeColumn.value = newStatus;
      }
    }
  }
};

function scrollIntoArchive() {
  if (typeof window === 'undefined') return;
  setTimeout(() => {
    const archiveCol = document.querySelector('.kanban-column:last-child') as HTMLElement;
    archiveCol?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, 100);
}
</script>

<template>
  <div class="space-y-8">
    <div class="flex flex-row justify-between items-center gap-4">
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
    <div class="md:hidden">
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
      class="flex flex-row gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth md:overflow-visible no-scrollbar"
    >
      <div 
        v-for="col in columns" 
        :key="col.id" 
        :data-col-id="col.id"
        class="kanban-column flex flex-col gap-4 flex-1 min-w-full md:min-w-0 snap-center whitespace-normal"
        v-show="isColumnVisible(col.id)"
      >
        <div class="flex items-center justify-between px-2">
          <div class="flex items-center gap-2">
            <h3 class="font-semibold text-lg">{{ col.label }}</h3>
            <Badge variant="outline" class="rounded-full">
              {{ col.id === 'ARCHIVE' ? store.archivedTasks.length : store.tasksByStatus(col.id).length }}
            </Badge>
          </div>
        </div>

        <div :class="['flex flex-col gap-3 p-3 rounded-xl min-h-[500px] border-2 border-dashed', col.color]">
          <VueDraggable
            :model-value="(col.id === 'ARCHIVE' ? store.archivedTasks : store.tasksByStatus(col.id))"
            group="tasks"
            ghost-class="draggable-ghost"
            @change="(evt) => onTaskMove(evt, col.id)"
          >
            <div 
              v-for="task in (col.id === 'ARCHIVE' ? store.archivedTasks : store.tasksByStatus(col.id))" 
              :key="task.id" 
              :data-id="task.id"
              class="group hover:shadow-md transition-all cursor-pointer" 
              @click="router.push(`/task/${task.id}`)"
            >
              <Card>
                <CardHeader class="p-4 pb-2">
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
                <CardContent class="p-4 pt-0">
                  <p class="text-sm text-muted-foreground line-clamp-2 mb-4">
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
          
          <div v-if="(col.id === 'ARCHIVE' ? store.archivedTasks : store.tasksByStatus(col.id)).length === 0" class="flex-1 flex items-center justify-center text-muted-foreground text-sm italic opacity-50">
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
</style>
