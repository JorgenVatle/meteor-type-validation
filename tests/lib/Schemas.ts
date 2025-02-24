import * as v from 'valibot';

export const TodoDocumentSchema = v.object({
    title: v.string(),
    completed: v.boolean(),
});