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

export const QueryTodoSchema = v.object({
    _id: v.optional(v.string()),
    title: v.optional(v.string()),
    completed: v.optional(v.boolean()),
    createdAt: v.optional(v.object({
        $gt: v.optional(v.date()),
        $lt: v.optional(v.date()),
    })),
})