<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useKanbanStore } from '@/stores/useKanbanStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, Trash2 } from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();
const store = useKanbanStore();
const taskId = route.params.id as string;

const task = computed(() => store.tasks.find(t => t.id === taskId));

useSeoMeta({
  title: () => task.value ? `Task: ${task.value.title} | Tattoox` : 'Task Not Found',
  ogTitle: () => task.value ? `Task: ${task.value.title}` : 'Task Not Found',
  description: () => task.value ? task.value.description : 'View task details in the Tattoox Kanban board.',
  ogDescription: () => task.value ? task.value.description : 'View task details in the Tattoox Kanban board.',
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
        Back to Board
      </Button>
    </div>

    <div v-if="task" class="space-y-6">
      <div class="flex justify-between items-center">
        <div class="flex items-center gap-3">
          <h1 class="text-4xl font-bold tracking-tight">{{ task.title }}</h1>
          <Badge :class="priorityColors[task.priority]" class="text-xs font-bold">
            {{ task.priority }}
          </Badge>
        </div>
        <div class="flex gap-2">
          <Button variant="outline" @click="enterEditMode" :disabled="isEditing">
            Edit Task
          </Button>
          <Button variant="destructive" @click="store.deleteTask(taskId); router.push('/')" class="gap-2">
            <Trash2 class="w-4 h-4" />
            Delete
          </Button>
        </div>
      </div>

      <Card v-if="!isEditing">
        <CardHeader>
          <CardTitle class="text-sm font-medium text-muted-foreground">Details</CardTitle>
        </CardHeader>
        <CardContent class="space-y-6">
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1">
              <p class="text-xs text-muted-foreground uppercase font-semibold">Status</p>
              <p class="font-medium">{{ task.status }}</p>
            </div>
            <div class="space-y-1">
              <p class="text-xs text-muted-foreground uppercase font-semibold">Created At</p>
              <p class="font-medium">{{ new Date(task.createdAt).toLocaleString() }}</p>
            </div>
          </div>
          <div class="space-y-1">
            <p class="text-xs text-muted-foreground uppercase font-semibold">Description</p>
            <p class="text-base leading-relaxed text-foreground">
              {{ task.description || 'No description provided.' }}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card v-else class="border-primary/50">
        <CardHeader>
          <CardTitle class="text-lg">Update Task</CardTitle>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="grid gap-2">
            <label class="text-sm font-medium">Title</label>
            <Input v-model="editForm.title" />
          </div>
          <div class="grid gap-2">
            <label class="text-sm font-medium">Description</label>
            <Textarea v-model="editForm.description" />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div class="grid gap-2">
              <label class="text-sm font-medium">Status</label>
              <Select v-model="editForm.status">
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODO">To Do</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="DONE">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div class="grid gap-2">
              <label class="text-sm font-medium">Priority</label>
              <Select v-model="editForm.priority">
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div class="flex justify-end gap-3 pt-4">
            <Button variant="outline" @click="isEditing = false">Cancel</Button>
            <Button @click="saveChanges" class="gap-2">
              <Save class="w-4 h-4" />
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>

    <div v-else class="text-center py-20">
      <h2 class="text-2xl font-bold">Task not found</h2>
      <p class="text-muted-foreground mb-6">The task you are looking for does not exist or has been deleted.</p>
      <Button @click="router.push('/')">Return to Board</Button>
    </div>
  </div>
</template>
