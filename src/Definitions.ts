import MeteorAPI from './MeteorAPI';

/**
 * Base API instance - has default contexts and nothing fancy.
 * This class can be extended to add additional context into
 * methods and publications' `this` type.
 */
const defaultApi = new MeteorAPI();

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
export const DefineMethods = defaultApi.defineMethods;

/**
 * Defines a type safe publication input and context validation.
 * The result of this method should be exported so that we can infer all its types globally.
 */
export const DefinePublications = defaultApi.definePublications;

export const ExposeMethods = defaultApi.exposeMethods;
export const ExposePublications = defaultApi.exposePublications;