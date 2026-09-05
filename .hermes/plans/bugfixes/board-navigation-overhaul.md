# Bug: Board Navigation & Layout Overhaul

**Goal**: Fix the Archive switch, implement fluid desktop expansion, and create a sliding carousel for mobile navigation.

## 🛠️ Technical Implementation

### 1. Desktop: The Fluid Archive
- **The Switch**: Change `v-model:model-value="showArchive"` to `v-model="showArchive"` in `app/pages/index.vue`.
- **The Layout**: 
    - Replace the static grid `<div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">` with a flex container: `<div class="flex flex-col md:flex-row gap-6">`.
    - Apply `flex-1` to all column wrappers.
    - Result: When `showArchive` is false, the 3 active columns will naturally expand to fill the width.

### 2. Mobile: The Sliding Carousel
- **Structural Change**: 
    - Wrap the columns in a container with `flex overflow-x-auto snap-x snap-mandatory scroll-smooth`.
    - Give each column `min-w-full snap-center`.
- **The Slide Logic**: 
    - Remove `v-show` from columns on mobile.
    - Implement a `watch` on `activeColumn` to use `scrollTo` (via a template ref) to glide the viewport to the target column.
- **Archive Integration**: Ensure the `columns` computed property is used so the Archive is a first-class slide.

## ✅ Verification
- [ ] Desktop: Toggle Archive -> Columns expand/shrink fluidly.
- [ ] Mobile: Click Tab -> Viewport slides smoothly to the target column (including Archive).
