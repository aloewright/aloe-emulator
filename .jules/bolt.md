## 2024-05-23 - Rust Vec Performance: drain vs remove(0)
**Learning:** `Vec::remove(0)` inside a loop is O(k*n) where k is iterations and n is vector length. This is catastrophic for large vectors (e.g., terminal buffers).
**Action:** Always use `Vec::drain(0..k)` for batch removal from the front, which is O(n).
