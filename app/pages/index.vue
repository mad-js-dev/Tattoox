<script setup lang="ts">
import { ref } from 'vue';
import { useKanbanStore } from '@/stores/useKanbanStore';
import { useRouter } from 'vue-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-vue-next';

const store = useKanbanStore();
const router = useRouter();
const isDialogOpen = ref(false);
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

const columns = [
  { id: 'TODO', label: 'To Do', color: 'bg-slate-100 dark:bg-slate-900' },
  { id: 'IN_PROGRESS', label: 'In Progress', color: 'bg-blue-50 dark:bg-blue-900/20' },
  { id: 'DONE', label: 'Completed', color: 'bg-green-50 dark:bg-green-900/20' },
];

const priorityColors: Record<string, string> = {
  LOW: 'bg-slate-400 text-white',
  MEDIUM: 'bg-yellow-500 text-white',
  HIGH: 'bg-red-500 text-white',
};
</script>

<template>
  <div class="space-y-8">
    <div class="flex justify-between items-center">
      <div>
        <h2 class="text-3xl font-bold tracking-tight">Board</h2>
        <p class="text-muted-foreground">Manage your project tasks and progress.</p>
      </div>
      
      <Dialog v-model:open="isDialogOpen">
        <DialogTrigger as-child>
          <Button class="gap-2">
            <Plus class="w-4 h-4" />
            New Task
          </Button>
        </DialogTrigger>
        <DialogContent class="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
            <DialogDescription>Add a task to your board.</DialogDescription>
          </DialogHeader>
          <div class="grid gap-4 py-4">
            <div class="grid gap-2">
              <label class="text-sm font-medium">Title</label>
              <Input v-model="newTask.title" placeholder="Enter task title..." />
            </div>
            <div class="grid gap-2">
              <label class="text-sm font-medium">Description</label>
              <Textarea v-model="newTask.description" placeholder="Describe the task..." />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div class="grid gap-2">
                <label class="text-sm font-medium">Priority</label>
                <Select v-model="newTask.priority">
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
              <div class="grid gap-2">
                <label class="text-sm font-medium">Initial Status</label>
                <Select v-model="newTask.status">
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
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" @click="isDialogOpen = false">Cancel</Button>
            <Button @click="handleAddTask">Create Task</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div v-for="col in columns" :key="col.id" class="flex flex-col gap-4">
        <div class="flex items-center justify-between px-2">
          <div class="flex items-center gap-2">
            <h3 class="font-semibold text-lg">{{ col.label }}</h3>
            <Badge variant="outline" class="rounded-full">{{ store.tasksByStatus(col.id).length }}</Badge>
          </div>
        </div>

        <div :class="['flex flex-col gap-3 p-3 rounded-xl min-h-[500px] border-2 border-dashed', col.color]">
          <div 
            v-for="task in store.tasksByStatus(col.id)" 
            :key="task.id" 
            class="group hover:shadow-md transition-all cursor-pointer" 
            @click="router.push(`/task/${task.id}`)"
          >
            <Card>
              <CardHeader class="p-4 pb-2">
                <div class="flex justify-between items-start mb-2">
                  <Badge :class="priorityColors[task.priority]" class="text-[10px] uppercase font-bold">
                    {{ task.priority }}
                  </Badge>
                  <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
                  {{ task.description || 'No description provided.' }}
                </p>
                <div class="flex justify-between items-center">
                  <span class="text-[10px] text-muted-foreground">ID: {{ task.id.slice(-4) }}</span>
                  <div class="flex gap-1">
                    <Button 
                      v-if="task.status !== 'TODO'" 
                      variant="ghost" 
                      size="sm" 
                      class="h-7 px-2 text-xs"
                      @click.stop="store.updateTask({ id: task.id, status: 'TODO' })"
                    >
                      ←
                    </Button>
                    <Button 
                      v-if="task.status !== 'DONE'" 
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
          
          <div v-if="store.tasksByStatus(col.id).length === 0" class="flex-1 flex items-center justify-center text-muted-foreground text-sm italic opacity-50">
            No tasks here
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
