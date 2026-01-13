## 2024-05-23 - Accessibility of Form Field Icon Buttons
**Learning:** Icon-only buttons within form fields (like password toggles or action icons) are often overlooked for accessibility. They frequently lack `aria-label` and sometimes have `tabindex="-1"` which prevents keyboard access.
**Action:** Always verify `tabindex` on interactive elements within custom inputs. Ensure dynamic labels (e.g., "Show password" / "Hide password") are used. When adding generic icon props (like `rightIcon`), also add a corresponding `label` prop to ensure the consumer can provide an accessible name.
