import { defineMethods, definePublications } from 'src/server/Definitions';
import { UserLoggedInGuard } from 'src/server/guards/UserLoggedInGuard';
import { describe, expectTypeOf, it } from 'vitest';
import { CreateTodoSchema } from '../../lib/Schemas';

describe('methods', () => {
    it(`should infer that this.userId is not null`, () => {
        defineMethods({
            'todos.create': {
                guards: [UserLoggedInGuard],
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
                guards: [UserLoggedInGuard],
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
                guards: [UserLoggedInGuard],
                schema: [CreateTodoSchema],
                publish(todo) {
                    expectTypeOf(this.userId).toEqualTypeOf<string>();
                }
            }
        })
    })
})