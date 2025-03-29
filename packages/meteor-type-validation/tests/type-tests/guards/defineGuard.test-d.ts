import { defineGuard, defineMethods } from '@meteor-type-validation/server';
import * as v from 'valibot';
import { describe, expectTypeOf, it } from 'vitest';

describe('defineGuard', () => {
    describe('contextSchema', () => {
        it('should infer the context type from the provided schema', () => {
            defineMethods({
                'todo.create': {
                    guards: [defineGuard({
                        contextSchema: v.object({ userId: v.string(), sessionStartedAt: v.date() }),
                        paramSchema: [v.object({ title: v.string() })],
                        writeToContext: true,
                        writeToParams: false,
                    })],
                    schema: [v.object({ title: v.string() })],
                    method(entry) {
                        expectTypeOf(this.userId).toEqualTypeOf<string>();
                        expectTypeOf(this.sessionStartedAt).toEqualTypeOf<Date>();
                    }
                }
            })
        })
    })
})