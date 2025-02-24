import type { WrappedContext } from '../../src';
import { UserAuthenticated } from '../../src/guards/UserAuthenticated';

export class CreatedByCurrentUser extends UserAuthenticated {
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