import { defineMethods, definePublications, UserAuthenticated } from 'src';
import { describe, expectTypeOf, it } from 'vitest';
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
        
        it('should extend the input params with a createdBy selector', () => {
            defineMethods({
                'todo.edit': {
                    schema: [EditTodoSchema],
                    guards: [CreatedByCurrentUser],
                    method(entry) {
                        expectTypeOf(entry).toMatchTypeOf<{ createdBy: string }>()
                    }
                }
            })
        })
        
        it('can be used alongside other guards', () => {
            defineMethods({
                'todo.edit': {
                    schema: [EditTodoSchema],
                    guards: [UserAuthenticated, CreatedByCurrentUser],
                    method(entry) {
                        expectTypeOf(entry).toMatchTypeOf<{ createdBy: string }>();
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