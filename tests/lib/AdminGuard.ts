import * as v from 'valibot';
import { Guard } from '../../src';
import { UserGuard } from '../../src/guards/UserGuard';

export class AdminGuard extends Guard {
    
    public writeToContext = false;
    
    public readonly contextSchema = v.pipeAsync(
        UserGuard.contextSchema,
        v.objectAsync({
            userId: v.string(),
            user: v.pipe(v.any(), v.object({
                roles: v.pipe(
                    v.array(v.string()),
                    v.includes('admin')
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