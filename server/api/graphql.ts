import { ApolloServer } from '@apollo/server';
import type { Task, TaskStatus, TaskPriority, TaskInput, UpdateTaskInput } from '../../app/types/kanban';

// In-memory DB for demo
let tasks: Task[] = [
  {
    id: '1',
    title: 'Setup Project Architecture',
    description: 'Initialize Nuxt 3 with Hybrid persistence',
    status: 'DONE',
    priority: 'HIGH',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Implement GraphQL API',
    description: 'Create Nitro server routes for Kanban CRUD',
    status: 'IN_PROGRESS',
    priority: 'MEDIUM',
    createdAt: new Date().toISOString(),
  },
];

export default defineEventHandler(async (event) => {
  const method = getMethod(event);

  if (method === 'GET') {
    return tasks;
  }

  if (method === 'POST') {
    const body = await readBody(event);
    const newTask: Task = {
      id: Date.now().toString(),
      title: body.title,
      description: body.description || '',
      status: (body.status as any) || 'TODO',
      priority: (body.priority as any) || 'MEDIUM',
      createdAt: new Date().toISOString(),
    };
    tasks.push(newTask);
    return newTask;
  }

  if (method === 'PUT') {
    const body = await readBody(event);
    const index = tasks.findIndex(t => t.id === body.id);
    if (index === -1) throw createError({ statusCode: 404, statusMessage: 'Task not found' });

    const task = tasks[index];
    if (!task) throw createError({ statusCode: 404, statusMessage: 'Task not found' });

    const updatedTask: Task = {
      ...task,
      title: body.title ?? task.title,
      description: body.description ?? task.description,
      status: (body.status as any) ?? task.status,
      priority: (body.priority as any) ?? task.priority,
      createdAt: task.createdAt,
    };
    tasks[index] = updatedTask;
    return updatedTask;
  }

  if (method === 'DELETE') {
    const body = await readBody(event);
    tasks = tasks.filter(t => t.id !== body.id);
    return { success: true };
  }
});
