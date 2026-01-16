## 2024-05-23 - Rust Vector Performance
**Learning:** `Vec::remove(0)` in a loop is O(k*n) where k is the number of removals and n is the vector length. This is catastrophic for large vectors (e.g., terminal buffers).
**Action:** Always use `Vec::drain(range)` for bulk removal, which is O(n) (where n is the number of elements shifted). Benchmark showed ~2700x improvement for removing 50k items from a 100k vector.
