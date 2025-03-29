---
"meteor-type-validation": minor
---

- Extend Meteor core Meteor.subscribe() method type with untyped subscribe callbacks parameter
- Refactor Meteor type declarations to utilize helper types instead of directly accessing resource definition maps for infering types.
- Simplify file structure for package dist. Fixes an issue where some types would only be available in a type chunk file.
