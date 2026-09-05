# Feature: i18n Translation Fix

**Goal**: Fix the internationalization system so that switching languages correctly updates all text across the application.

## 🛠️ Technical Implementation
1. **Configuration Audit**:
   - Verify `@nuxtjs/i18n` configuration in `nuxt.config.ts`.
   - Ensure `locales` (en, es) and `defaultLocale` are correctly defined.
   - Verify that the translation files (JSON/YAML) are located in the correct directory (e.g., `i18n/locales/`).
2. **Infrastructure Check**:
   - Create/Update translation files for both languages to ensure keys match across files.
   - Implement a base set of keys for common UI elements (Board, Cards, Modal).
3. **Component Integration**:
   - Replace all hardcoded strings in the UI with the `$t('key')` function or the `t` function from `useI18n()`.
   - Prioritize the Shell (Header), Kanban columns, and Task Modals.
4. **Switcher Logic**:
   - Verify the language switcher component is calling `setLocale()` correctly from the `useI18n` composable.
   - Ensure the switcher uses `shadcn-vue` components (e.g., `DropdownMenu` or `Select`).

## ✅ Verification
- [ ] Switching language in the UI immediately updates visible text.
- [ ] No "missing key" warnings appear in the browser console.
- [ ] User preference for language is persisted via Nuxt i18n cookies/localStorage.
- [ ] All core UI elements are translated in both English and Spanish.
