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
          <GlassContainer>
            <div class="p-4 text-center h-full">
              Column 1
            </div>
          </GlassContainer>
        </template>
        
        <template #col2>
          <GlassContainer>
            <div class="p-4 text-center h-full">
              Column 2
            </div>
          </GlassContainer>
        </template>
        
        <template #col3>
          <GlassContainer>
            <div class="p-4 text-center h-full">
              Column 3
            </div>
          </GlassContainer>
        </template>
        
        <template #col4>
          <GlassContainer>
            <div class="p-4 text-center h-full">
              Column 4
            </div>
          </GlassContainer>
        </template>
      </ResponsiveLayout>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import ResponsiveLayout from '@/components/templates/ResponsiveLayout.vue';
import GlassContainer from '@/components/ui/GlassContainer.vue';

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
