import { Guard } from './Guard';

export class UserAuthenticated extends Guard {
    public validate(): asserts this is { context: { userId: string } } {}
    public get validatedContext() {
        this.validate();
        return this.context;
    }
}