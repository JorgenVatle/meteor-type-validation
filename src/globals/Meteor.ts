// Doing a little bit of a hack here so we won't have to depend on an Atmosphere package
import type { Meteor as _Meteor } from 'meteor/meteor';
export type { Subscription, DefinedMethods, DefinedPublications } from 'meteor/meteor';
declare const Meteor: unknown;
const MeteorGlobal = Meteor as typeof _Meteor;
export { MeteorGlobal as Meteor };
