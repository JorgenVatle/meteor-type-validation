import { Guard, UserLoggedInGuard } from '@meteor-type-validation/server';
import { Meteor } from 'meteor/meteor';
import * as v from 'valibot';

export class CreatedByCurrentUser extends Guard {
    public readonly writeToParams = false;
    public readonly writeToContext = false;
    
    public readonly contextSchema = UserLoggedInGuard.contextSchema;
    
    public readonly paramSchema = [
        v.object({
            createdBy: v.string(),
        }),
    ]
    
    public validate() {
        this.assertContext();
        if (this.params[0].createdBy !== this.context.userId) {
            throw new Meteor.Error(401, 'You do not have permission for this resource');
        }
    }
}