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
                
                // @ts-expect-error TODO fix this inference for methods without guards
                expectTypeOf(this.userId).toEqualTypeOf<null | string>();
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