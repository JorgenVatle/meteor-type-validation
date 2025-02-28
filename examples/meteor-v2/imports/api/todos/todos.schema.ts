import * as v from 'valibot';

export const TodosSchema = v.object({
    _id: v.string(),
    completed: v.boolean(),
    title: v.string(),
});

export type TodosDocument = v.InferOutput<typeof TodosSchema>;