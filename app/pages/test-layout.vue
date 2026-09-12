<template>
  <div class="h-screen w-full flex flex-col overflow-hidden">    
    <ClientOnly>
      <ResponsiveLayout 
        class="flex-1 h-full"
        v-model:switchModel="archiveValue"
        :switch-options="archiveOptions"
        :switch-range-map="archiveRangeMap"
      >
        <template #header>
          <div class="font-bold">
            Kanban Control
          </div>
        </template>
        
        <template #col1>
          <KanbanColumn 
            :column="columns[0]!" 
            :tasks="store.tasksByStatus(columns[0]!.id)" 
            class="h-full" 
          />
        </template>
        
        <template #col2>
          <KanbanColumn 
            :column="columns[1]!" 
            :tasks="store.tasksByStatus(columns[1]!.id)" 
            class="h-full" 
          />
        </template>
        
        <template #col3>
          <KanbanColumn 
            :column="columns[2]!" 
            :tasks="store.tasksByStatus(columns[2]!.id)" 
            class="h-full" 
          />
        </template>
        
        <template #col4>
          <KanbanColumn 
            :column="columns[3]!" 
            :tasks="store.archivedTasks" 
            class="h-full" 
          />
        </template>
      </ResponsiveLayout>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import ResponsiveLayout from '@/components/templates/ResponsiveLayout.vue';
import KanbanColumn from '@/components/organisms/KanbanColumn.vue';
import { useKanbanStore } from '@/stores/useKanbanStore';

const store = useKanbanStore();

onMounted(async () => {
  await store.loadTasks();
});

const archiveValue = ref('all_except_archive');
const archiveOptions = [
  { label: 'Backlog', value: 'backlog' },
  { label: 'Active', value: 'active' },
  { label: 'Done', value: 'done' },
  { label: 'Archive', value: 'archive' },
];

const archiveRangeMap = {
  'all_except_archive': { start: 0, end: 2 },
  'all': { start: 0, end: 3 },
};

const columns = computed(() => [
  { id: 'TODO', label: 'To Do', color: 'bg-transparent' },
  { id: 'IN_PROGRESS', label: 'In Progress', color: 'bg-transparent' },
  { id: 'DONE', label: 'Done', color: 'bg-transparent' },
  { id: 'ARCHIVE', label: 'Archive', color: 'bg-transparent' },
]);
</script>
