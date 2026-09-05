# Feature: Column Switching & Mobile Navigation

**Goal**: Transition from vertical stacking to tabbed navigation on mobile and a focused view on desktop.

## 🛠️ Technical Implementation
1. **State**:
   - Add `activeColumn` to store/local state to track current view.
2. **UI Components (shadcn-vue)**:
   - **Mobile Switcher**: Use `Tabs` component to switch between columns.
   - **Desktop Toggle**: Use `Switch` or `Toggle` component to enable/disable the Archive column visibility.
   - **Responsive Layout**: Use Tailwind `md:` breakpoints to swap between `Tabs` (mobile) and `Switch` (desktop).
3. **Logic**:
   - Implement conditional rendering/filtering of columns based on `activeColumn` and the Archive toggle state.
   - Ensure smooth transitions when the Archive column expands.

## ✅ Verification
- [ ] Mobile view shows a Tab bar instead of a long list.
- [ ] Switching tabs updates the visible column.
- [ ] Desktop toggle correctly shows/hides the Archive column.
- [ ] Layout remains stable during transitions.
