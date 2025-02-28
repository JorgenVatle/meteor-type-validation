import { expectTypeOf, it } from 'vitest';
import { defineMethods } from '../../src';
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
})