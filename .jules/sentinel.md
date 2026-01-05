## 2024-05-23 - [Weak Master Password Policy]
**Vulnerability:** The `MasterPasswordManager` contained a `validate_password` method that was effectively a no-op ("Dev mode"), allowing any password to be set.
**Learning:** Security controls (like password strength) must be enforced in the backend logic, not just relied upon in the frontend or left as TODOs. Even if "Dev mode" comments exist, they can be dangerous if left in production code.
**Prevention:** Implement validation logic immediately when creating security-critical functions, even if simple initially. Use rigorous testing to ensure constraints are met.
