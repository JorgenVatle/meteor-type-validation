import type { BaseContext, UnwrapSchemaOutput } from 'src/types';
import type { GenericSchema } from 'valibot';
import * as v from 'valibot';

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
     * Define a paramSchema to extend input validation for a method or publication handle.
     *
     * @note These schemas are executed after the handle's base schemas and only serve as further validation
     * of user input. Essentially you cannot make input params more permissive, but you can make them more restrictive.
     *
     * Alternatively, you can use them to add additional fields to the user input. E.g. forcing input params to always
     * include the current user's ID.
     */
    public readonly paramSchema: DefaultGuardInputSchema = [];
    
    /**
     * Whether validated context should be written to the handle's `this` type.
     * Useful if you're transforming the context to add user information for example.
     */
    public abstract readonly writeToContext: boolean;
    
    /**
     * Whether to write validated input to input parameters before passing it onto the method or publication.
     * Keep in mind that method and publication handles' original validation schema is called before the guard's
     */
    public readonly writeToParams: 'replace' | 'patch' | false = false;
    
    /**
     * Optionally define to perform custom validation after the context has been validated.
     */
    public validate(): Promise<void> | void {};
    
    /**
     * Used for enabling better type hints within the context of this class,
     * primarily for the validate() method.
     */
    protected assertContext<
        TSelf extends Guard,
    >(this: TSelf): asserts this is { context: v.InferOutput<TSelf['contextSchema']>, params: UnwrapSchemaOutput<TSelf['paramSchema']> } {
        // The context should be validated before this method is reachable, so no need to validate twice.
    }
    
    /**
     * Internal validation method.
     * This is called after your method/publication's parameter schemas have been validated, but before the method or
     * publication is hit by the user. It's essentially middleware between the two.
     * @private
     */
    public async _validate() {
        if (this.contextSchema) {
            const validation = v.parseAsync(this.contextSchema, this.context);
            this.processContext(
                Promise.await ? Promise.await(validation) : await validation
            );
        }
        if (this.paramSchema) {
            for (const index in this.paramSchema) {
                const validation = v.parseAsync(this.paramSchema[index], this.params[index]);
                this.processParam(
                    Promise.await ? Promise.await(validation) : await validation,
                    // @ts-expect-error Index type infers to string
                    index
                );
            }
        }
        const validation = this.validate();
        Promise.await ? Promise.await(validation) : await validation;
    }
    
    private processContext(context?: any) {
        if (!this.writeToContext) {
            return;
        }
        Object.assign(this.context, context);
    }
    
    private processParam(validated: any, index: number) {
        const originalParam = this.params[index];
        if (!this.writeToParams) {
            return;
        }
        if (this.writeToParams === 'replace') {
            this.params[index] = validated;
            return;
        }
        if (originalParam && typeof originalParam === 'object') {
            Object.assign(originalParam, validated);
            return;
        }
        throw new Error('[Guard] Can only write params to input with an object type. If you wanted to rewrite params, make sure you set rewriteParams = true in your guard class.');
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

export type DefaultGuardInputSchema = v.GenericSchema[]