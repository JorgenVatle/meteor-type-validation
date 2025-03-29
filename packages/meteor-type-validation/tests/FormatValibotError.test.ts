import { formatValibotError } from '@meteor-type-validation/utils';
import * as v from 'valibot';
import { describe, expect, it } from 'vitest';

describe('formatted Valibot errors', () => {
    const schema = v.object({
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
    });
    const error = getValidationError(schema, { title: 123 });
    const formattedError = formatValibotError(error);
    
    it('should be an instance of Error', () => {
        expect(formattedError).toBeInstanceOf(Error);
    });
    
    it('should have a "details" property', () => {
        expect(formattedError.details).toBeDefined();
    });
    
    it('should should have a main error message', () => {
        expect(formattedError.message).toContain('Invalid type');
    });
    
    it('should have a "details.errors" property', () => {
        expect(formattedError.details.errors).toBeDefined();
        expect(formattedError.details.errors.length).toBeGreaterThan(0);
    });
    
    it('should have a "details.issues" property', () => {
        expect(formattedError.details.issues).toBeDefined();
        expect(formattedError.details.issues.length).toBeGreaterThan(0);
    });
    
    describe('required object keys', () => {
        
        it('should humanize default error messages', () => {
            const { errors } = prepareError(
                v.object({
                    title: v.string()
                }),
                {}
            );
            expect(errors[0].message).toEqual('Title is required');
        })
    })
    
});

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

function prepareError<TSchema extends v.GenericSchema>(schema: TSchema, input: any) {
    const rawError = getValidationError(schema, input);
    const valiError = formatValibotError(rawError);
    const { issues, errors } = valiError.details;
    
    return {
        issues,
        errors,
        valiError,
    }
}
