import { Tracker } from 'meteor/tracker';
import { reactive } from 'vue';

export function useTracker<TReturnType>(compute: () => TReturnType) {
    const tracker = reactive({
        data: compute(),
    });
    
    const computation = Tracker.autorun(() => {
        // @ts-ignore
        tracker.data = compute()
    });
    
    return tracker;
}