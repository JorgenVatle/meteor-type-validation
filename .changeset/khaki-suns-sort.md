---
"meteor-type-validation": minor
---

Rename `UserAuthenticated` guard class to `UserLoggedInGuard` to more explicitly indicate its purpose.

- Add support for both Meteor v3 and v2 to `UserGuard`
- Require `writeToParams`, `paramSchema` and `contextSchema` to be explicitly defined within Guard classes.