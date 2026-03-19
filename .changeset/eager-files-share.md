---
"meteor-type-validation": patch
---

Correct issue where complex validation issues could potentially send non-EJSON-compatible issue lists to clients. The issue list has been moved to the root of the error object. There is already a serialized version of issues being sent to clients, so this field was somewhat redundant in the first place.
