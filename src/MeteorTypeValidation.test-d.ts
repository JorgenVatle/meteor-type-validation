import { describe, expectTypeOf, it } from 'vitest';
import { defineMethods, exposeMethods } from './Definitions';
import { Guard } from './Guard';
import * as v from 'valibot';

class UserAuthenticated extends Guard {
    public validate(): asserts this is { context: { userId: string } } {}
    public get validatedContext() {
        this.validate();
        return this.context;
    }
}

const TodoDocumentSchema = v.object({
    title: v.string(),
    completed: v.boolean(),
})

describe('Method guard context type inference', () => {
    describe('UserAuthenticated guard', () => {
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
    })

})