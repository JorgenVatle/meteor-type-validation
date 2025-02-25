import { describe, expectTypeOf, it } from 'vitest';
import { defineMethods, definePublications } from '../../../src';
import { AdminGuard } from '../../lib/AdminGuard';
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
        });
        
        it.todo('should extend the input params with a createdBy selector', () => {
            defineMethods({
                'todo.edit': {
                    schema: [EditTodoSchema],
                    guards: [CreatedByCurrentUser],
                    method(entry) {
                        // @ts-expect-error (This still needs to be implemented)
                        expectTypeOf(entry).toMatchTypeOf<{ createdBy: string }>()
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

describe('AdminGuard', () => {
    describe('methods', () => {
        it(`should asser that the user's 'roles' field includes 'admin'`, () => {
            defineMethods({
                'admin:todo.edit': {
                    schema: [EditTodoSchema],
                    guards: [AdminGuard],
                    method(entry) {
                        expectTypeOf(this.user).toMatchTypeOf<{ roles: 'admin'[] }>();
                    }
                }
            })
        })
    })
})