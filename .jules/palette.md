## 2024-05-23 - Accessibility of Form Fields
**Learning:** Adding `aria-invalid` and `aria-describedby` to form inputs significantly improves the screen reader experience by explicitly linking error messages and helper text to the input field. This allows users to immediately understand why a field is invalid or what is expected of them without having to navigate around the DOM.
**Action:** Always ensure form components expose their validation state and descriptive text IDs to the native input element via ARIA attributes.
