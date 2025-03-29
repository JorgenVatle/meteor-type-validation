import { formatValibotError } from '@meteor-type-validation/utils';
import * as v from 'valibot';
import { describe, expect, it } from 'vitest';

describe('formatted Valibot errors', () => {
    const error = getValidationError(
        v.object({
            title: v.string(),
            completed: v.boolean(),
            createdAt: v.date(),
            order: v.object({
                id: v.string(),
                items: v.array(v.object({
                    productId: v.string(),
                    quantity: v.number(),
                })),
            }),
        }),
        { title: 123 }
    );
   const formattedError = formatValibotError(error);
    
    it('should be an instance of Error', () => {
        expect(formattedError.error).toBeInstanceOf(Error);
    });
    
    it('should have a "details" property', () => {
        expect(formattedError.details).toBeDefined();
    });
    
    it('should should have a main error message', () => {
       expect(formattedError.message).toBe('Expected title to be string');
    });
    
})

function getValidationError<TSchema extends v.GenericSchema>(schema: TSchema, input: any): v.ValiError<TSchema> {
    try {
        v.parse(schema, input);
        throw new Error('No validation error thrown for request!');
    } catch (error) {
        if (!(error instanceof v.ValiError)) {
            throw error;
        }
        return error;
    }
}
