import * as v from 'valibot';

export const CreateTodoSchema = v.object({
    title: v.string(),
    completed: v.boolean(),
});