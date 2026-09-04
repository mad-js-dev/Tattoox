# Enterprise Kanban Showcase - Tattoox Technical Project

## 1. Project Overview
A high-fidelity, enterprise-grade Kanban application designed as a technical proof-of-concept for a Frontend Developer role. The project demonstrates mastery over the Nuxt 3 ecosystem, complex state management, type-safe API communication via GraphQL, and a professional QA pipeline.

### Core Goal
Showcase the ability to transition an application from a static, client-side demo (GitHub Pages) to a full-stack SSR application (Node.js) without changing the business logic.

---

## 2. Technical Stack
| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | Nuxt 3 (Vue 3 Composition API) | SSR/SSG, File-routing, Auto-imports |
| **Backend** | Nitro + `apollo-server-nitro` | GraphQL API, Server-side logic |
| **Language** | TypeScript (Strict Mode) | Type safety across the full stack |
| **Styling** | Tailwind CSS | Utility-first responsive design |
| **UI Components** | shadcn-vue / Radix Vue | Accessible, reusable design system |
| **State** | Pinia | Centralized Kanban state management |
| **Utilities** | VueUse | Composables for localStorage, dark mode, etc. |
| **i18n** | `@nuxtjs/i18n` | Internationalization (ES/EN) |
| **Unit Testing** | Vitest | Business logic and Store validation |
| **E2E Testing** | Playwright | Critical user journey validation |
| **Deployment** | GH Pages (SSG) $\leftrightarrow$ Node (SSR) | Hybrid deployment capability |

---

## 3. Architecture Design

### 3.1 Hybrid Persistence Layer
The application uses a "Bridge" pattern in the Pinia store:
- **Static Mode (Client):** When `import.meta.client` is true and no server is detected, the store interacts with `localStorage` via VueUse's `useLocalStorage`.
- **Server Mode (SSR/Node):** The store uses an Apollo Client to communicate with the Nitro-hosted GraphQL server.

### 3.2 GraphQL Schema (`apollo-server-nitro`)
**Types:**
- `Task`: `{ id: ID!, title: String!, description: String, status: Status!, priority: Priority!, createdAt: String }`
- `Status`: Enum `(TODO, IN_PROGRESS, DONE)`
- `Priority`: Enum `(LOW, MEDIUM, HIGH)`

**Queries:**
- `getTasks`: Returns all tasks.
- `getTask(id: ID!)`: Returns a single task.

**Mutations:**
- `createTask(input: TaskInput!)`: Creates a new task.
- `updateTask(id: ID!, input: TaskInput!)`: Updates status or details.
- `deleteTask(id: ID!)`: Removes a task.

---

## 4. Implementation Phases

### Phase 1: Infrastructure & Setup
1. **Initialization:** `npx nuxi@latest init` with TS.
2. **Tailwind & shadcn:** Install Tailwind, initialize `shadcn-vue` and configure the `components.json` for Nuxt.
3. **Modules Setup:** Install Pinia, VueUse, and `@nuxtjs/i18n`.
4. **i18n Config:** Define `en` and `es` locales.

### Phase 2: The GraphQL Engine
1. **Apollo Server:** Setup `apollo-server-nitro` in `server/index.ts` (or as a Nitro plugin).
2. **Schema Implementation:** Define the Resolver logic for the Kanban CRUD.
3. **Hybrid Client:** Build a wrapper around `useFetch` or Apollo Client that detects environment for persistence.

### Phase 3: Business Logic & State
1. **Strict Types:** Create `types/kanban.ts` for the GraphQL/Store entities.
2. **Kanban Store:** Implement `useKanbanStore` with actions for creating, moving, and deleting tasks.
3. **VueUse Integration:** Use `useDark` for theme management.

### Phase 4: UI Development (The "Polish")
1. **Layout:** Build a professional Shell (Header, i18n Switcher, Theme Toggle).
2. **Kanban Board:**
    - Three-column layout using CSS Grid.
    - `TaskCard.vue` using shadcn `Card`.
    - `TaskModal.vue` using shadcn `Dialog` for CRUD operations.
3. **Dynamic Routing:** Implement `pages/task/[id].vue` with `useSeoMeta` for dynamic SEO.

### Phase 5: Quality Assurance
1. **Vitest:** Unit tests for Store actions and Hybrid Client logic.
2. **Playwright:** E2E tests for "Create $\rightarrow$ Move $\rightarrow$ Delete" flow.
3. **Type Check:** Full project audit with `vue-tsc`.

---

## 5. Deployment & Verification
- **Dev Mode:** `npm run dev` $\rightarrow$ Verify GraphQL server $\rightarrow$ Verify SSR rendering.
- **Static Mode:** `npx nuxi generate` $\rightarrow$ Verify `localStorage` fallback on GH Pages.

## 6. Interview Narrative
- **A11y:** "I used Radix Vue primitives via shadcn to ensure keyboard navigation and screen reader support."
- **Scaling:** "The GraphQL implementation shows how I would handle complex data relations in a production environment."
- **Hybridity:** "The app proves architectural flexibility by supporting both a serverless static edge and a full-stack Node runtime."
