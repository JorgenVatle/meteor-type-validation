---
"meteor-type-validation": patch
---

Fix issue where validation errors thrown in async methods and publications would yield a not-so-useful generic 500 error message to users.
