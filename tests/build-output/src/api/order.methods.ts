import { defineMethods } from '../../../../dist/index';
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