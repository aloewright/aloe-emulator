## 2024-05-23 - Rust Vector Removal Optimization
**Learning:** `Vec::remove(0)` in a loop is an O(k*n) operation which can be a significant bottleneck for ring-buffer-like structures. Using `Vec::drain(0..k)` replaces this with a single O(n) operation.
**Action:** When implementing rolling buffers or removing multiple items from the start of a `Vec`, always use `drain` instead of repeated `remove`.
