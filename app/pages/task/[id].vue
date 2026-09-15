<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useKanbanStore } from '@/stores/useKanbanStore.ts';
import { Button } from '@/components/ui/button/index';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card/index';
import { Badge } from '@/components/ui/badge/index';
import { Input } from '@/components/ui/input/index';
import { Textarea } from '@/components/ui/textarea/index';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select/index';
import { ArrowLeft, Save, Trash2 } from 'lucide-vue-next';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const store = useKanbanStore();
const taskId = route.params.id as string;

const task = computed(() => store.tasks.find(t => t.id === taskId));

useSeoMeta({
  title: () => task.value ? `Task: ${task.value.title} | Tattoox` : t('errors.not_found_title'),
  ogTitle: () => task.value ? `Task: ${task.value.title}` : t('errors.not_found_title'),
  description: () => task.value ? task.value.description : t('errors.not_found_desc'),
  ogDescription: () => task.value ? task.value.description : t('errors.not_found_desc'),
});

const isEditing = ref(false);
const editForm = ref({
  title: '',
  description: '',
  status: '',
  priority: ''
});

const enterEditMode = () => {
  if (!task.value) return;
  editForm.value = {
    title: task.value.title,
    description: task.value.description || '',
    status: task.value.status,
    priority: task.value.priority,
  };
  isEditing.value = true;
};

const saveChanges = async () => {
  await store.updateTask({
    id: taskId,
    title: editForm.value.title,
    description: editForm.value.description,
    status: editForm.value.status as any,
    priority: editForm.value.priority as any,
  });
  isEditing.value = false;
};

const priorityColors: Record<string, string> = {
  LOW: 'bg-slate-400 text-white',
  MEDIUM: 'bg-yellow-500 text-white',
  HIGH: 'bg-red-500 text-white',
};
</script>

<template>
  <div class="max-w-3xl mx-auto space-y-6">
    <div class="flex items-center gap-4">
      <Button variant="ghost" @click="router.back()" class="gap-2">
        <ArrowLeft class="w-4 h-4" />
        {{ $t('task.back_to_board') }}
      </Button>
    </div>

    <div v-if="task" class="space-y-6">
      <div class="flex justify-between items-center">
        <div class="flex items-center gap-3">
          <h1 class="text-4xl font-bold tracking-tight">{{ task.title }}</h1>
          <Badge :class="priorityColors[task.priority]" class="text-xs font-bold">
            {{ $t('priorities.' + task.priority) }}
          </Badge>
        </div>
        <div class="flex gap-2">
          <Button variant="outline" @click="enterEditMode" :disabled="isEditing">
            {{ $t('task.edit') }}
          </Button>
          <Button variant="destructive" @click="store.deleteTask(taskId); router.push('/')" class="gap-2">
            <Trash2 class="w-4 h-4" />
            {{ $t('task.delete') }}
          </Button>
        </div>
      </div>

      <Card v-if="!isEditing">
        <CardHeader>
          <CardTitle class="text-sm font-medium text-muted-foreground">{{ $t('task.details') }}</CardTitle>
        </CardHeader>
        <CardContent class="space-y-6">
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1">
              <p class="text-xs text-muted-foreground uppercase font-semibold">{{ $t('task.status') }}</p>
              <p class="font-medium">{{ $t('statuses.' + task.status) }}</p>
            </div>
            <div class="space-y-1">
              <p class="text-xs text-muted-foreground uppercase font-semibold">{{ $t('task.created_at') }}</p>
              <p class="font-medium">{{ new Date(task.createdAt).toLocaleString() }}</p>
            </div>
          </div>
          <div class="space-y-1">
            <p class="text-xs text-muted-foreground uppercase font-semibold">{{ $t('task.description') }}</p>
            <p class="text-base leading-relaxed text-foreground">
              {{ task.description || $t('task.description_none') }}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card v-else class="border-primary/50">
        <CardHeader>
          <CardTitle class="text-lg">{{ $t('task.edit_title') }}</CardTitle>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="grid gap-2">
            <label class="text-sm font-medium">{{ $t('task.title') }}</label>
            <Input v-model="editForm.title" />
          </div>
          <div class="grid gap-2">
            <label class="text-sm font-medium">{{ $t('task.description') }}</label>
            <Textarea v-model="editForm.description" />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div class="grid gap-2">
              <label class="text-sm font-medium">{{ $t('task.status') }}</label>
              <Select v-model="editForm.status">
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
            <div class="grid gap-2">
              <label class="text-sm font-medium">{{ $t('task.priority') }}</label>
              <Select v-model="editForm.priority">
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
          </div>
          <div class="flex justify-end gap-3 pt-4">
            <Button variant="outline" @click="isEditing = false">{{ $t('task.cancel') }}</Button>
            <Button @click="saveChanges" class="gap-2">
              <Save class="w-4 h-4" />
              {{ $t('task.save') }}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>

    <div v-else class="text-center py-20">
      <h2 class="text-2xl font-bold">{{ $t('errors.not_found_title') }}</h2>
      <p class="text-muted-foreground mb-6">{{ $t('errors.not_found_desc') }}</p>
      <Button @click="router.push('/')">{{ $t('task.back_to_board') }}</Button>
    </div>
  </div>
</template>
