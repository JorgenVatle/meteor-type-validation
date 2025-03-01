import { Guard, UserAuthenticated } from 'meteor-type-validation';
import * as v from 'valibot';

export class BelongsToCurrentUser extends Guard {
    public readonly writeToContext = false;
    public readonly writeToParams = 'patch';
    
    public readonly contextSchema = UserAuthenticated.contextSchema;
    public readonly paramSchema = [
        v.pipe(
            v.object({}),
            v.transform((input) => Object.assign(input, { userId: this.context.userId! }))
        )
    ]
    
}