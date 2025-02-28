import { Mongo } from 'meteor/mongo';

export const TodosCollection = new Mongo.Collection('todos');