---
"meteor-type-validation": minor
---

Update Valibot peer dependency to allow for 1.0 release candidate

- Expose unwrapped method and publication definition types from `exposeMethods` and `exposePublications` utilities.
  - Using unwrapped method types from these methods should provide significant performance improvements within the TypeScript language server. 