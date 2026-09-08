<template>
  <div class="space-y-6 h-full flex flex-col relative">
    <BgGsapTest />
    
    <!-- Board Header Panel -->
    <div 
      ref="headerRef"
      class="flex flex-row justify-between items-center gap-4 flex-shrink-0 p-0 rounded-2xl shadow-lg transition-all duration-500 relative overflow-hidden"
      style="border: 1px solid rgba(255, 255, 255, 0.1); border-top: 1px solid rgba(255, 255, 255, 0.4); box-shadow: inset 0 1px 0 0 rgba(255, 255, 255, 0.3);"
    >
      <GlassLens :target="headerRef" />
      <div class="relative z-10 flex flex-row justify-between items-center gap-4 w-full h-full p-4">
        <div>
          <h2 class="text-3xl font-bold tracking-tight">{{ t('board.title') }}</h2>
          <p class="text-muted-foreground">{{ t('board.subtitle') }}</p>
        </div>
        
        <div class="flex items-center gap-4 flex-shrink-0">
          <div class="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100/50 dark:bg-slate-800/50 relative z-[100] pointer-events-auto">
            <span class="text-xs font-medium">{{ showArchive ? t('board.hide_archive') : t('board.show_archive') }}</span>
            <Switch v-model="showArchive" />
          </div>

          <Dialog :open="isDialogOpen" @update:open="handleOpenChange">
            <DialogTrigger as-child>
              <Button class="gap-2">
                <Plus class="w-4 h-4" />
                {{ t('board.new_task') }}
              </Button>
            </DialogTrigger>
            <DialogContent 
              ref="dialogContentRef"
              class="w-[90vw] max-w-[425px] glass-primary bg-white/70 backdrop-blur-md border-white/80 dark:bg-transparent dark:border-white/10 shadow-2xl mx-auto rounded-2xl"
            >
              <DialogHeader>
                <DialogTitle>{{ t('task.create_title') }}</DialogTitle>
                <DialogDescription>{{ t('task.create_description') }}</DialogDescription>
              </DialogHeader>
              <div class="grid gap-4 py-4">
                <div class="grid gap-2">
                  <label class="text-sm font-medium">{{ t('task.title') }}</label>
                  <Input v-model="newTask.title" :placeholder="t('task.title_placeholder')" />
                </div>
                <div class="grid gap-2">
                  <label class="text-sm font-medium">{{ t('task.description') }}</label>
                  <Textarea v-model="newTask.description" :placeholder="t('task.description_placeholder')" />
                </div>
                <div class="grid grid-cols-2 gap-4">
                  <div class="grid gap-2">
                    <label class="text-sm font-medium">{{ t('task.priority') }}</label>
                    <Select v-model="newTask.priority">
                      <SelectTrigger>
                        <SelectValue :placeholder="t('task.priority_placeholder')" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LOW">{{ t('priorities.LOW') }}</SelectItem>
                        <SelectItem value="MEDIUM">{{ t('priorities.MEDIUM') }}</SelectItem>
                        <SelectItem value="HIGH">{{ t('priorities.HIGH') }}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div class="grid gap-2">
                    <label class="text-sm font-medium">{{ t('task.status') }}</label>
                    <Select v-model="newTask.status">
                      <SelectTrigger>
                        <SelectValue :placeholder="t('task.status_placeholder')" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TODO">{{ t('statuses.TODO') }}</SelectItem>
                        <SelectItem value="IN_PROGRESS">{{ t('statuses.IN_PROGRESS') }}</SelectItem>
                        <SelectItem value="DONE">{{ t('statuses.DONE') }}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" @click="isDialogOpen = false">{{ t('task.cancel') }}</Button>
                <Button @click="handleAddTask">{{ t('board.create_task') }}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>

    <!-- Mobile Navigation Tabs -->
    <div class="md:hidden flex-shrink-0">
      <Tabs v-model="activeColumn" defaultValue="TODO">
        <TabsList class="w-full justify-start overflow-x-auto">
          <TabsTrigger v-for="col in visibleColumns" :key="col.id" :value="col.id" class="flex-1">
            {{ col.label }}
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>

    <div 
      ref="boardContainer"
      class="flex flex-row gap-0 overflow-x-hidden snap-x snap-mandatory scroll-smooth w-full no-scrollbar flex-1 min-h-0"
      @touchstart="handleTouchStart"
      @touchend="handleTouchEnd"
    >
      <template v-for="col in visibleColumns" :key="col.id">
        <div 
          v-if="col.id !== 'ARCHIVE' || isArchiveVisibleInDom"
          class="kanban-column flex flex-col gap-0 flex-1 min-w-full md:min-w-0 snap-center whitespace-normal h-full rounded-2xl shadow-lg border border-white/20 dark:border-white/10 transition-all duration-500"
          :style="{ marginLeft: col.id === 'TODO' ? '0' : '3rem' }"
        >
          <div :class="['flex items-center justify-between px-4 py-3 flex-shrink-0 border-b border-white/10 dark:border-white/5 transition-opacity duration-500', { 'opacity-0': col.id === 'ARCHIVE' && !archiveContentVisible, 'opacity-100': col.id !== 'ARCHIVE' || archiveContentVisible }]">
            <div class="flex items-center gap-2">
              <h3 class="font-semibold text-lg">{{ col.label }}</h3>
              <Badge variant="outline" class="rounded-full">
                {{ col.id === 'ARCHIVE' ? store.archivedTasks.length : store.tasksByStatus(col.id).length }}
              </Badge>
            </div>
          </div>

          <div :class="['flex flex-col gap-2 p-4 rounded-b-2xl flex-1 relative transition-opacity duration-500', col.color, { 'overflow-y-auto': col.id !== 'ARCHIVE' || showArchive, 'overflow-hidden': col.id === 'ARCHIVE' && !showArchive, 'opacity-0': col.id === 'ARCHIVE' && !archiveContentVisible, 'opacity-100': col.id === 'ARCHIVE' && archiveContentVisible }]"
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
              :disabled="isDragDisabled"
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
                        {{ t('priorities.' + task.priority) }}
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
                          @click.stop="moveTaskAndSync(task.id, 'TODO')"
                        >
                          ←
                        </Button>
                        <Button 
                          v-if="task.status !== 'DONE' && col.id !== 'ARCHIVE'" 
                          variant="ghost" 
                          size="sm" 
                          class="h-7 px-2 text-xs"
                          @click.stop="moveTaskAndSync(task.id, task.status === 'TODO' ? 'IN_PROGRESS' : 'DONE')"
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
              {{ t('board.no_tasks') }}
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';
import { useKanbanStore } from '@/stores/useKanbanStore';
import { useRouter } from 'vue-router';
import { VueDraggable } from 'vue-draggable-plus';
import gsap from 'gsap';
import { Plus } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import BgGsapTest from '../../components/BgGsapTest.vue';
import GlassLens from '@/components/ui/GlassLens.vue';
import Tabs from '@/components/ui/tabs/Tabs.vue';
import TabsList from '@/components/ui/tabs/TabsList.vue';
import TabsTrigger from '@/components/ui/tabs/TabsTrigger.vue';
import Switch from '@/components/ui/switch/Switch.vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const store = useKanbanStore();
const router = useRouter();
const headerRef = ref<HTMLElement | null>(null);
const isDialogOpen = ref(false);
const dialogContentRef = ref<HTMLElement | null>(null);

const handleOpenChange = async (open: boolean) => {
  if (open) {
    isDialogOpen.value = true;
  } else {
    await closeDialog();
  }
};

const closeDialog = async () => {
  let el = dialogContentRef.value;
  if (el && (el as any).$el) {
    el = (el as any).$el;
  }
  if (!(el instanceof HTMLElement)) {
    el = document.querySelector('.glass-primary.bg-white/70') as HTMLElement;
  }

  if (el) {
    await gsap.to(el, { 
      scale: 0.9, 
      opacity: 0, 
      y: 10, 
      duration: 0.2, 
      ease: 'power2.in' 
    });
  }
  isDialogOpen.value = false;
};

watch(isDialogOpen, async (val) => {
  if (val) {
    await nextTick();
    let el = dialogContentRef.value;
    if (el && (el as any).$el) {
      el = (el as any).$el;
    }
    if (!(el instanceof HTMLElement)) {
      el = document.querySelector('.glass-primary.bg-white/70') as HTMLElement;
    }
    if (!el) return;
    gsap.set(el, { scale: 0.9, opacity: 0, y: 20 });
    gsap.to(el, { 
      scale: 1, 
      opacity: 1, 
      y: 0, 
      duration: 0.4, 
      ease: 'back.out(1.7)' 
    });
  }
});

const activeColumn = ref('TODO');
const isProgrammaticScrolling = ref(false);
const isDragDisabled = ref(false);
const showArchive = ref(false);
const isArchiveVisibleInDom = ref(showArchive.value);
const archiveContentVisible = ref(false);

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
  { id: 'TODO', label: t('statuses.TODO'), color: 'bg-transparent' },
  { id: 'IN_PROGRESS', label: t('statuses.IN_PROGRESS'), color: 'bg-transparent' },
  { id: 'DONE', label: t('statuses.DONE'), color: 'bg-transparent' },
  { id: 'ARCHIVE', label: t('board.archive'), color: 'bg-transparent' },
]);

const visibleColumns = computed(() => {
  return columns.value;
});

const priorityColors: Record<string, string> = {
  LOW: 'bg-slate-400 text-white',
  MEDIUM: 'bg-yellow-500 text-white',
  HIGH: 'bg-red-500 text-white',
};

const boardContainer = ref<HTMLElement | null>(null);
const touchStartX = ref(0);
const touchEndX = ref(0);

const handleTouchStart = (e: TouchEvent) => {
  if (e.touches && e.touches[0]) {
    touchStartX.value = e.touches[0].clientX;
  }
};

const handleTouchEnd = (e: TouchEvent) => {
  if (!e.changedTouches || !e.changedTouches[0]) return;
  touchEndX.value = e.changedTouches[0].clientX;
  const diff = touchStartX.value - touchEndX.value;
  const threshold = 50;

  if (Math.abs(diff) > threshold) {
    const currentIndex = columns.value.findIndex(col => col.id === activeColumn.value);
    if (diff > 0 && currentIndex !== -1 && currentIndex < columns.value.length - 1) {
      const nextCol = columns.value[currentIndex + 1];
      if (nextCol) activeColumn.value = nextCol.id;
    } else if (diff < 0 && currentIndex > 0) {
      const prevCol = columns.value[currentIndex - 1];
      if (prevCol) activeColumn.value = prevCol.id;
    }
  }
};

const archiveRef = ref<HTMLElement | null>(null);
let observer: IntersectionObserver | null = null;

onMounted(async () => {
  await store.loadTasks();
  if (typeof window === 'undefined') return;
  const isMobile = window.innerWidth < 768;
  if (isMobile) {
    isDragDisabled.value = true;
  }
  if (window.innerWidth >= 768) return;
  observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !isProgrammaticScrolling.value) {
        const colId = entry.target.getAttribute('data-col-id');
        if (colId) {
          activeColumn.value = colId;
        }
      }
    });
  }, {
    threshold: 0.6,
  });
  const columns = document.querySelectorAll('.kanban-column');
  columns.forEach((col) => observer?.observe(col));
  if (!showArchive.value) {
    const cols = boardContainer.value?.querySelectorAll('.kanban-column');
    if (cols) {
      cols.forEach(col => {
        const isArchive = col.getAttribute('data-col-id') === 'ARCHIVE';
        (col as HTMLElement).style.flexBasis = isArchive ? '0%' : '33.3%';
      });
    }
  }
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
    isProgrammaticScrolling.value = true;
    gsap.to(boardContainer.value, {
      scrollLeft: targetElement.offsetLeft,
      duration: 0.6,
      ease: 'power2.out',
      overwrite: true,
      onComplete: () => {
        setTimeout(() => {
          isProgrammaticScrolling.value = false;
        }, 100);
      }
    });
  }
});

const moveTaskAndSync = async (taskId: string, newStatus: any) => {
  await store.updateTask({ id: taskId, status: newStatus });
  if (typeof window !== 'undefined' && window.innerWidth < 768) {
    activeColumn.value = newStatus;
  }
};

const onTaskMove = async (evt: any, newStatus: string) => {
  const data = evt.detail || evt;
  const isColumnChange = data.to && data.from && data.to !== data.from;
  const isAdded = data.added;
  if (isAdded || isColumnChange) {
    const draggedElement = data.added?.element || data.added || data.item || evt.item;
    if (!draggedElement) return;
    const taskId = draggedElement.getAttribute?.('data-id') || 
                   draggedElement.closest?.('[data-id]')?.getAttribute('data-id') ||
                   draggedElement.querySelector?.('[data-id]')?.getAttribute('data-id') || 
                   draggedElement['data-id'];
    if (!taskId) return;
    try {
      await store.moveTask(taskId, newStatus);
    } catch (e) {
      console.error(e);
    } finally {
      if (typeof window !== 'undefined' && window.innerWidth < 768) {
        isProgrammaticScrolling.value = true;
        activeColumn.value = newStatus;
      }
    }
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
  const archiveCol = boardContainer.value.querySelector('[data-col-id="ARCHIVE"]') as HTMLElement;
};
</script>
