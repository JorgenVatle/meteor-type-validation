import { Mongo } from 'meteor/mongo';
import type { TodoDocument } from './todos.schema';

export const TodosCollection = new Mongo.Collection<TodoDocument>('todos');