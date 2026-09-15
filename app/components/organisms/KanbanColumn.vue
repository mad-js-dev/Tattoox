<template>
  <GlassPanel :rounded="props.rounded" class="flex-1 flex flex-col">
    <div 
      :class="[
      'relative overflow-hidden -lg transition-all duration-500 flex-1 flex flex-col', 
      `rounded-${props.rounded}`, 
      columnClassName,
      ''
    ]"
  >
    <!-- Column Header -->
    <div class="flex items-center justify-between px-4 py-3 flex-shrink-0 border-b border-white/10 dark:border-white/5  ">
      <div class="flex items-center gap-2">
        <h3 class="font-semibold text-lg">{{ column.label }}</h3>
        <Badge variant="outline" class="rounded-full">
          {{ taskCount }}
        </Badge>
      </div>
    </div>

    <!-- Content Area -->
    <div class="relative flex-1 overflow-hidden flex flex-col">
      
      <!-- Background Placeholder (Visible only when empty) -->
      <div 
        v-if="isEmpty" 
        class="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm italic opacity-50 pointer-events-none z-0 transition-opacity duration-300"
      >
        {{ t('board.no_tasks') }}
      </div>

      <!-- Draggable Task List (Primary interaction layer) -->
      <div 
        ref="dragList"
        :class="[
          'relative z-10 flex flex-col gap-2 p-4 flex-1 overflow-y-auto transition-opacity duration-500',
          { 'opacity-0': isHidden, 'opacity-100': !isHidden }
        ]"
        style="min-height: 200px;"
      >
        <TaskCard 
          v-for="task in tasks" 
          :key="task.id"
          :task="task" 
          :priority-color="priorityColors[task?.priority || 'MEDIUM'] || 'bg-slate-400 text-white'" 
          :t="t"
          @click="onTaskClick"
          @delete="onTaskDelete"
          @archive="onTaskArchive"
        />
      </div>
    </div>
  </div>
</GlassPanel>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { useKanbanStore } from '@/stores/useKanbanStore';
import { useRouter } from 'vue-router';
import { Badge } from '@/components/ui/badge';
import GlassPanel from '@/components/atoms/GlassPanel.vue';
import TaskCard from '@/components/molecules/TaskCard.vue';
import { useI18n } from 'vue-i18n';
import { useDraggable } from 'vue-draggable-plus';

interface Column {
  id: string;
  label: string;
  color: string;
}

interface Props {
  column: Column;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  columnClassName?: string;
  isHidden?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  rounded: '2xl',
  columnClassName: '',
  isHidden: false,
});

const { t } = useI18n();
const store = useKanbanStore();
const router = useRouter();
const dragList = ref<HTMLElement | null>(null);

const tasks = computed(() => {
  if (props.column.id === 'ARCHIVE') {
    return store.archivedTasks;
  }
  return store.tasksByStatus(props.column.id);
});

const taskCount = computed(() => tasks.value.length);
const isEmpty = computed(() => tasks.value.length === 0);

const priorityColors: Record<string, string> = {
  LOW: 'bg-slate-400 text-white',
  MEDIUM: 'bg-yellow-500 text-white',
  HIGH: 'bg-red-500 text-white',
};

let draggableInstance: any = null;

onMounted(async () => {
  await nextTick();
  setTimeout(() => {
    if (dragList.value) {
      try {
        draggableInstance = useDraggable(dragList.value, {
          group: 'kanban',
          animation: 0,
          ghostClass: 'draggable-ghost',
          forceFallback: true,
          fallbackOnBody: true,
          onAdd: (evt) => {
            const taskId = evt.item.getAttribute('data-id');
            console.log(`[DnD] Dropped task ${taskId} into column ${props.column.id}`);
            if (taskId) {
              store.moveTask(taskId, props.column.id);
            }
          },
        });
      } catch (e) {
        console.error('Draggable init failed:', e);
      }
    }
  }, 300);
});

onUnmounted(() => {
  if (draggableInstance && typeof draggableInstance.destroy === 'function') {
    draggableInstance.destroy();
  }
});

const onTaskClick = (taskId: string) => {
  router.push(`/task/${taskId}`);
};

const onTaskDelete = (taskId: string) => {
  store.deleteTask(taskId);
};

const onTaskArchive = (taskId: string) => {
  if (props.column.id === 'ARCHIVE') {
    store.unarchiveTask(taskId);
  } else {
    store.archiveTask(taskId);
  }
};
</script>

<style scoped>
.draggable-ghost { opacity: 0.5; background-color: rgba(255, 255, 255, 0.1) !important; }
.sortable-fallback { transition: none !important; pointer-events: none !important; }
</style>
