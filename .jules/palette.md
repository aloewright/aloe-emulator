## 2024-05-23 - Form Field Accessibility
**Learning:** Automatically linking inputs to their error messages and helper text via `aria-describedby` is crucial for screen reader users but often forgotten.
**Action:** Centralized this logic in `useFormField` composable to generate unique IDs and enforce the association automatically across all form components.
