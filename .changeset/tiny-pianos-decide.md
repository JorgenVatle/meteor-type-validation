---
"meteor-type-validation": minor
---

Upgrade and include type-fest as part of the package's dependencies

- Improve consistency of expected input schema types.
- Clean up some repetition in resource definition generics

- Fixed issue where input params for methods and publications would always be validated synchronously instead of asynchronously.