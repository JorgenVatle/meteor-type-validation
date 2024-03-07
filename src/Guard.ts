import { Meteor, Subscription } from '@meteor';

export abstract class Guard {
    constructor(
        public readonly context: GuardInputContext,
        protected readonly params: unknown[]
    ) {}
    public abstract validate(): asserts this;
    public abstract get validatedContext(): unknown;
}

export type GuardInputContext = Meteor.MethodThisType | Subscription

export interface GuardStatic<TGuard extends Guard = Guard> {
    new(...context: any): TGuard;
}