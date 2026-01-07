## 2024-02-18 - [CRITICAL] Hardcoded Dev Mode Password Bypass
**Vulnerability:** The `validate_password` function in `MasterPasswordManager` contained a dev-mode stub that explicitly allowed any password, bypassing all security checks.
**Learning:** Development shortcuts like "allow any password" often persist into later stages if not explicitly tracked or marked with `TODO` / `FIXME` that fails CI.
**Prevention:**
1. Avoid "allow all" stubs even in dev; implement a minimal valid check instead.
2. Use `#[cfg(debug_assertions)]` if dev-only behavior is absolutely necessary, but ensure production builds always use secure defaults.
3. Add tests that explicitly fail if weak passwords are accepted.
