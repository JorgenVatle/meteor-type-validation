import { describe, expectTypeOf, it } from 'vitest';
import { defineMethods, definePublications } from '../../../src';
import { CreatedByCurrentUser } from '../../lib/CreatedByCurrentUserGuard';
import { EditTodoSchema } from '../../lib/Schemas';

describe('CreatedByCurrentUser', () => {
    describe('methods', () => {
        it(`should infer that the user is logged in from the 'this' context`, () => {
            defineMethods({
                'todo.edit': {
                    schema: [EditTodoSchema],
                    guards: [CreatedByCurrentUser],
                    method(entry) {
                        expectTypeOf(this.userId).toEqualTypeOf<string>();
                    }
                }
            })
        })
    })
    describe('publications', () => {
        it(`should infer that the user is logged in from the 'this' context`, () => {
            definePublications({
                'my.todos': {
                    schema: [EditTodoSchema],
                    guards: [CreatedByCurrentUser],
                    publish(entry) {
                        expectTypeOf(this.userId).toEqualTypeOf<string>();
                    }
                }
            })
        })
    })
})