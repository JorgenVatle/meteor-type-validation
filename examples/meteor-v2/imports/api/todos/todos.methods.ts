import { defineMethods } from 'meteor-type-validation';
import { TodosCollection } from './todos.collection';
import { TodosSchema } from './todos.schema';

export default defineMethods({
    'todos.create': {
        schema: [TodosSchema],
        guards: [],
        method(todo) {
            TodosCollection.insert(todo);
        }
    }
})