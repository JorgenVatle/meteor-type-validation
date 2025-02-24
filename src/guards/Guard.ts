import type { GenericSchema } from 'valibot';
import * as v from 'valibot';
import type { BaseContext, UnwrapSchemaOutput } from '../types/ValidatedResources';

export abstract class Guard {
    constructor(
        public readonly context: BaseContext,
        protected readonly params: unknown[]
    ) {}
    
    /**
     * Used to perform validation on the current method or publication's `this` context.
     * Handy for checking that a user is logged in by checking for the presence of `this.userId`.
     */
    public readonly contextSchema?: v.ObjectSchema<any, any> | v.ObjectSchemaAsync<any, any>;
    
    /**
     * Whether validated context should be written to the handle's `this` type.
     * Useful if you're transforming the context to add user information for example.
     */
    public readonly writeToContext = true;
    
    /**
     * Optionally define to perform custom validation after the context has been validated.
     */
    public validate(): void | Promise<void> {};
    
    public async _validate() {
        if (this.contextSchema) {
            const context = await v.parseAsync(this.contextSchema, this.context);
            if (this.writeToContext) {
                Object.assign(this.context, context);
            }
        }
        await this.validate();
    }
    
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