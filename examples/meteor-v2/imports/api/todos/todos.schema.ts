import * as v from 'valibot';

export const TodoDocument = v.object({
    _id: v.string(),
    completed: v.boolean(),
    title: v.string(),
    userId: v.string(),
    createdAt: v.date(),
    updatedAt: v.date(),
});

export const TodosSelector = v.partial(TodoDocument);

export const TodoCreateSchema = v.pipe(
    v.omit(TodoDocument, ['_id', 'userId', 'createdAt', 'updatedAt']),
    v.transform((input) => {
        return Object.assign(input, {
            createdAt: new Date(),
            updatedAt: new Date()
        });
    })
);

export const TodoEditSchema = v.pipe(
    v.omit(TodoDocument, ['_id', 'userId', 'createdAt', 'updatedAt']),
    v.transform((input) => {
        return Object.assign(input, {
            updatedAt: new Date()
        })
    })
);

export type TodoDocument = v.InferOutput<typeof TodoDocument>;