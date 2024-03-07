import {
    DefineMethods,
    DefinePublications,
    type WrappedMeteorMethods,
    type WrappedMeteorPublications,
} from '../../src';
import * as v from 'valibot';

export const AllMethods = DefineMethods({
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

export const AllPublications = DefinePublications({
    'todos': {
        schema: [v.object({ createdBy: v.string() })],
        guards: [],
        publish(entry) {
            entry.createdBy
        }
    }
})

declare module 'meteor/meteor' {
    interface DefinedPublications extends WrappedMeteorPublications<typeof AllPublications> {}
    interface DefinedMethods extends WrappedMeteorMethods<typeof AllMethods> {}
}
