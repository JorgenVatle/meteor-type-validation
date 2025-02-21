import { defineMethods, definePublications, UnwrapPublications, UnwrapMethods } from 'dist/index';
import { Mongo } from 'meteor/mongo';
import { type Order, OrderSchema } from './schemas';

export const Methods = defineMethods({
    'orders.create': {
        schema: [OrderSchema],
        guards: [],
        method(order) {
            return  order;
        }
    }
});


export const Publications = definePublications({
    'orders': {
        schema: [],
        guards: [],
        publish() {
            return {} as Mongo.Cursor<Order>
        }
    }
});

export interface DefinedPublications extends UnwrapPublications<typeof Publications> {}
export interface DefinedMethods extends UnwrapMethods<typeof Methods> {}