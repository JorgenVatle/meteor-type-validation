---
"meteor-type-validation": patch
---

Optimize guard and schema param merging. Fixes an issue where TS performance would degrade very quickly with every new schema used.
