import { defineMethods, exposeMethods } from '@meteor-type-validation/server';
import * as v from 'valibot';
import { describe, expectTypeOf, it } from 'vitest';
import { CreateTodoSchema } from '../lib/Schemas';

it('should infer method params types from the provided schema', () => {
    defineMethods({
        'todo.create': {
            schema: [CreateTodoSchema],
            guards: [],
            method(entry) {
                expectTypeOf(entry).toEqualTypeOf<{
                    title: string;
                    completed: boolean;
                    createdAt: Date,
                }>();
                
                expectTypeOf(entry).not.toEqualTypeOf<{
                    title: string;
                    completed: boolean;
                    createdAt: Date,
                    forbiddenField: true,
                }>()
                
                expectTypeOf(this.userId).toEqualTypeOf<null | string>();
            }
        },
    })
});

it('defined methods should yield a map with schema input types, not output types', () => {
    const methods = defineMethods({
        'todo.create': {
            schema: [CreateTodoSchema],
            guards: [],
            method(entry) {}
        },
    })
    
    expectTypeOf(methods['todo.create'].method).parameters.toEqualTypeOf<[
        { title: string, completed: boolean }
    ]>()
});


describe('larger method objects', () => {
    
    it('does not impact the types of other methods within the same object', () => {
        const methods = defineMethods({
            'todo.create': {
                schema: [CreateTodoSchema],
                guards: [],
                method(entry) {
                    expectTypeOf(entry).toEqualTypeOf<{
                        title: string;
                        completed: boolean;
                        createdAt: Date,
                    }>();
                }
            },
            
            'todo.addUser': {
                schema: [
                    v.object({
                        newUserId: v.string()
                    })
                ],
                guards: [],
                method(entry) {
                    expectTypeOf(entry).toEqualTypeOf<{
                        newUserId: string;
                    }>();
                }
            }
        });
    })
})

describe('return types', () => {
    const specification = defineMethods({
        'todo.create': {
            schema: [CreateTodoSchema],
            guards: [],
            method(entry) {
                return { _id: 123, ...entry }
            }
        },
        'todo.delete': {
            schema: [CreateTodoSchema],
            guards: [],
            method(entry) {
                return { _id: 123 }
            }
        }
    });
    const methods = exposeMethods(specification);
    
    it('preserves return types', () => {
        expectTypeOf(methods['todo.create']).returns.toEqualTypeOf<{
            _id: number;
            title: string;
            completed: boolean;
            createdAt: Date,
        }>()
        
        expectTypeOf(methods['todo.delete']).returns.toEqualTypeOf<{
            _id: number;
        }>()
    })
})
