# meteor-type-validation

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
