import type { GenericSchema } from 'valibot';
import type { BaseContext, UnwrapSchemaOutput } from './types/ValidatedResources';

export abstract class Guard {
    constructor(
        public readonly context: BaseContext,
        protected readonly params: unknown[]
    ) {}
    public abstract validate(): asserts this;
    public abstract get validatedContext(): unknown;
}

export interface GuardStatic<TGuard extends Guard = Guard> {
    new(...context: any): TGuard;
}

export type GuardFunction<
    TSchemas extends GenericSchema[] = GenericSchema[],
> = (request: {
    context: BaseContext,
    params: UnwrapSchemaOutput<TSchemas>
}) => asserts request;