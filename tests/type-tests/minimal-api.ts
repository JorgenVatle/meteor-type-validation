import * as v from 'valibot';
import { defineMethods, definePublications, exposeMethods, exposePublications } from '../../src';

export const AllMethods = defineMethods({
    'todo.add': {
        schema: [v.object({ title: v.string() })],
        guards: [],
        method(entry) {
            entry.title
            
            // @ts-expect-error
            entry._id
        }
    },
    'todo.remove': {
        schema: [v.object({ _id: v.string() })],
        guards: [],
        method(entry) {
            entry._id
            
            // @ts-expect-error
            entry.title
        }
    }
});

export const AllPublications = definePublications({
    'todos': {
        schema: [v.object({ createdBy: v.string() })],
        guards: [],
        publish(entry) {
            entry.createdBy
            
            // @ts-expect-error
            entry._id
        }
    }
})


const Methods = exposeMethods(AllMethods);
const Publications = exposePublications(AllPublications);
type Publications = typeof Publications;
type Methods = typeof Methods;

declare module 'meteor/meteor' {
    interface DefinedPublications extends Publications {}
    interface DefinedMethods extends Methods {}
}



