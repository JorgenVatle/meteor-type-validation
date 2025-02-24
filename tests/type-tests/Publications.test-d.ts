import { expectTypeOf, it } from 'vitest';
import { definePublications } from '../../src';
import { QueryTodoSchema } from '../lib/Schemas';

it('should infer method params types from the provided schema', () => {
    definePublications({
        'todos': {
            schema: [QueryTodoSchema],
            guards: [],
            publish(entry) {
                expectTypeOf(entry).toEqualTypeOf<Partial<{
                    _id: string,
                    title: RegExp,
                    completed: boolean,
                    createdAt: {
                        $gt: Date,
                        $lt: Date,
                    }
                }>>();
                
                expectTypeOf(this.userId).toEqualTypeOf<null | string>();
            }
        },
    })
});

it.todo(`should have the same 'this' context as Meteor's publication methods`, () => {
    definePublications({
        'todos': {
            schema: [QueryTodoSchema],
            guards: [],
            publish(entry) {
                expectTypeOf(this).toMatchTypeOf<{
                    added: (...params: any) => any,
                }>()
            }
        },
    })
});

it('defined methods should yield a map with schema input types, not output types', () => {
    const methods = definePublications({
        'todo.create': {
            schema: [QueryTodoSchema],
            guards: [],
            publish(entry) {}
        },
    })
    
    expectTypeOf(methods['todo.create'].publish).parameters.toEqualTypeOf<[
        Partial<{
            _id: string,
            title: string,
            completed: boolean,
            createdAt: {
                $gt: Date,
                $lt: Date,
            }
        }>
    ]>()
})