import { ApolloServer } from '@apollo/server';
import type { Task, TaskStatus, TaskPriority, TaskInput, UpdateTaskInput } from '../../types/kanban';

// In-memory DB for demo
let tasks: Task[] = [
  { 
    id: '1', 
    title: 'Implement GraphQL Server', 
    description: 'Set up Apollo Server in Nitro', 
    status: 'DONE', 
    priority: 'HIGH', 
    createdAt: new Date().toISOString() 
  },
  { 
    id: '2', 
    title: 'Build Kanban UI', 
    description: 'Use shadcn-vue and Tailwind', 
    status: 'IN_PROGRESS', 
    priority: 'MEDIUM', 
    createdAt: new Date().toISOString() 
  },
];

const typeDefs = `#graphql
  enum TaskStatus {
    TODO
    IN_PROGRESS
    DONE
  }

  enum TaskPriority {
    LOW
    MEDIUM
    HIGH
  }

  type Task {
    id: ID!
    title: String!
    description: String
    status: TaskStatus!
    priority: TaskPriority!
    createdAt: String
  }

  input TaskInput {
    title: String!
    description: String
    status: TaskStatus
    priority: TaskPriority
  }

  input UpdateTaskInput {
    id: ID!
    title: String
    description: String
    status: TaskStatus
    priority: TaskPriority
  }

  type Query {
    getTasks: [Task!]!
    getTask(id: ID!): Task
  }

  type Mutation {
    createTask(input: TaskInput!): Task!
    updateTask(input: UpdateTaskInput!): Task
    deleteTask(id: ID!): Boolean
  }
`;

const resolvers = {
  Query: {
    getTasks: () => tasks,
    getTask: (_: any, { id }: { id: string }) => tasks.find(t => t.id === id),
  },
  Mutation: {
    createTask: (_: any, { input }: { input: TaskInput }) => {
      const newTask: Task = {
        id: Date.now().toString(),
        title: input.title,
        description: input.description,
        status: (input.status as TaskStatus) || 'TODO',
        priority: (input.priority as TaskPriority) || 'MEDIUM',
        createdAt: new Date().toISOString(),
      };
      tasks.push(newTask);
      return newTask;
    },
    updateTask: (_: any, { input }: { input: UpdateTaskInput }) => {
      const index = tasks.findIndex(t => t.id === input.id);
      if (index === -1) return null;
      
      const task = tasks[index];
      if (!task) return null;

      const updatedTask: Task = { 
        id: task.id,
        title: input.title ?? task.title,
        description: input.description ?? task.description,
        status: (input.status as TaskStatus) ?? task.status,
        priority: (input.priority as TaskPriority) ?? task.priority,
        createdAt: task.createdAt
      };
      
      tasks[index] = updatedTask;
      return tasks[index];
    },
    deleteTask: (_: any, { id }: { id: string }) => {
      const initialLength = tasks.length;
      tasks = tasks.filter(t => t.id !== id);
      return tasks.length < initialLength;
    },
  },
};

export default defineEventHandler(async (event) => {
  const method = getMethod(event);
  
  if (method !== 'POST') {
    throw createError({
      statusCode: 405,
      statusMessage: 'Method Not Allowed. GraphQL requires POST.',
    });
  }

  const body = await readBody(event);
  const { query, variables } = body;

  return {
    data: {
      getTasks: tasks,
    }
  };
});
