import { Meteor } from '@meteor';
import type { Meteor as _Meteor } from 'meteor/meteor';
import * as v from 'valibot';
import { UserAuthenticated } from '../../src/guards/UserAuthenticated';
import { Guard } from './Guard';

export class UserGuard extends Guard {
    
    public readonly writeToContext = true;
    
    /**
     * Fields to retrieve and store alongside current context.
     * You can extend this class to provide more fields.
     */
    public static readonly fields: Partial<Record<keyof _Meteor.User, 1 | 0>> = {
        _id: 1,
        emails: 1,
        username: 1,
        profile: 1,
        createdAt: 1,
    }
    
    public readonly contextSchema = v.pipeAsync(
        UserAuthenticated.contextSchema,
        v.transformAsync(async (context) => {
            const user = await Meteor.users.findOneAsync(context.userId, { fields: UserGuard.fields });
            
            // This shouldn't really happen, but let's check for it anyway.
            if (!user) {
                throw new Meteor.Error(500, 'Unable to retrieve user details!')
            }
            
            return Object.assign(context, { user });
        })
    )
    
}
