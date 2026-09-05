# Feature: Archive System

**Goal**: Implement a non-destructive archive system for tasks across the Full Stack.

## 🛠️ Technical Implementation
1. **Backend (BE) - GraphQL**:
   - Update `Status` enum in the GraphQL schema to include `ARCHIVED`.
   - Update the `updateTask` mutation to allow setting status to `ARCHIVED`.
   - Update `getTasks` query to support filtering (e.g., exclude `ARCHIVED` by default).
2. **Schema (FE)**: 
   - Update `Status` enum in `types/kanban.ts` to include `ARCHIVED`.
3. **UI Components (shadcn-vue)**:
   - **Archive Column**: A dedicated column styled as a secondary area.
   - **Clear Archive Action**: Use `Button` (destructive variant) to trigger the purge.
   - **Purge Confirmation**: Use `AlertDialog` (from shadcn/radix) to confirm permanent deletion.
   - **Restore Action**: Use `Button` (ghost variant) on archived cards to move them back to `TODO`.
4. **Logic**:
   - Implement `archiveTask` and `restoreTask` actions in the Pinia store, ensuring they call the updated GraphQL mutations.
   - Implement `purgeArchive` to call a BE deletion mutation or a bulk update.

## ✅ Verification
- [ ] Task can be moved to Archive and persists in the BE.
- [ ] Task can be restored from Archive.
- [ ] Purge button triggers confirmation dialog and clears the BE records.
- [ ] Main board does not show archived tasks.
