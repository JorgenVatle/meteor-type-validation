import { UnwrapMethods, UnwrapPublications } from 'meteor-type-validation';
import type { Methods, Publications } from './api';

export interface DefinedPublications extends UnwrapPublications<typeof Publications> {}
export interface DefinedMethods extends UnwrapMethods<typeof Methods> {}