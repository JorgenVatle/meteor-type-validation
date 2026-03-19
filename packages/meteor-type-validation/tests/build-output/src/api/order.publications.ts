import { definePublications } from 'meteor-type-validation';
import { Mongo } from 'meteor/mongo';
import type { Order } from '../schemas';

export default definePublications({
    'orders': {
        schema: [],
        guards: [],
        publish() {
            return {} as Mongo.Cursor<Order>
        }
    }
});