import OrderMethods from './order.methods';
import OrderPublications from './order.publications';
import UserMethods from './user.methods';

export const Methods = {
    ...OrderMethods,
    ...UserMethods,
}

export const Publications = {
    ...OrderPublications,
}