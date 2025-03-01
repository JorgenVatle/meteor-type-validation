import { Tracker } from 'meteor/tracker';
import { onUnmounted, ref } from 'vue';

export function useTracker<TReturnType>(compute: () => TReturnType) {
    const result = ref(compute());
    
    const computation = Tracker.autorun(() => {
        // @ts-ignore
        result.value = compute()
    });
    
    onUnmounted(() => computation.stop());
    
    return result;
}