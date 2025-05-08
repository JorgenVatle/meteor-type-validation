import { defineMethods, definePublications, Guard, UserLoggedInGuard } from '@meteor-type-validation/server';
import { Meteor } from 'meteor/meteor';
import * as v from 'valibot';
import { describe, expectTypeOf, it } from 'vitest';
import { EditTodoSchema } from '../../lib/Schemas';

describe('CreatedByCurrentUser', () => {
    class CreatedByCurrentUser extends Guard {
        public readonly writeToParams = false;
        public readonly writeToContext = false;
        
        public readonly contextSchema = UserLoggedInGuard.contextSchema;
        
        public readonly paramSchema = [
            v.object({
                createdBy: v.string(),
            }),
        ]
        
        public validate() {
            this.assertContext();
            if (this.params[0].createdBy !== this.context.userId) {
                throw new Meteor.Error(401, 'You do not have permission for this resource');
            }
        }
    }
    
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
                    guards: [UserLoggedInGuard, CreatedByCurrentUser],
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
    class AdminGuard extends Guard {
        
        public readonly writeToParams = false;
        public readonly paramSchema = [];
        public readonly writeToContext = false;
        
        public readonly contextSchema = v.objectAsync({
            userId: v.string(),
            user: v.pipe(v.any(), v.object({
                roles: v.pipe(
                    v.array(v.picklist(['admin'])),
                )
            })),
        });
    }
    
    describe('methods', () => {
        it(`should assert that the user's 'roles' field includes 'admin'`, () => {
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
        
        it(`should not lose the original param schema type`, () => {
            defineMethods({
                'admin:todo.edit': {
                    schema: [EditTodoSchema],
                    guards: [AdminGuard],
                    method(entry) {
                        expectTypeOf(entry).toEqualTypeOf<{
                            _id: string,
                            title: string,
                            completed: boolean,
                        }>()
                    }
                }
            })
        })
    })
});

describe('PermissionGuard', () => {
    describe('methods', () => {
        it(`should assert that the user's 'roles' field includes 'admin'`, () => {
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
        
        it(`should not lose the original param schema type`, () => {
            defineMethods({
                'admin:todo.edit': {
                    schema: [EditTodoSchema],
                    guards: [AdminGuard],
                    method(entry) {
                        expectTypeOf(entry).toEqualTypeOf<{
                            _id: string,
                            title: string,
                            completed: boolean,
                        }>()
                    }
                }
            })
        })
    })
})

describe('QueryValidationGuard', () => {
    class QueryValidationGuard extends Guard {
        
        public readonly writeToParams = false;
        public readonly writeToContext = false;
        public readonly contextSchema = v.object({})
        public readonly paramSchema = [
            v.object({
                channelId: v.string(),
            }),
            v.object({
                fields: v.record(
                    v.picklist([
                        'title',
                        'message',
                        'user.name',
                        'createdAt'
                    ]),
                    v.literal(1)
                ),
                limit: v.pipe(
                    v.number(),
                    v.integer(),
                    v.minValue(1),
                    v.maxValue(100)
                ),
            })
        ];
        
    }
    
    describe('methods', () => {
        it(`can infer parameter types only from the guard's schema type`, () => {
            defineMethods({
                'channel.messages': {
                    schema: [],
                    guards: [QueryValidationGuard],
                    method(query, options) {
                        expectTypeOf(query).toEqualTypeOf<{ channelId: string }>();
                        expectTypeOf(options).toMatchTypeOf<{ limit: number }>();
                    }
                }
            })
        })
    })
})