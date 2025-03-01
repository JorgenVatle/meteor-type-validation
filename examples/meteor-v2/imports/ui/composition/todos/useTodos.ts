import { faker } from '@faker-js/faker';
import { MeteorApi } from 'meteor-type-validation/client';
import { computed, reactive } from 'vue';
import { TodosCollection } from '../../../api/todos/todos.collection';
import type { TodoDocument } from '../../../api/todos/todos.schema';
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
                title: todos.form.title || todos.form.placeholder
            });
            todos.form.reset();
        },
        async complete(todo: TodoDocument) {
            await MeteorApi.callAsync('todos.edit', { _id: todo._id }, { completed: true });
        },
        form: {
            title: '',
            placeholder: faker.lorem.sentence(),
            reset() {
                this.title = '';
                this.placeholder = faker.lorem.sentence();
            }
        },
    });
    
    return todos;
}