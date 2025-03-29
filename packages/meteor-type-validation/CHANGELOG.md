# meteor-type-validation

## 2.4.0-beta.8

### Patch Changes

- cfab321: Prevent internal Promise.await declaration for Meteor V2 from being exported into peer projects.

## 2.4.0-beta.7

### Minor Changes

- 6eb95b7: Rename `UserAuthenticated` guard class to `UserLoggedInGuard` to more explicitly indicate its purpose.

  - Add support for both Meteor v3 and v2 to `UserGuard`
  - Require `writeToParams`, `paramSchema` and `contextSchema` to be explicitly defined within Guard classes.

### Patch Changes

- 4ab352b: Add missing generic properties to built-in guard classes

## 2.4.0-beta.6

### Minor Changes

- 062b334: Add Meteor v2 compatability

  - Add option to either rewrite or patch input params from guards.
  - Implement type inference for validated guard input params.
  - Move `MeteorApi` type helper into `meteor-type-validation/client` to avoid bundling redundant code into the client.
  - Refactor return types for method/publication expose methods to allow the TS compiler to fully resolve types at build time instead of creating dynamic types.
