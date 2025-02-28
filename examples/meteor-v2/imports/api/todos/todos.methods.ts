import { defineMethods } from 'meteor-type-validation';
import * as v from 'valibot';
import { TodosCollection } from './todos.collection';
import { TodosSchema } from './todos.schema';

export default defineMethods({
    'todos.create': {
        schema: [TodosSchema],
        guards: [],
        method(todo) {
            TodosCollection.insert(todo);
        }
    },
    'todos.edit': {
        schema: [TodosSchema],
        guards: [],
        method(todo) {
            TodosCollection.update(todo._id, { $set: todo });
        }
    },
    'todos.delete': {
        schema: [v.pick(TodosSchema, ['_id'])],
        guards: [],
        method({ _id }) {
            TodosCollection.remove(_id);
        }
    }
})