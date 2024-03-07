import {
    defineMethods,
    definePublications,
    type UnwrapMethods,
    type UnwrapPublications,
} from '../../src';
import * as v from 'valibot';

export const AllMethods = defineMethods({
    'todo.add': {
        schema: [v.object({ title: v.string() })],
        guards: [],
        method(entry) {
            entry.title
        }
    },
    'todo.remove': {
        schema: [v.object({ _id: v.string() })],
        guards: [],
        method(entry) {
            entry._id
        }
    }
});

export const AllPublications = definePublications({
    'todos': {
        schema: [v.object({ createdBy: v.string() })],
        guards: [],
        publish(entry) {
            entry.createdBy
        }
    }
})

declare module 'meteor/meteor' {
    interface DefinedPublications extends UnwrapPublications<typeof AllPublications> {}
    interface DefinedMethods extends UnwrapMethods<typeof AllMethods> {}
}
