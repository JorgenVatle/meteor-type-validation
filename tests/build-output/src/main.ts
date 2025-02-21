import { UnwrapMethods, UnwrapPublications } from 'meteor-type-validation';
import type { Methods, Publications } from './api';

declare module 'meteor/meteor' {
    interface DefinedPublications extends UnwrapPublications<typeof Publications> {}
    interface DefinedMethods extends UnwrapMethods<typeof Methods> {}
}
