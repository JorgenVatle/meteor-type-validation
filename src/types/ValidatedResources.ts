import { BaseSchema, Input } from "valibot";
import type { GuardStatic } from '../Guard';
import type { Logger } from '../Logger';

export interface MethodDefinition<
    TSchemas extends BaseSchema[] = BaseSchema[],
    TGuards extends GuardStatic[] = GuardStatic[],
    TExtendedContext = {}
> {
    schema: [...TSchemas],
    guards: TGuards,
    method(this: ValidatedThisType<TGuards> & TExtendedContext, ...params: UnwrapSchemas<TSchemas>): unknown
}
export interface PublicationDefinition<
    TSchemas extends BaseSchema[] = BaseSchema[],
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
export type WrappedMeteorMethods<TMethods extends MethodDefinitionMap> = {
    [key in keyof TMethods]: TMethods[key]['method']
}

export type WrappedMeteorPublications<TPublications extends PublicationDefinitionMap> = {
    [key in keyof TPublications]: TPublications[key]['publish'];
}

type UnwrapSchemas<TSchemas extends BaseSchema[]> = {
    [key in keyof TSchemas]: Input<TSchemas[key]>
}

type ValidatedThisType<TGuards extends GuardStatic[]> = InstanceType<TGuards[number]>['validatedContext'];
export type ResourceType = 'method' | 'publication';
export interface ContextWrapper {
    type: ResourceType,
    context: BaseContext,
    name: string;
}