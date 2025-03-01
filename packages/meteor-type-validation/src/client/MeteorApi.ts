import { DefinedMethods, DefinedPublications, Meteor } from 'meteor/meteor';

function callAsync<
    TName extends keyof DefinedMethods
>(
    name: TName,
    ...params: Parameters<DefinedMethods[TName]>
): Promise<Awaited<ReturnType<DefinedMethods[TName]>>> {
    return Meteor.callAsync(name, ...params);
}

/**
 * Overrides for Meteor's default types to enforce type safety.
 */
export const MeteorApi = {
    callAsync,
    call: Meteor.call<keyof DefinedMethods>,
    subscribe: Meteor.subscribe<keyof DefinedPublications>,
}
