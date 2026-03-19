import { definePublications } from 'meteor-type-validation';
import { BelongsToCurrentUser } from '../../lib/guards/BelongsToCurrentUser';
import { TodosCollection } from './todos.collection';
import { TodosQueryOptions, TodosSelector } from './todos.schema';

export default definePublications({
    'todos': {
        schema: [TodosSelector, TodosQueryOptions],
        guards: [BelongsToCurrentUser],
        publish(query, options) {
            return TodosCollection.find(query, options);
        }
    }
});