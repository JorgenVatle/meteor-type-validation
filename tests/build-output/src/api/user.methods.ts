import { defineMethods } from 'meteor-type-validation';
import { UserSchema } from '../schemas';

export default defineMethods({
    'user.create': {
        schema: [UserSchema],
        guards: [],
        method(user) {
            return user;
        }
    }
})