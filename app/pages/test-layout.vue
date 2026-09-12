<template>
  <div class="h-full flex flex-col">    
    <ClientOnly>
      <ResponsiveLayout 
        class="flex-1"
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
          <div class="p-4 bg-red-500/20 border-2 border-red-500 rounded-xl text-center h-full">
            Column 1
          </div>
        </template>
        
        <template #col2>
          <div class="p-4 bg-green-500/20 border-2 border-green-500 rounded-xl text-center h-full">
            Column 2
          </div>
        </template>
        
        <template #col3>
          <div class="p-4 bg-yellow-500/20 border-2 border-yellow-500 rounded-xl text-center h-full">
            Column 3
          </div>
        </template>
        
        <template #col4>
          <div class="p-4 bg-purple-500/20 border-2 border-purple-500 rounded-xl text-center h-full">
            Column 4
          </div>
        </template>
      </ResponsiveLayout>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import ResponsiveLayout from '@/components/templates/ResponsiveLayout.vue';

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
</script>
