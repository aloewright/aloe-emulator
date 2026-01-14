## 2026-01-14 - Form Accessibility Pattern
**Learning:** Form components (`Input`, `Select`, `Textarea`) lacked programmatic association between inputs and their helper/error text, making error states invisible to screen readers.
**Action:** Always generate unique IDs for helper and error elements (e.g., via `useFormField`) and link them using `aria-describedby` and `aria-invalid`.
