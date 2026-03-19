---
"meteor-type-validation": minor
---

Provide `UserAuthenticated` and `UserGuard` guard classes so peer projects don't have to write up their own validation guard for this.

- Fixed issue where the `this` context for methods and publications without guards specified would infer to `never`.
- Refactored abstract Guard class to accept a schema property to validate context and input parameters with type-safe inference for the resulting method/publication hook.
