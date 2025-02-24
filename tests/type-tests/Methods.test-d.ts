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
                }>();
                
                expectTypeOf(this.userId).toEqualTypeOf<null | string>();
            }
        },
    })
})