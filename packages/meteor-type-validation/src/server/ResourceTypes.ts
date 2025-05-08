import type { DDPRateLimiter } from 'meteor/ddp-rate-limiter';
import type { Meteor, Subscription } from 'meteor/meteor';
import type { MergeDeep, UnionToIntersection } from 'type-fest';
import {
    type BaseIssue,
    type BaseSchema,
    type BaseSchemaAsync,
    GenericSchema,
    type InferInput,
    type InferOutput,
} from 'valibot';
import { Guard, type GuardFunction, type GuardStatic } from './guards';
import type { ValidatedStaticThisType } from './InternalResourceTypes';

export interface MethodDefinition<
    TSchemas extends ValibotSchema[] = ValibotSchema[],
    TGuards extends GuardStatic[] = GuardStatic[],
    TExtendedContext extends ExtendedContext = ExtendedContext,
    TReturnType = unknown
> {
    schema: [...TSchemas],
    guards: [...TGuards],
    rateLimiters?: RateLimiterRule[],
    method: InferResourceHandleFn<TSchemas, TGuards, Meteor.MethodThisType & TExtendedContext, TReturnType>
}
export interface PublicationDefinition<
    TSchemas extends ValibotSchema[] = ValibotSchema[],
    TGuards extends GuardStatic[] = GuardStatic[],
    TExtendedContext extends ExtendedContext = ExtendedContext,
    TReturnType = unknown,
> {
    schema: [...TSchemas],
    guards: [...TGuards],
    rateLimiters?: RateLimiterRule[],
    publish: InferResourceHandleFn<TSchemas, TGuards, Subscription & TExtendedContext, TReturnType>
}

export interface MethodDefinitionResult<TSchemas extends ValibotSchema[], TResult> {
    guards: any,
    schema: any,
    method: (...params: UnwrapSchemaInput<TSchemas>) => NoInfer<TResult>;
}

export interface PublicationDefinitionResult<TSchemas extends ValibotSchema[], TResult> {
    guards: any,
    schema: any,
    publish: (...params: UnwrapSchemaInput<TSchemas>) => NoInfer<TResult>;
}

/**
 * This is left empty so you can augment it with any custom context types you want to be
 * injected into the `this` type of your method/publication handlers.
 * Useful for loggers, profiling or adding extra request metadata.
 */
export interface ExtendedContext {

}

export type _ResourceThisType = (Meteor.MethodThisType | Subscription);
export type BaseContext<TSelf extends _ResourceThisType = _ResourceThisType> = TSelf & ExtendedContext;
export type WrappedContext<TBaseContext extends BaseContext = BaseContext> = TBaseContext & { startTime: number };


export type MethodDefinitionMap = {
    [key in string]: Omit<MethodDefinition, 'method'> & { method: (...params: any) => any }
}

export type PublicationDefinitionMap = {
    [key in string]: Omit<PublicationDefinition, 'publish'> & { publish: (...params: any) => any }
}

export type ResourceDefinition = MethodDefinition | PublicationDefinition;

export type RateLimiterRule = Pick<DDPRateLimiter.Matcher, 'userId' | 'connectionId' | 'clientAddress'> & {
    requestCount?: number;
    intervalMs?: number;
};

/**
 * Unwrap method definitions to get the method map as it would be
 * fed into Meteor.methods(...)
 */
export type UnwrapMethods<TMethods extends MethodDefinitionMap> = {
    [key in keyof TMethods]: TMethods[key]['method'];
}

/**
 * Unwrap publications to get a record of publication handles as
 * they would be added to Meteor.publish(<name>, ...)
 */
export type UnwrapPublications<TPublications extends PublicationDefinitionMap> = {
    [key in keyof TPublications]: TPublications[key]['publish'];
}

/**
 * Infer method/publication argument types from the provided schema.
 * This is the argument's type as it is received inside the method handle.
 * The input type (the type the caller should adhere to) is inferred from {@link UnwrapSchemaInput}
 */
export type UnwrapSchemaOutput<TSchemas extends ValibotSchema[]> = {
    [key in keyof TSchemas]: InferOutput<TSchemas[key]>
}

/**
 * Argument types for the provided schemas as it should be passed by the caller of the method/publication.
 */
export type UnwrapSchemaInput<TSchemas extends ValibotSchema[]> = {
    [key in keyof TSchemas]: InferInput<TSchemas[key]>
}

/**
 * Infer method/publication argument output types after applying input validation schemas from guard classes.
 */
type UnwrapGuardedSchemaOutput<
    TSchemas extends ValibotSchema[],
    TGuards extends GuardStatic[],
    TSchemaOutput extends UnwrapSchemaOutput<TSchemas> = UnwrapSchemaOutput<TSchemas>,
    TGuardOutput extends UnwrapGuardStaticSchemas<TGuards> = UnwrapGuardStaticSchemas<TGuards>
> = any[] extends TGuardOutput
    ? MergeDeep<
        TSchemaOutput,
        TGuardOutput,
        { arrayMergeMode: 'spread', recurseIntoArrays: true }
    >
    : TSchemaOutput

/**
 * Infer schema output from a list of static guard classes
 */
type UnwrapGuardStaticSchemas<
    TGuards extends GuardStatic[],
> = UnionToIntersection<FilterUndefinedGuards<TGuards>[number]>

/**
 * Filter out guard classes that have no params schemas defined.
 */
type FilterUndefinedGuards<TGuards extends GuardStatic[]> = {
    [key in keyof TGuards]: [GenericSchema<{ __noSchemaSet: true }>] extends InstanceType<TGuards[key]>['paramSchema']
                            ? never
                            : UnwrapSchemaOutput<InstanceType<TGuards[key]>['paramSchema']>
};

/**
 * Infer the this-type of a publication/method handle after applying guard validators.
 */
type ValidatedThisType<
    TGuards extends GuardStatic[] | GuardFunction[] | [],
    TThisType extends _ResourceThisType = _ResourceThisType,
> = TGuards extends GuardStatic[]
    ? ValidatedStaticThisType<TGuards> & BaseContext<TThisType>
    : TGuards extends GuardFunction[]
      ? ValidatedFnThisType<TGuards> & BaseContext<TThisType>
      : never;

/**
 * Infers the this-type of a static Guard class.
 */
export type ValidatedStaticThisType<
    TGuards extends GuardStatic[]
> = {
    [key in keyof TGuards]: InstanceType<TGuards[key]> extends Guard<infer TSchema extends ValibotSchema, any>
                            ? InferOutput<TSchema>
                            : never
}[number];

/**
 * Infers the this-type of a Guard function/hook. (Non-class guard)
 */
type ValidatedFnThisType<TGuards extends GuardFunction[]> = ReturnType<TGuards[number]>;

/**
 * Infer a publication or method definition's handle function.
 * Essentially the context that peer projects will have when defining methods and publications.
 */
export type InferResourceHandleFn<
    TSchemas extends ValibotSchema[],
    TGuards extends GuardStatic[],
    TExtendedContext,
    TReturnType,
    TUnguardedOutput extends UnwrapSchemaOutput<TSchemas> = UnwrapSchemaOutput<TSchemas>,
> = TGuards extends []
    ? (this: TExtendedContext, ...params: TUnguardedOutput) => TReturnType
    : (
        this: TExtendedContext & ValidatedThisType<TGuards>,
        ...params: TGuards extends []
                   ? TUnguardedOutput
                   : UnwrapGuardedSchemaOutput<TSchemas, TGuards>
        ) => TReturnType

export type ResourceType = 'method' | 'publication';

export interface ContextWrapper<
    TContext extends BaseContext = BaseContext,
    TType extends ResourceType = TContext extends Meteor.MethodThisType
                                 ? 'method'
                                 : TContext extends Subscription
                                   ? 'publication'
                                   : never,
> {
    type: TType,
    context: TContext,
    name: string;
}

export type NonAsyncValibotSchema = BaseSchema<unknown, unknown, BaseIssue<unknown>>;
export type AsyncValibotSchema = BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>;
export type ValibotSchema = NonAsyncValibotSchema | AsyncValibotSchema;