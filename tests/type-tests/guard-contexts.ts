import {
    defineMethods,
    definePublications, Guard,
    type UnwrapMethods,
    type UnwrapPublications, type WrappedContext,
} from '../../src';
import * as v from 'valibot';

class UserAuthenticated extends Guard {
    public validate(): asserts this is { context: { userId: string } } {}
    public get validatedContext() {
        this.validate();
        return this.context;
    }
}

class CreatedByCurrentUser extends UserAuthenticated {
    constructor(context: WrappedContext, protected readonly params: [{ createdBy: string }, ...rest: unknown[]]) {
        super(context, params);
    }
    
    public validate(): asserts this is {
        context: { userId: string },
        params: [{ createdBy: string }, ...unknown[]]
    } {
        if (!this.params[0]?.createdBy) {
            throw new Error('No user ID')
        }
        return super.validate();
    }
    
    public get validatedContext() {
        this.validate();
        return this.context;
    }
}

export const AllMethods = defineMethods({
    'user:todo.add': {
        schema: [v.object({ title: v.string() })],
        guards: [UserAuthenticated],
        method(entry) {
            entry.title = ''
            this.userId = '';
            
            // @ts-expect-error
            entry.title = null;
            // @ts-expect-error
            this.userId = null;
            // @ts-expect-error
            entry._id
        }
    },
    'admin:todo.remove': {
        schema: [v.object({ _id: v.string() })],
        // todo: Ensure a type error is thrown here as the provided schema does not have the required guard params
        guards: [CreatedByCurrentUser],
        method(entry) {
            entry._id
            
            // @ts-expect-error
            this.userId = null;
            // @ts-expect-error
            entry.title
        }
    }
});

export const AllPublications = definePublications({
    'admin:todos': {
        schema: [v.object({ createdBy: v.string() })],
        guards: [CreatedByCurrentUser],
        publish(entry) {
            entry.createdBy
            this.userId = '';
            
            // @ts-expect-error
            this.userId = null;
            // @ts-expect-error
            entry._id
        }
    }
})

declare module 'meteor/meteor' {
    interface DefinedPublications extends UnwrapPublications<typeof AllPublications> {}
    interface DefinedMethods extends UnwrapMethods<typeof AllMethods> {}
}


