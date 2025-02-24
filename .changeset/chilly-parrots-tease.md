---
"meteor-type-validation": minor
---

Provide a UserAuthenticated guard utility so peer projects don't have to write up their own validation guard for this.

- Fixed issue where the `this` context for methods and publications without guards specified would infer to `never`.
