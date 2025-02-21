import { defineMethods } from 'meteor-type-validation';
import { OrderSchema } from '../schemas';

export default defineMethods({
    'orders.create': {
        schema: [OrderSchema],
        guards: [],
        method(order) {
            return  order;
        }
    }
});