## 2024-05-22 - TopBar Navigation Accessibility
**Learning:** Core navigation elements in `TopBar.vue` were implemented as clickable `div`s instead of semantic `<button>` elements, lacking keyboard accessibility and ARIA roles. This pattern might exist in other "custom" UI components.
**Action:** When auditing components, specifically check for `div`s with `@click` handlers that should be interactive buttons. Convert them to `<button type="button">` and ensure they have `aria-label` and `focus-visible` styles.
