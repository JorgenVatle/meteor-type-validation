import * as v from 'valibot';
import { expectTypeOf, it } from 'vitest';
import { defineMethods } from '../../../src/Definitions';
import { UserAuthenticated } from '../../../src/guards/UserAuthenticated';

const TodoDocumentSchema = v.object({
    title: v.string(),
    completed: v.boolean(),
})

it(`should infer that this.userId is not null`, () => {
    defineMethods({
        'todos.create': {
            guards: [UserAuthenticated],
            schema: [
                TodoDocumentSchema,
            ],
            method(todo) {
                expectTypeOf(this.userId).toEqualTypeOf<string>();
            }
        }
    })
})