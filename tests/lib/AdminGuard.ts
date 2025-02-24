import { Meteor } from '@meteor';
import type { InferOutput } from 'valibot';
import * as v from 'valibot';
import { UserAuthenticated } from '../../src/guards/UserAuthenticated';

export class AdminGuard extends UserAuthenticated {
    
    public validate(): asserts this is {
        context: InferOutput<AdminGuard['contextSchema']>,
    } {
        return super.validate();
    }
    
    public readonly contextSchema = v.objectAsync({
        userId: v.pipeAsync(v.string(), v.checkAsync(async (userId) => {
            const user = await Meteor.users.findOneAsync({ _id: userId });
            return !!user?.roles.includes('admin');
        })),
    })
    
    public get validatedContext() {
        this.validate();
        return this.context;
    }
}

declare module 'meteor/meteor' {
    namespace Meteor {
        interface User {
            roles: ('admin' | 'user')[];
        }
    }
}