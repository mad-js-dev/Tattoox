<template>
  <GlassPanel :rounded="props.rounded" class="h-full flex flex-col">
    <div 
      :class="[
      'relative overflow-hidden -lg transition-all duration-500 h-full flex flex-col', 
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
          {{ tasks.length }}
        </Badge>
      </div>
    </div>

    <!-- Tasks List -->
    <div 
      :class="[
        'flex flex-col gap-2 p-4 flex-1 overflow-y-auto transition-opacity duration-500',
        { 'opacity-0': isHidden, 'opacity-100': !isHidden }
      ]"
      style="min-height: 150px;"
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
  </GlassPanel>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useKanbanStore } from '@/stores/useKanbanStore';
import { useRouter } from 'vue-router';
import { Badge } from '@/components/ui/badge';
import GlassPanel from '@/components/atoms/GlassPanel.vue';
import TaskCard from '@/components/molecules/TaskCard.vue';
import { useI18n } from 'vue-i18n';

interface Column {
  id: string;
  label: string;
  color: string;
}

interface Props {
  column: Column;
  tasks: any[];
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

const isMobile = computed(() => typeof window !== 'undefined' && window.innerWidth < 768);

const priorityColors: Record<string, string> = {
  LOW: 'bg-slate-400 text-white',
  MEDIUM: 'bg-yellow-500 text-white',
  HIGH: 'bg-red-500 text-white',
};

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
