import { exposeMethods, exposePublications } from 'meteor-type-validation';
import TodoMethods from './todos/todos.methods';
import TodoPublications from './todos/todos.publications';

const Publications = exposePublications({
    ...TodoPublications,
});

const Methods = exposeMethods({
    ...TodoMethods,
})

export type Methods = typeof Methods;
export type Publications = typeof Publications;


declare module 'meteor/meteor' {
    interface DefinedMethods extends Methods {}
    interface DefinedPublications extends Publications {}
}