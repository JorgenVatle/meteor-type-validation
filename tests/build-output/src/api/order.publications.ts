import { Mongo } from 'meteor/mongo';
import { definePublications } from '../../../../dist/index';
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