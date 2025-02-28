import { exposeMethods, exposePublications } from 'meteor-type-validation';
import OrderMethods from './order.methods';
import OrderPublications from './order.publications';
import UserMethods from './user.methods';

export const Methods = exposeMethods({
    ...OrderMethods,
    ...UserMethods,
})

export const Publications = exposePublications({
    ...OrderPublications,
});

export type Publications = typeof Publications;
export type Methods = typeof Methods;