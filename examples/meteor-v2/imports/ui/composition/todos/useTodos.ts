import { computed, reactive } from 'vue';
import { TodosCollection } from '../../../api/todos/todos.collection';
import { useSubscription } from '../useSubscription';
import { useTracker } from '../useTracker';

export function useTodos() {
    const subscription = useSubscription('todos', {}, { limit: 50 })
    const todos = reactive({
        data: useTracker(() => TodosCollection.find({}).fetch()),
        ready: computed(() => subscription.ready),
    });
    
    return todos;
}