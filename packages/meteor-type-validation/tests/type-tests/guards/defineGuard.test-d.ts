import { defineGuard, defineMethods } from '@meteor-type-validation/server';
import * as v from 'valibot';
import { describe, expectTypeOf, it } from 'vitest';

describe('defineGuard methods', () => {
    describe('contextSchema', () => {
        it('is included in the method\'s context', () => {
            defineMethods({
                'todo.create': {
                    guards: [defineGuard({
                        contextSchema: v.object({ userId: v.string(), sessionStartedAt: v.date() }),
                        paramSchema: [],
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
    
    describe('paramsSchema', () => {
        it('will extend the method\'s params type when writeToParams is enabled', () => {
            defineMethods({
                'todo.create': {
                    guards: [defineGuard({
                        contextSchema: v.object({}),
                        paramSchema: [
                            v.pipe(
                                v.object({ orderId: v.string() }),
                                v.transform((input) => {
                                    return {
                                        ...input,
                                        order: { createdAt: new Date() }
                                    }
                                })
                            )
                        ],
                        writeToContext: false,
                        writeToParams: 'patch',
                    })],
                    schema: [v.object({ orderId: v.string() })],
                    method(entry) {
                        expectTypeOf(entry).toEqualTypeOf<{ orderId: string, order: { createdAt: Date } }>();
                        expectTypeOf(entry).not.toEqualTypeOf<{ 'unexpected-key': true }>();
                    }
                }
            })
        })
    })
})