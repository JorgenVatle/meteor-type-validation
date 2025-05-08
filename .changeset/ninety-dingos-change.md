---
"meteor-type-validation": minor
---

Refactor approach to type inference for Guard classes

- Addresses issue where guard param schemas would leak into all parameter indexes regardless of position.
- Guard context schemas are now merged into the main context schema.