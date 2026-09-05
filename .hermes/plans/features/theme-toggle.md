# Feature: Theme Toggle Implementation (Light/Dark Mode)

**Goal**: Fix the theme toggle button so it correctly updates the application colors across the entire UI using Tailwind CSS dark mode.

## 🛠️ Technical Implementation
1. **Tailwind Configuration**:
   - Verify/Update `tailwind.config.js` to set `darkMode: 'class'`. This ensures Tailwind looks for the `.dark` class on the root element rather than relying on OS preferences.
2. **State Management (VueUse)**:
   - Use `useDark` from `@vueuse/core` to manage the `isDark` state.
   - `useDark` automatically handles toggling the `.dark` class on the `<html>` element and persists the preference to `localStorage`.
3. **UI Component Update**:
   - Update the Theme Toggle button to bind to the `isDark` state from `useDark`.
   - Ensure the button uses a `shadcn-vue` `Button` component for visual consistency.
4. **Color Audit**:
   - Review primary components (Shell, Board, TaskCards) to ensure they use Tailwind `dark:` utility classes (e.g., `bg-white dark:bg-slate-900`) or CSS variables that change based on the theme.

## ✅ Verification
- [ ] Clicking the toggle adds/removes the `.dark` class from the `<html>` tag.
- [ ] UI colors change immediately upon toggling.
- [ ] Theme preference persists after page refresh.
- [ ] `tailwind.config.js` is correctly configured for class-based dark mode.
