import {
    defineMethods,
    definePublications,
    exposeMethods,
    exposePublications, Guard,
    UserLoggedInGuard,
} from '@meteor-type-validation/server';
import { Meteor } from 'meteor/meteor';
import * as v from 'valibot';

class CreatedByCurrentUser extends Guard {
    public readonly writeToParams = false;
    public readonly writeToContext = false;
    
    public readonly contextSchema = UserLoggedInGuard.contextSchema;
    
    public readonly paramSchema = [
        v.object({
            createdBy: v.string(),
        }),
    ]
    
    public validate() {
        this.assertContext();
        if (this.params[0].createdBy !== this.context.userId) {
            throw new Meteor.Error(401, 'You do not have permission for this resource');
        }
    }
}

export const AllMethods = defineMethods({
    'user:todo.add': {
        schema: [v.object({ title: v.string() })],
        guards: [UserLoggedInGuard],
        method(entry) {
            entry.title = ''
            this.userId = '';
            
            // @ts-expect-error
            entry.title = null;
            // @ts-expect-error
            this.userId = null;
            // @ts-expect-error
            entry._id
        }
    },
    'admin:todo.remove': {
        schema: [v.object({ _id: v.string() })],
        // todo: Ensure a type error is thrown here as the provided schema does not have the required guard params
        guards: [CreatedByCurrentUser],
        method(entry) {
            entry._id
            
            // @ts-expect-error publication-only method
            this.added('some-collection', 'some-id', { foo: 'bar' });
            
            // @ts-expect-error
            this.userId = null;
            // @ts-expect-error
            entry.title
        }
    }
});

export const AllPublications = definePublications({
    'admin:todos': {
        schema: [v.object({ createdBy: v.string() })],
        guards: [CreatedByCurrentUser],
        publish(entry) {
            entry.createdBy
            this.userId = '';
            
            this.added('some-collection', 'some-id', { foo: 'bar' });
            
            // @ts-expect-error
            this.userId = null;
            // @ts-expect-error
            entry._id
        }
    }
});

const Methods = exposeMethods(AllMethods);
const Publications = exposePublications(AllPublications);
type Publications = typeof Publications;
type Methods = typeof Methods;

declare module 'meteor/meteor' {
    interface DefinedPublications extends Publications {}
    interface DefinedMethods extends Methods {}
}


