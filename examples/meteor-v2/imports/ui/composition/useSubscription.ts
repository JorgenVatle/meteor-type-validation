import type { DefinedPublications } from 'meteor/meteor';
import { Meteor } from 'meteor/meteor';
import { Tracker } from 'meteor/tracker';
import { onUnmounted, reactive } from 'vue';

export function useSubscription<
    TName extends keyof DefinedPublications,
>(name: TName, ...params: Parameters<DefinedPublications[TName]>) {
    const subscription = reactive({
        ready: false,
    });
    
    const computation = Tracker.autorun(() => {
        const handle = Meteor.subscribe(name, ...params);
        subscription.ready = handle.ready();
    });
    
    onUnmounted(() => computation.stop());
    
    return subscription;
}