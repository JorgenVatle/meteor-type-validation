import { Guard } from 'src';
import { UserGuard } from 'src/server/guards';
import * as v from 'valibot';

export class AdminGuard extends Guard {
    
    public readonly writeToParams = false;
    public readonly paramSchema = [];
    public readonly writeToContext = false;
    
    public readonly contextSchema = v.pipeAsync(
        UserGuard.contextSchema,
        v.objectAsync({
            userId: v.string(),
            user: v.pipe(v.any(), v.object({
                roles: v.pipe(
                    v.array(v.picklist(['admin'])),
                )
            })),
        }),
    )
    
}

declare module 'meteor/meteor' {
    namespace Meteor {
        interface User {
            roles: ('admin' | 'user')[];
        }
    }
}