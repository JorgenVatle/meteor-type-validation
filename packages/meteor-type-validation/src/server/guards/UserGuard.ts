import type { Meteor as _Meteor } from 'meteor/meteor';
import { Meteor } from 'meteor/meteor';
import * as v from 'valibot';
import { Guard } from './Guard';
import { UserLoggedInGuard } from './UserLoggedInGuard';

/**
 * Validate that user is logged in and attach the user object to the method/publication context.
 *
 * @note If you don't need a full user object within your method/publication context, you should use
 * {@link UserLoggedInGuard} instead to avoid spending time fetching data you won't use.
 */
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
    
    public static readonly contextSchema = v.pipeAsync(
        UserLoggedInGuard.contextSchema,
        v.transformAsync(async (context) => {
            const user = await Meteor.users.findOneAsync(context.userId, { fields: UserGuard.fields });
            
            // This shouldn't really happen, but let's check for it anyway.
            if (!user) {
                throw new Meteor.Error(500, 'Unable to retrieve user details!')
            }
            
            return Object.assign(context, { user });
        })
    );
    
    public readonly contextSchema = UserGuard.contextSchema;
    
}
