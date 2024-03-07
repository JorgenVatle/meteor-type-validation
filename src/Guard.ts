import { Meteor, Subscription } from '@meteor';
import type { BaseSchema } from 'valibot';
import type { UnwrapSchemas } from './types/ValidatedResources';

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

export type GuardFunction<
    TSchemas extends BaseSchema[] = BaseSchema[],
> = (request: {
    context: GuardInputContext,
    params: UnwrapSchemas<TSchemas>
}) => asserts request;