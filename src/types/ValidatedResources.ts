import { GenericSchema, type InferInput, type InferOutput } from 'valibot';
import type { GuardFunction, GuardStatic } from '../Guard';
import type { Meteor, Subscription } from 'meteor/meteor';

export interface MethodDefinition<
    TSchemas extends GenericSchema[] = GenericSchema[],
    TGuards extends GuardStatic[] = GuardStatic[],
    TExtendedContext extends ExtendedContext = ExtendedContext,
    TReturnType = unknown
> {
    schema: [...TSchemas],
    guards: TGuards,
    rateLimiters?: RateLimiterRule[],
    method(this: ValidatedThisType<TGuards, Meteor.MethodThisType> & TExtendedContext, ...params: UnwrapSchemaOutput<TSchemas>): TReturnType
}
export interface PublicationDefinition<
    TSchemas extends GenericSchema[] = GenericSchema[],
    TGuards extends GuardStatic[] = GuardStatic[],
    TExtendedContext extends ExtendedContext = ExtendedContext,
    TReturnType = unknown,
> {
    schema: [...TSchemas],
    guards: TGuards,
    rateLimiters?: RateLimiterRule[],
    publish(this: ValidatedThisType<TGuards, Subscription> & TExtendedContext, ...params: UnwrapSchemaOutput<TSchemas>): TReturnType
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
    [key in string]: MethodDefinition
}

export type PublicationDefinitionMap = {
    [key in string]: PublicationDefinition
}

export type RateLimiterRule = Pick<DDPRateLimiter.Matcher, 'userId' | 'connectionId' | 'clientAddress'> & {
    requestCount?: number;
    intervalMs?: number;
};

/**
 * Unwrap method definitions to get the method map as it would be
 * fed into Meteor.methods(...)
 */
export type UnwrapMethods<TMethods extends MethodDefinitionMap> = {
    [key in keyof TMethods]: (...params: UnwrapSchemaInput<TMethods[key]['schema']>) => ReturnType<TMethods[key]['method']>;
}

/**
 * Unwrap publications to get a record of publication handles as
 * they would be added to Meteor.publish(<name>, ...)
 */
export type UnwrapPublications<TPublications extends PublicationDefinitionMap> = {
    [key in keyof TPublications]: (...params: UnwrapSchemaInput<TPublications[key]['schema']>) => ReturnType<TPublications[key]['publish']>;
}

/**
 * Infer method/publication argument types from the provided schema.
 * This is the argument's type as it is received inside the method handle.
 * The input type (the type the caller should adhere to) is inferred from {@link UnwrapSchemaInput}
 */
export type UnwrapSchemaOutput<TSchemas extends GenericSchema[]> = {
    [key in keyof TSchemas]: InferOutput<TSchemas[key]>
}

/**
 * Argument types for the provided schemas as it should be passed by the caller of the method/publication.
 */
export type UnwrapSchemaInput<TSchemas extends GenericSchema[]> = {
    [key in keyof TSchemas]: InferInput<TSchemas[key]>
}

type ValidatedThisType<
    TGuards extends GuardStatic[] | GuardFunction[],
    TThisType extends _ResourceThisType = _ResourceThisType,
> = TGuards extends GuardStatic[]
    ? ValidatedStaticThisType<TGuards> & BaseContext<TThisType>
    : TGuards extends GuardFunction[]
      ? ValidatedFnThisType<TGuards> & BaseContext<TThisType>
      : never;
type ValidatedStaticThisType<TGuards extends GuardStatic[]> = InstanceType<TGuards[number]>['validatedContext'];
type ValidatedFnThisType<TGuards extends GuardFunction[]> = ReturnType<TGuards[number]>;
export type ResourceType = 'method' | 'publication';

export interface ContextWrapper<
    TContext extends BaseContext = BaseContext,
    TType extends ResourceType = TContext extends Meteor.MethodThisType
                                 ? 'method' : TContext extends Subscription
                                              ? 'publication'
                                              : never,
> {
    type: TType,
    context: TContext,
    name: string;
}