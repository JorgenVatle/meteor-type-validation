import { Meteor } from '@meteor';
import * as v from 'valibot';
import { Guard } from './Guard';

export class UserAuthenticated extends Guard {
    
    public readonly contextSchema = v.object({
        userId: v.pipe(
            v.nullish(v.string()),
            v.transform((userId): string => {
                if (!userId) {
                    throw new Meteor.Error(401, 'You need to be logged in first');
                }
                return userId;
            }),
        ),
    })
}