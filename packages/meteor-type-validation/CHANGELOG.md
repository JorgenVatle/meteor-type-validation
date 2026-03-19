# meteor-type-validation

## 2.4.0-beta.17

### Minor Changes

- e74b266: Move MethodName and PublicationName utility types into the Meteor namespace

### Patch Changes

- b3b1139: Correct issue where complex validation issues could potentially send non-EJSON-compatible issue lists to clients. The issue list has been moved to the root of the error object. There is already a serialized version of issues being sent to clients, so this field was somewhat redundant in the first place.

## 2.4.0-beta.16

### Patch Changes

- 21eb08c: Optimize guard and schema param merging. Fixes an issue where TS performance would degrade very quickly with every new schema used.

## 2.4.0-beta.15

### Patch Changes

- 69f1cba: Unmark internal types to avoid issues where core types are missing

## 2.4.0-beta.14

### Minor Changes

- 159acbe: Refactor approach to type inference for Guard classes

  - Addresses issue where guard param schemas would leak into all parameter indexes regardless of position.
  - Guard context schemas are now merged into the main context schema.

## 2.4.0-beta.13

### Minor Changes

- dbad17e: Upgrade and include type-fest as part of the package's dependencies

  - Improve consistency of expected input schema types.
  - Clean up some repetition in resource definition generics

  - Fixed issue where input params for methods and publications would always be validated synchronously instead of asynchronously.

## 2.4.0-beta.12

### Patch Changes

- 6550f57: Include Meteor core module augmentation types in type validation server index module
- 5092b80: Correct package.json module paths for /types exports

## 2.4.0-beta.11

### Patch Changes

- ad626f6: Fix namespacing for resource types export

## 2.4.0-beta.10

### Minor Changes

- 84a4f93: Use namespaced export for resource definition type helpers.

## 2.4.0-beta.9

### Minor Changes

- 00321dc: Export method/publication definition types as interfaces instead of types to allow for easier extension of the base types by peer projects.
- 09bef99: - Extend Meteor core Meteor.subscribe() method type with untyped subscribe callbacks parameter
  - Refactor Meteor type declarations to utilize helper types instead of directly accessing resource definition maps for inferring types.
  - Simplify file structure for package dist. Fixes an issue where some types would only be available in a type chunk file.
  - Improve error formatting for Valibot error messages.
  - Add helper function for programmatically composing guard classes.
- d1ed589: - Improve default error message formatting for validation errors.
  - Export MeteorValiError class and ValiErrorDetails types for easier error checks in peer projects

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
