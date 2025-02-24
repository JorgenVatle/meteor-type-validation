import { describe, expectTypeOf, it } from 'vitest';
import { defineMethods, definePublications } from '../../../src/Definitions';
import { UserAuthenticated } from '../../../src/guards/UserAuthenticated';
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