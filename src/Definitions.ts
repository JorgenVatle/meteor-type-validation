import { BaseSchema } from "valibot";
import type { GuardStatic } from './Guard';
import type { MethodDefinition, PublicationDefinition } from './Types';

/**
 * Defines a type safe method with input and context validation.
 * The result of this function should be exported so that we can infer all its types globally.
 *
 * @example /imports/api/topics/methods.ts
 * export default DefineMethods({
 *     'topic.create': {
 *         schema: [TopicSchemas.create],
 *         guards: [...],
 *         method(topic) {
 *             ...
 *         }
 *     }
 * })
 *
 * @example ./server/methods.ts
 * import TopicMethods from '/imports/api/topics/methods'
 *
 * const AllMethods = {
 *     ...TopicMethods,
 *     // ... all other methods
 * }
 *
 * Meteor.startup(() => {
 *     ExposeMethods(AllMethods)
 * })
 *
 * declare module 'meteor/meteor' {
 *     interface DefinedMethods extends WrappedMeteorMethods<typeof AllMethods> {}
 * }
 */
export function DefineMethods<
    TSchemas extends Record<keyof TGuards, BaseSchema[]>,
    TGuards extends Record<keyof TSchemas, GuardStatic[]>
>(methods: {
    [key in keyof TSchemas | keyof TGuards]: MethodDefinition<TSchemas[key], TGuards[key]>
}) {
    return methods;
}

/**
 * Defines a type safe publication input and context validation.
 * The result of this method should be exported so that we can infer all its types globally.
 */
export function DefinePublications<
    TSchemas extends Record<keyof TGuards, BaseSchema[]>,
    TGuards extends Record<keyof TSchemas, GuardStatic[]>
>(publications: {
    [key in keyof TSchemas | keyof TGuards]: PublicationDefinition<TSchemas[key], TGuards[key]>
}) {
    return publications;
}
