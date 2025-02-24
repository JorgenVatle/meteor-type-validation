import { Meteor } from '@meteor';
import * as v from 'valibot';
import { UserAuthenticated } from '../../src/guards/UserAuthenticated';

export class CreatedByCurrentUser extends UserAuthenticated {
    public readonly writeToParams = false;
    public readonly writeToContext = false;
    
    
    public readonly inputSchema = [
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