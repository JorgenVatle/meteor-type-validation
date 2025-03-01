# meteor-type-validation

## 2.4.0-beta.6

### Minor Changes

- 062b334: Add Meteor v2 compatability

  - Add option to either rewrite or patch input params from guards.
  - Implement type inference for validated guard input params.
  - Move `MeteorApi` type helper into `meteor-type-validation/client` to avoid bundling redundant code into the client.
  - Refactor return types for method/publication expose methods to allow the TS compiler to fully resolve types at build time instead of creating dynamic types.
