# Feature: Desktop Drag-and-Drop

**Goal**: Enable users to reorder tasks within a column and move tasks between columns via drag-and-drop on desktop.

## 🛠️ Technical Implementation

### 1. Dependency Integration
- Install `vue-draggable-plus`.
- This library is a modern wrapper around SortableJS and works seamlessly with Vue 3 and Nuxt.

### 2. UI Structural Change
- In `app/pages/index.vue`, replace the standard `v-for` loop of tasks in each column with the `<VueDraggable>` component.
- Set the `group` prop to the same value for all columns to allow inter-column movement.
- Use a transition group or the built-in draggable transitions for a fluid feel.

### 3. Store Integration
- Implement a `moveTask` action in `useKanbanStore.ts` that takes `{ taskId, newStatus }` and updates the task.
- Trigger this action via the `@change` event of the draggable component.
- Ensure that dragging into the 'ARCHIVE' column triggers the `archiveTask` action, and dragging out of it triggers `unarchiveTask`.

### 4. Visual Polish
- Add a ghost class (e.g., `opacity-50 bg-slate-200`) to the dragged element.
- Ensure the layout remains stable during the drag operation.

## ✅ Verification
- [ ] Drag a task within the same column -> Position updates in state.
- [ ] Drag a task from TODO to IN_PROGRESS -> Store updates status -> Task persists in new column.
- [ ] Drag a task into the ARCHIVE column -> Store marks as archived.
- [ ] Drag a task from ARCHIVE back to TODO -> Store marks as unarchived.
