# Bug: Mobile Header Alignment

**Goal**: Move the "New Task" button to the top right on mobile, aligned with the board title.

## 🛠️ Technical Implementation
1. **Container Adjustment**:
    - In `app/pages/index.vue`, change the header wrapper from `flex flex-col md:flex-row` to `flex flex-row` (removing the vertical stack on mobile).
    - Ensure `justify-between` and `items-center` are applied.
2. **Button Positioning**:
    - Ensure the "New Task" button block has `flex-shrink-0` to prevent it from being squashed by the title on small screens.
3. **Responsive Polish**:
    - Verify that the `hidden md:flex` Archive toggle does not create empty space or alignment shifts on mobile.

## ✅ Verification
- [ ] Mobile: Title is on the left, "New Task" button is on the right, both on the same line.
- [ ] Desktop: Layout remains unchanged.
