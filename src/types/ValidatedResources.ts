import { GenericSchema, type InferOutput } from 'valibot';
import type { GuardFunction, GuardStatic } from '../Guard';

export interface MethodDefinition<
    TSchemas extends GenericSchema[] = GenericSchema[],
    TGuards extends GuardStatic[] = GuardStatic[],
    TExtendedContext = {}
> {
    schema: [...TSchemas],
    guards: TGuards,
    method(this: ValidatedThisType<TGuards> & TExtendedContext, ...params: UnwrapSchemas<TSchemas>): unknown
}
export interface PublicationDefinition<
    TSchemas extends GenericSchema[] = GenericSchema[],
    TGuards extends GuardStatic[] = GuardStatic[],
    TExtendedContext = {}
> {
    schema: [...TSchemas],
    guards: TGuards,
    publish(this: ValidatedThisType<TGuards> & TExtendedContext, ...params: UnwrapSchemas<TSchemas>): unknown
}

/**
 * This is left empty so you can augment it with any custom context types you want to be
 * injected into the `this` type of your method/publication handlers.
 * Useful for loggers, profiling or adding extra request metadata.
 */
export interface ExtendedContext {

}

export type BaseContext = Meteor.MethodThisType | Subscription;
export type WrappedContext = BaseContext & ExtendedContext & { startTime: number };


export type MethodDefinitionMap = {
    [key in string]: MethodDefinition
}

export type PublicationDefinitionMap = {
    [key in string]: PublicationDefinition
}

/**
 * Unwrap method definitions to get the method map as it would be
 * fed into Meteor.methods(...)
 */
export type UnwrapMethods<TMethods extends MethodDefinitionMap> = {
    [key in keyof TMethods]: TMethods[key]['method']
}

/**
 * Unwrap publications to get a record of publication handles as
 * they would be added to Meteor.publish(<name>, ...)
 */
export type UnwrapPublications<TPublications extends PublicationDefinitionMap> = {
    [key in keyof TPublications]: TPublications[key]['publish'];
}

/**
 * Convert schema definitions to plain parameter types
 */
export type UnwrapSchemas<TSchemas extends GenericSchema[]> = {
    [key in keyof TSchemas]: InferOutput<TSchemas[key]>
}

type ValidatedThisType<
    TGuards extends GuardStatic[] | GuardFunction[]
> = TGuards extends GuardStatic[]
    ? ValidatedStaticThisType<TGuards>
    : TGuards extends GuardFunction[]
      ? ValidatedFnThisType<TGuards>
      : never;
type ValidatedStaticThisType<TGuards extends GuardStatic[]> = InstanceType<TGuards[number]>['validatedContext'];
type ValidatedFnThisType<TGuards extends GuardFunction[]> = ReturnType<TGuards[number]>;
export type ResourceType = 'method' | 'publication';
export interface ContextWrapper {
    type: ResourceType,
    context: BaseContext,
    name: string;
}