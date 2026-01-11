## 2024-05-23 - [Zero-Allocation Terminal Output Filtering]
**Learning:** Returning `Cow<'a, str>` instead of `String` for text processing functions is a powerful pattern when the output is often identical to the input.
**Action:** Use `Cow` for any filter/processor that often passes data through unchanged. Also, prefer `std::str::from_utf8` over `String::from_utf8` when you only need to read the string temporarily, to avoid allocation.
