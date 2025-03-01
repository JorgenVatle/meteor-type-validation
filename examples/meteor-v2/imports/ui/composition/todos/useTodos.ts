import { faker } from '@faker-js/faker';
import { MeteorApi } from 'meteor-type-validation';
import { computed, reactive } from 'vue';
import { TodosCollection } from '../../../api/todos/todos.collection';
import { useSubscription } from '../useSubscription';
import { useTracker } from '../useTracker';
import 'meteor/meteor';

export function useTodos() {
    const subscription = useSubscription('todos', {}, { limit: 50 })
    const todos = reactive({
        data: useTracker(() => TodosCollection.find({}).fetch()),
        ready: computed(() => subscription.ready),
        async create() {
            await MeteorApi.callAsync('todos.create', {
                completed: false,
                title: faker.lorem.sentence()
            });
        }
    });
    
    return todos;
}