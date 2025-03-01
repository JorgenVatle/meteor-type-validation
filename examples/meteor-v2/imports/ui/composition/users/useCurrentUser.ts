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
    });
    
    return user;
}