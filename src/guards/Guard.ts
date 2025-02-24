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
    public readonly contextSchema!: v.ObjectSchema<any, any> | v.ObjectSchemaAsync<any, any>;
    
    /**
     * Used to perform and potentially transform input parameters for guarded methods/publications.
     */
    public readonly inputSchema!: v.BaseSchema<any, any, any>[];
    
    /**
     * Whether validated context should be written to the handle's `this` type.
     * Useful if you're transforming the context to add user information for example.
     */
    public abstract readonly writeToContext: boolean;
    
    /**
     * Whether to write validated input to input parameters before passing it onto the method or publication.
     * Keep in mind that method and publication handles' original validation schema is called before the guard's
     */
    public readonly writeToParams: boolean = false;
    
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
        if (this.inputSchema) {
            for (const index in this.inputSchema) {
                const validated = await v.parseAsync(this.inputSchema[index], this.params[index]);
                if (this.writeToParams) {
                    this.params[index] = validated;
                }
            }
        }
        await this.validate();
    }
    
    /**
     * Used for enabling better type hints within the context of this class,
     * primarily for the validate() method.
     */
    protected assertContext<
        TSelf extends Guard,
    >(this: TSelf): asserts this is { context: v.InferOutput<TSelf['contextSchema']>, params: UnwrapSchemaOutput<TSelf['inputSchema']> } {
        // The context should be validated before this method is reachable, so no need to validate twice.
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