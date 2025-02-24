import { describe, expectTypeOf, it } from 'vitest';
import { defineMethods, definePublications } from '../../../src/Definitions';
import { UserAuthenticated } from '../../../src/guards/UserAuthenticated';
import { TodoDocumentSchema } from '../../lib/Schemas';

describe('methods', () => {
    it(`should infer that this.userId is not null`, () => {
        defineMethods({
            'todos.create': {
                guards: [UserAuthenticated],
                schema: [TodoDocumentSchema],
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
                schema: [TodoDocumentSchema],
                publish(todo) {
                    expectTypeOf(this.userId).toEqualTypeOf<string>();
                }
            }
        })
    })
})