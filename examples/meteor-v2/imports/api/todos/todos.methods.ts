import { defineMethods } from 'meteor-type-validation';
import { BelongsToCurrentUser } from '../../lib/guards/BelongsToCurrentUser';
import { TodosCollection } from './todos.collection';
import { TodoCreateSchema, TodoEditSchema, TodosSelector } from './todos.schema';

export default defineMethods({
    'todos.create': {
        schema: [TodoCreateSchema],
        guards: [BelongsToCurrentUser],
        method(todo) {
            TodosCollection.insert(todo);
        }
    },
    'todos.edit': {
        schema: [TodosSelector, TodoEditSchema],
        guards: [BelongsToCurrentUser],
        method(selector, todo) {
            TodosCollection.update(selector, { $set: todo });
        }
    },
    'todos.delete': {
        schema: [TodosSelector],
        guards: [BelongsToCurrentUser],
        method(selector) {
            TodosCollection.remove(selector);
        }
    }
})