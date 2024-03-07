import { Meteor, DefinedMethods, DefinedPublications } from 'meteor/meteor';

/**
 * Overrides for Meteor's default types to enforce type safety.
 */
export const MeteorApi = {
    callAsync: Meteor.callAsync<keyof DefinedMethods>,
    call: Meteor.call<keyof DefinedMethods>,
    subscribe: Meteor.subscribe<keyof DefinedPublications>,
}
