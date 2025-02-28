import { defineMethods } from 'meteor-type-validation';
import { TodosCollection } from './todos.collection';
import { TodoCreateSchema, TodoEditSchema, TodosSelector } from './todos.schema';

export default defineMethods({
    'todos.create': {
        schema: [TodoCreateSchema],
        guards: [],
        method(todo) {
            TodosCollection.insert(todo);
        }
    },
    'todos.edit': {
        schema: [TodosSelector, TodoEditSchema],
        guards: [],
        method(selector, todo) {
            TodosCollection.update(selector, { $set: todo });
        }
    },
    'todos.delete': {
        schema: [TodosSelector],
        guards: [],
        method(selector) {
            TodosCollection.remove(selector);
        }
    }
})