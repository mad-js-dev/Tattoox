<template>
  <div class="h-full w-full flex flex-col overflow-hidden">    
    <ClientOnly>
      <ResponsiveLayout 
        class="flex-1 h-full"
        v-model:switchModel="archiveValue"
        :switch-options="archiveOptions"
        :switch-range-map="archiveRangeMap"
      >
        <template #header>
          <div class="font-bold text-lg md:text-2xl tracking-tight">
            {{ $t('board.control_title') }}
          </div>
        </template>

        <template #actions>
          <Dialog :open="isDialogOpen" @update:open="handleOpenChange">
            <DialogTrigger as-child>
              <Button class="gap-2 px-4 py-2">
                <Plus class="w-4 h-4" />
                {{ $t('board.new_task') }}
              </Button>
            </DialogTrigger>
            <DialogContent 
              ref="dialogContentRef"
              class="w-[90vw] max-w-[425px] glass-primary bg-white/70 border-white/80 dark:bg-transparent dark:border-white/10 rounded-2xl mx-auto"
            >
              <DialogHeader>
                <DialogTitle>{{ $t('task.create_title') }}</DialogTitle>
                <DialogDescription>{{ $t('task.create_description') }}</DialogDescription>
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
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import ResponsiveLayout from '../components/templates/ResponsiveLayout.vue';
import KanbanColumn from '../components/organisms/KanbanColumn.vue';
import { useKanbanStore } from '../stores/useKanbanStore.ts';
import { useI18n } from 'vue-i18n';
import gsap from 'gsap';
import { Plus } from 'lucide-vue-next';
import { Button } from '../components/ui/button/index.ts';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card/index.ts';
import { Badge } from '../components/ui/badge/index.ts';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog/index.ts';
import { Input } from '../components/ui/input/index.ts';
import { Textarea } from '../components/ui/textarea/index.ts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select/index.ts';

const { t } = useI18n();
const store = useKanbanStore();

// Dialog State
const isDialogOpen = ref(false);
const dialogContentRef = ref<HTMLElement | null>(null);

const newTask = ref({
  title: '',
  description: '',
  status: 'TODO',
  priority: 'MEDIUM'
});

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

onMounted(async () => {
  await store.loadTasks();
});

const archiveValue = ref('all_except_archive');
const archiveOptions = computed(() => [
  { label: 'board.filter.backlog', value: 'backlog' },
  { label: 'board.filter.active', value: 'active' },
  { label: 'board.filter.done', value: 'done' },
  { label: 'board.filter.archive', value: 'archive' },
]);

const archiveRangeMap = {
  'all_except_archive': { start: 0, end: 2 },
  'all': { start: 0, end: 3 },
};

const columns = computed(() => [
  { id: 'TODO', label: t('statuses.TODO'), color: 'bg-transparent' },
  { id: 'IN_PROGRESS', label: t('statuses.IN_PROGRESS'), color: 'bg-transparent' },
  { id: 'DONE', label: t('statuses.DONE'), color: 'bg-transparent' },
  { id: 'ARCHIVE', label: t('statuses.ARCHIVE'), color: 'bg-transparent' },
]);
</script>