import { Meteor } from '@meteor';
import { Guard } from './Guard';

export class UserAuthenticated extends Guard {
    public validate(): asserts this is { context: { userId: string } } {
        if (!this.context.userId) {
            throw new Meteor.Error(401, 'You need to be logged in first');
        }
    }
    public get validatedContext() {
        this.validate();
        return this.context;
    }
}