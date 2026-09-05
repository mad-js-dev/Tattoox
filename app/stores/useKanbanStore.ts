import { defineStore } from 'pinia';
import { useLocalStorage } from '@vueuse/core';
import { computed } from 'vue';
import type { Task, TaskPriority, TaskStatus } from '../types/kanban';

export const useKanbanStore = defineStore('kanban', () => {
  const tasks = useLocalStorage<Task[]>('tattoox-kanban-tasks', [
    {
      id: '1',
      title: 'Welcome to Tattoox Kanban',
      description: 'This is an enterprise-grade Kanban board built with Nuxt 4.',
      status: 'TODO',
      priority: 'MEDIUM',
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      title: 'Explore the features',
      description: 'Try adding, editing, and moving tasks between columns.',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      createdAt: new Date().toISOString(),
    }
  ]);

  function tasksByStatus(status: string) {
    return tasks.value.filter(t => t.status === status && !t.isArchived);
  }

  async function addTask(taskInput: { title: string; description: string; status: TaskStatus; priority: TaskPriority }) {
    const newTask: Task = {
      id: Date.now().toString(),
      ...taskInput,
      createdAt: new Date().toISOString(),
    };
    
    tasks.value.push(newTask);
    
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
    const index = tasks.value.findIndex(t => t.id === input.id);
    if (index === -1) return;

    const task = tasks.value[index];
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

    tasks.value[index] = updatedTask;

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
    const index = tasks.value.indexOf(task);
    tasks.value[index] = updatedTask;

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
    const index = tasks.value.indexOf(task);
    tasks.value[index] = updatedTask;

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

    if (isMovingToArchive) {
      return await archiveTask(taskId);
    }

    if (isMovingFromArchive) {
      await unarchiveTask(taskId);
    }

    return await updateTask({ 
      id: taskId, 
      status: newStatus as TaskStatus 
    });
  }

  return {
    tasks,
    tasksByStatus,
    addTask,
    updateTask,
    deleteTask,
    archiveTask,
    unarchiveTask,
    moveTask,
    archivedTasks: computed(() => tasks.value.filter(t => t.isArchived)),
  };
});
