import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Task, TaskPriority, TaskStatus } from '../types/kanban';

export const useKanbanStore = defineStore('kanban', () => {
  // State initialized as empty; hydration happens via loadTasks()
  const tasks = ref<Task[]>([]);

  // Local Storage Key
  const STORAGE_KEY = 'tattoox-kanban-tasks';

  function tasksByStatus(status: string) {
    return tasks.value.filter(t => t.status === status && !t.isArchived);
  }

  // Persistence helpers
  function saveToLocal() {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks.value));
    }
  }

  function loadFromLocal() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          tasks.value = JSON.parse(saved);
        } catch (e) {
          console.error('Failed to parse local storage tasks', e);
        }
      }
    }
  }

  async function loadTasks() {
    try {
      // Try to fetch from server first (Server-First)
      const serverTasks = await $fetch<Task[]>('/api/graphql');
      if (serverTasks && Array.isArray(serverTasks)) {
        tasks.value = serverTasks;
        saveToLocal(); // Sync server state to local storage
      }
    } catch (e) {
      console.warn('Server unavailable, falling back to local storage');
      loadFromLocal();
    }
  }

  async function addTask(taskInput: { title: string; description: string; status: TaskStatus; priority: TaskPriority }) {
    const newTask: Task = {
      id: Date.now().toString(),
      ...taskInput,
      createdAt: new Date().toISOString(),
    };
    
    tasks.value = [...tasks.value, newTask];
    saveToLocal();
    
    try {
      await $fetch('/api/graphql', {
        method: 'POST',
        body: newTask,
      });
    } catch (e) {
      console.warn('Server sync failed, using local storage fallback');
    }
    
    return newTask;
  }

  async function updateTask(input: Partial<Task> & { id: string }) {
    const task = tasks.value.find(t => t.id === input.id);
    if (!task) return;

    const updatedTask: Task = {
      ...task,
      ...input,
      title: input.title ?? task.title,
      description: input.description ?? task.description,
      status: (input.status as TaskStatus) ?? task.status,
      priority: (input.priority as TaskPriority) ?? task.priority,
      createdAt: task.createdAt,
    };

    tasks.value = tasks.value.map(t => t.id === input.id ? updatedTask : t);
    saveToLocal();

    try {
      await $fetch('/api/graphql', {
        method: 'PUT',
        body: updatedTask,
      });
    } catch (e) {
      console.warn('Server sync failed, using local storage fallback');
    }

    return updatedTask;
  }

  async function deleteTask(id: string) {
    tasks.value = tasks.value.filter(t => t.id !== id);
    saveToLocal();
    
    try {
      await $fetch('/api/graphql', {
        method: 'DELETE',
        body: { id },
      });
    } catch (e) {
      console.warn('Server sync failed, using local storage fallback');
    }
  }

  async function archiveTask(id: string) {
    const task = tasks.value.find(t => t.id === id);
    if (!task) return;

    const updatedTask = { ...task, isArchived: true };
    tasks.value = tasks.value.map(t => t.id === id ? updatedTask : t);
    saveToLocal();

    try {
      await $fetch('/api/graphql', {
        method: 'PUT',
        body: updatedTask,
      });
    } catch (e) {
      console.warn('Server sync failed, using local storage fallback');
    }
    return updatedTask;
  }

  async function unarchiveTask(id: string) {
    const task = tasks.value.find(t => t.id === id);
    if (!task) return;

    const updatedTask = { ...task, isArchived: false };
    tasks.value = tasks.value.map(t => t.id === id ? updatedTask : t);
    saveToLocal();

    try {
      await $fetch('/api/graphql', {
        method: 'PUT',
        body: updatedTask,
      });
    } catch (e) {
      console.warn('Server sync failed, using local storage fallback');
    }
    return updatedTask;
  }

  async function moveTask(taskId: string, newStatus: string) {
    const task = tasks.value.find(t => t.id === taskId);
    if (!task) return;

    const isMovingToArchive = newStatus === 'ARCHIVE';
    const isMovingFromArchive = task.isArchived;

    const updatedTask = { 
      ...task, 
      status: newStatus as TaskStatus, 
      isArchived: isMovingToArchive 
    };

    tasks.value = tasks.value.map(t => t.id === taskId ? updatedTask : t);
    saveToLocal();

    try {
      if (isMovingToArchive) {
        await archiveTask(taskId);
      } else if (isMovingFromArchive) {
        await unarchiveTask(taskId);
      } else {
        await $fetch('/api/graphql', {
          method: 'PUT',
          body: updatedTask,
        });
      }
    } catch (e) {
      console.warn('Server sync failed during moveTask, but local state is preserved', e);
    }
    
    return updatedTask;
  }

  return {
    tasks,
    tasksByStatus,
    loadTasks,
    addTask,
    updateTask,
    deleteTask,
    archiveTask,
    unarchiveTask,
    moveTask,
    archivedTasks: computed(() => tasks.value.filter(t => t.isArchived)),
  };
});
