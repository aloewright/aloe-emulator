## 2026-01-29 - O(k*n) vs O(n) in Vector Removal
**Learning:** Using `remove(0)` in a loop to remove multiple items from the beginning of a `Vec` is O(k*n) because each removal shifts the remaining elements.
**Action:** Use `Vec::drain(0..k)` instead, which is O(n) as it shifts the remaining elements only once. In benchmarks, this provided a ~2000x speedup for removing 10,000 items from a 100,000 item vector.
