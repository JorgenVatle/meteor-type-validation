import * as v from 'valibot';

export const CreateTodoSchema = v.pipe(
    v.object({
        title: v.string(),
        completed: v.boolean(),
    }),
    v.transform((input) => {
        return {
            ...input,
            createdAt: new Date(),
        };
    },
));

export const EditTodoSchema = v.object({
    _id: v.string(),
    ...CreateTodoSchema.entries,
});

export const QueryTodoSchema = v.partial(v.object({
    _id: v.string(),
    title: v.string(),
    completed: v.boolean(),
    createdAt: v.object({
        $gt: v.date(),
        $lt: v.date(),
    }),
}))