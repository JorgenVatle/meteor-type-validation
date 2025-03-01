import { faker } from '@faker-js/faker';
import { Accounts } from 'meteor/accounts-base';
import { Meteor } from 'meteor/meteor';
import { reactive } from 'vue';
import { useTracker } from '../useTracker';

export function useCurrentUser() {
    const user = reactive({
        data: useTracker(() => Meteor.user()),
        loggedIn: useTracker((): boolean => !!user.data),
        loading: useTracker(() => {
            if (Meteor.loggingIn()) {
                return true;
            }
            if (Meteor.loggingOut()) {
                return true;
            }
            return false;
        }),
        async login() {
            const email = faker.internet.email();
            const password = faker.internet.password();
            await Accounts.createUserAsync({ email, password });
        }
    });
    
    return user;
}