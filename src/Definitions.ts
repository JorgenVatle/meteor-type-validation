import { MeteorTypeValidation } from './MeteorTypeValidation';

/**
 * Base API instance - has default contexts and nothing fancy.
 * This class can be extended to add additional context into
 * methods and publications' `this` type.
 */
const defaultApi = new MeteorTypeValidation();

/**
 * Defines a type safe method with input and context validation.
 * The result of this function should be exported so that we can infer all its types globally.
 *
 * @example /imports/api/topics/methods.ts
 * export default defineMethods({
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
 *     exposeMethods(AllMethods)
 * })
 *
 * declare module 'meteor/meteor' {
 *     interface DefinedMethods extends UnwrapMethods<typeof AllMethods> {}
 * }
 */
export const defineMethods = defaultApi.defineMethods.bind(defaultApi);

/**
 * Defines a type safe publication input and context validation.
 * The result of this method should be exported so that we can infer all its types globally.
 */
export const definePublications = defaultApi.definePublications.bind(defaultApi);

export const exposeMethods = defaultApi.exposeMethods.bind(defaultApi);
export const exposePublications = defaultApi.exposePublications.bind(defaultApi);