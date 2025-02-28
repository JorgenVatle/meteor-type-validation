import { Meteor } from '@meteor';
import * as v from 'valibot';
import { Guard } from './Guard';

/**
 * Checks whether the current user is logged in.
 * Throws a 401 error if not.
 */
export class UserAuthenticated extends Guard {
    
    public readonly writeToContext = false;
    public static readonly contextSchema = v.object({
        userId: v.pipe(
            v.nullable(v.string()),
            v.transform((userId): string => {
                if (!userId) {
                    throw new Meteor.Error(401, 'You need to be logged in first');
                }
                return userId;
            }),
        ),
    });
    
    public readonly contextSchema = UserAuthenticated.contextSchema;
}