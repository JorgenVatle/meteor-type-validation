# meteor-type-validation

## 2.4.0-beta.5

### Patch Changes

- 0cfacf5: Add missing exports for new reusable guard classes

## 2.4.0-beta.4

### Minor Changes

- 91e7c98: Provide `UserAuthenticated` and `UserGuard` guard classes so peer projects don't have to write up their own validation guard for this.

  - Fixed issue where the `this` context for methods and publications without guards specified would infer to `never`.
  - Refactored abstract Guard class to accept a schema property to validate context and input parameters with type-safe inference for the resulting method/publication hook.

## 2.4.0-beta.3

### Patch Changes

- ccf09fb: Fix type inference for method/publication input parameters using output instead of input types for resulting API definition objects.

  - Added warning message if publication definitions are imported by a client.

## 2.4.0-beta.2

### Patch Changes

- 4b40d1c: Fix issue where internal type definitions would be included in peer publication/method type definitions

## 2.4.0-beta.1

### Patch Changes

- 383dde3: Omit detailed type information from declared method and publication objects

## 2.4.0-beta.0

### Minor Changes

- 78f830a: Optimize types for method and publication declaration methods to avoid unnecessary work from the TS engine

## 2.3.0

### Minor Changes

- c6689f3: Update Valibot peer dependency to allow for 1.0 release candidate

  - Expose unwrapped method and publication definition types from `exposeMethods` and `exposePublications` utilities.
    - Using unwrapped method types from these methods should provide significant performance improvements within the TypeScript language server.

### Patch Changes

- accca5a: Correct package.json exports order

## 2.1.9

### Patch Changes

- c2651ce: Fix issue where validation errors thrown in async methods and publications would yield a not-so-useful generic 500 error message to users.

## 2.1.7

### Patch Changes

- 56d70eb: Allow asynchronous use of extendContext() option.
  - Fix type import for DDPRateLimiter

## 2.1.4

### Patch Changes

- 2a2cd21: Improve context typings - fixes an issue where method and publication handles were missing their original 'this' type.

## 2.1.0

### Minor Changes

- 0ca769e: Add option to specify DDPRateLimiter rules within method/publication definitions

## 2.0.4

### Patch Changes

- 24eb4ad: Handle asynchronous guard validator methods

## 2.0.3

### Patch Changes

- a66ea90: Handle inaccurate types for schemas with transform functions when calling a method or publication.

## 2.0.0

### Major Changes

- cd98aaf: Upgrade Valibot to v0.31 - contains breaking changes in the way schemas are defined and validated

## 1.0.9

### Patch Changes

- a1de2e9: Add missing return to wrapped Meteor publications/methods. Fixes an issue where publications and methods return no results.

## 1.0.8

### Patch Changes

- 3541f3f: Include dependencies in package build

## 1.0.7

### Patch Changes

- a20c843: Fix issue where original input params would be passed to handler functions instead of the parsed/validated params

## 1.0.6

### Patch Changes

- 391d400: Reduce duplication in error detail keys

## 1.0.5

### Patch Changes

- 81effcb: Include schema root errors in error details

## 1.0.4

### Patch Changes

- 72b2666: Fix issue where formatted errors would remain unused in error handler

## 1.0.3

### Patch Changes

- 8730cc0: Refactor pub/method unwrapping type helpers to be a little less verbose

## 1.0.2

### Patch Changes

- 82cf9da: Refactor internal Meteor imports to allow for use outside of an Atmosphere.js package

## 1.0.1

### Patch Changes

- 56bd962: Augment Meteor types with extendable method/publication type placeholders

  Use camelCase for exported declaration helpers
