import { Mongo } from 'meteor/mongo';
import type { TodosDocument } from './todos.schema';

export const TodosCollection = new Mongo.Collection<TodosDocument>('todos');