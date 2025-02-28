import { defineMethods, definePublications } from 'src/Definitions';
import { UserAuthenticated } from 'src/guards/UserAuthenticated';
import { describe, expectTypeOf, it } from 'vitest';
import { CreateTodoSchema } from '../../lib/Schemas';

describe('methods', () => {
    it(`should infer that this.userId is not null`, () => {
        defineMethods({
            'todos.create': {
                guards: [UserAuthenticated],
                schema: [CreateTodoSchema],
                method(todo) {
                    expectTypeOf(this.userId).toEqualTypeOf<string>();
                }
            }
        })
    })
    
    it(`should not affect types from the provided schema`, () => {
        defineMethods({
            'todos.create': {
                guards: [UserAuthenticated],
                schema: [CreateTodoSchema],
                method(todo) {
                    expectTypeOf(todo).toEqualTypeOf<{
                        title: string,
                        completed: boolean,
                        createdAt: Date,
                    }>();
                }
            }
        })
    })
})

describe('publications', () => {
    it(`should infer that this.userId is not null`, () => {
        definePublications({
            'todos': {
                guards: [UserAuthenticated],
                schema: [CreateTodoSchema],
                publish(todo) {
                    expectTypeOf(this.userId).toEqualTypeOf<string>();
                }
            }
        })
    })
})