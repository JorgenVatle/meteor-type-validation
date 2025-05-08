import * as v from 'valibot';
import { describe, expectTypeOf, it } from 'vitest';
import { Guard, type GuardStatic, UserLoggedInGuard } from './guards';
import type {
    InferResourceHandleFn,
    UnwrapGuardedSchemaOutput,
    UnwrapGuardStaticSchemas,
    ValibotSchema,
    ValibotSchemaList,
    ValidatedStaticThisType,
    ValidatedThisType,
} from './ResourceTypes';

describe('ValidatedStaticThisType', () => {
    function unwrapThis<TGuards extends GuardStatic[]>(guards: TGuards) {
        return null as ValidatedStaticThisType<TGuards>
    }
    const result = unwrapThis([
        UserLoggedInGuard,
        ExtraContextGuard,
    ]);
    
    it('can unwrap the this context for a single guard class', () => {
        const result = unwrapThis([
            UserLoggedInGuard,
        ]);
        
        expectTypeOf(result).toMatchTypeOf<{ userId: string | null }>();
    });
    
    it('does not result in "any"', () => {
        expectTypeOf(result).not.toMatchTypeOf<{ somethingElse: string }>();
    })
});

describe('ValidatedThisType', () => {
    function unwrapThis<TGuards extends GuardStatic[]>(guards: TGuards) {
        return {} as ValidatedThisType<TGuards>
    }
    
    describe('single guard', () => {
        const result = unwrapThis([
            UserLoggedInGuard,
        ]);
        
        it('can unwrap the this context as expected', () => {
            expectTypeOf(result).toMatchTypeOf<{ userId: string | null }>();
        });
    })
    
    describe('multiple guards', () => {
        const result = unwrapThis([
            UserLoggedInGuard,
            ExtraContextGuard,
        ]);
        
        it('merges context with the default guard context', () => {
            expectTypeOf(result).toMatchTypeOf<{ userId: string }>();
            expectTypeOf(result).toMatchTypeOf<{ extra: string }>();
            expectTypeOf(result.userId).toEqualTypeOf<string>();
        });
        
        it('does not result in "any"', () => {
            expectTypeOf(result).not.toMatchTypeOf<{ somethingElse: string }>();
        })
    })
    
    describe('undefined context', () => {
        const result = unwrapThis([
            UndefinedContextGuard,
        ]);
        
        it('does not modify the base context', () => {
            expectTypeOf(result).toMatchTypeOf<{ userId: string | null }>();
        });
        
        it('does not result in "any"', () => {
            expectTypeOf(result).not.toMatchTypeOf<{ somethingElse: string }>();
        })
    })
});

describe('InferResourceHandleFn', () => {
    function createResourceHandle<
        const TSchemas extends ValibotSchema[] = [],
        const TGuards extends GuardStatic[] = [],
        const TExtendedContext = {},
    >(handle: {
        schema?: TSchemas;
        guards?: TGuards;
        extendedContext?: TExtendedContext;
    }) {
        return {} as InferResourceHandleFn<TSchemas, TGuards, TExtendedContext, unknown>
    }
    
    describe('single guard input schema', () => {
        const result = createResourceHandle({
            guards: [SingleGuardInputSchema],
        });
        
        
        it('infers input types from the guard', () => {
            expectTypeOf(result).parameter(0).toEqualTypeOf({ userId: '1' });
        })
        
        it('only has a single parameter', () => {
            expectTypeOf(result).parameter(1).toBeUndefined();
        })
        
        it('does not allow unspecified fields', () => {
            expectTypeOf(result).parameters.not.toEqualTypeOf([{ extra: 1 }])
        })
    })
    
    describe('Multiple guard param schemas', () => {
        const result = createResourceHandle({
            guards: [MultiParamSchemaGuard],
        });
        
        
        it('infers input types from the first guard schema', () => {
            expectTypeOf(result).parameter(0).toMatchTypeOf({ userId: '1' });
        })
        
        it('infers input types from the second guard schema', () => {
            expectTypeOf(result).parameter(1).toMatchTypeOf({ fields: ['_id', 'userId', 'createdAt'] });
        })
        
        it('does not allow unspecified fields', () => {
            expectTypeOf(result).parameters.not.toEqualTypeOf([{ extra: 1 }])
        })
    })
})

describe('UnwrapGuardStaticSchemas', () => {
    function unwrapGuardSchemas<const TGuards extends GuardStatic[]>(guard: TGuards) {
        return {} as UnwrapGuardStaticSchemas<TGuards>
    }
    
    describe('single guard input schema', () => {
        const result = unwrapGuardSchemas([
            SingleGuardInputSchema,
        ]);
        
        it('unwraps the first guard param schema', () => {
            expectTypeOf(result).toEqualTypeOf<readonly [{ userId: string }]>();
        })
    })
    
    describe('multiple guard input schemas', () => {
        const result = unwrapGuardSchemas([
            MultiParamSchemaGuard,
        ]);
        
        
        it('has two fields', () => {
            expectTypeOf(result[0]).toBeObject();
            expectTypeOf(result[1]).toBeObject();
        })
        
        it('unwraps the first guard param schema', () => {
            expectTypeOf(result[0]).toEqualTypeOf<{ userId: string }>();
        })
        
        it('unwraps the second guard param schema', () => {
            expectTypeOf(result[1]).toEqualTypeOf<{ fields: Array<'_id' | 'userId' | 'createdAt'> }>();
        });
        
        it('does not allow unspecified fields', () => {
            expectTypeOf(result[1]).not.toEqualTypeOf({ extra: 1 });
            expectTypeOf(result[1]).not.toEqualTypeOf<{ fields: Array<'_id' | 'userId' | 'createdAt' | 'extra'> }>();
            
        })
    })
})

describe('UnwrapGuardedSchemaOutput', () => {
    function unwrapGuardedSchema<
        const TGuards extends GuardStatic[],
        const TSchemas extends ValibotSchemaList = [v.GenericSchema<{}>],
    >(resource: { guards: TGuards; schema: TSchemas }) {
        return {} as UnwrapGuardedSchemaOutput<TSchemas, TGuards>
    }
    
    describe('single guard input schema', () => {
        const result = unwrapGuardedSchema({
            schema: [],
            guards: [SingleGuardInputSchema],
        });
        
        it('unwraps the first guard param schema', () => {
            expectTypeOf(result).toEqualTypeOf<[{ userId: string }]>();
        })
    })
    
    describe('multiple guard input schemas', () => {
        const result = unwrapGuardedSchema({
            schema: [],
            guards: [MultiParamSchemaGuard],
        });
        
        
        it('has two fields', () => {
            expectTypeOf(result[0]).toBeObject();
            expectTypeOf(result[1]).toBeObject();
        })
        
        it('unwraps the first guard param schema', () => {
            expectTypeOf(result[0]).toEqualTypeOf<{ userId: string }>();
        })
        
        it('unwraps the second guard param schema', () => {
            expectTypeOf(result[1]).toEqualTypeOf<{ fields: Array<'_id' | 'userId' | 'createdAt'> }>();
        });
        
        it('does not allow unspecified fields', () => {
            expectTypeOf(result[1]).not.toEqualTypeOf({ extra: 1 });
            expectTypeOf(result[1]).not.toEqualTypeOf<{ fields: Array<'_id' | 'userId' | 'createdAt' | 'extra'> }>();
            
        })
    })
})

class ExtraContextGuard extends Guard {
    public readonly paramSchema = [];
    public readonly writeToParams = false;
    public readonly writeToContext = false;
    public readonly contextSchema = v.object({
        extra: v.string(),
    });
}

class UndefinedContextGuard extends Guard {
    public readonly paramSchema = [];
    public readonly writeToParams = false;
    public readonly writeToContext = false;
    public readonly contextSchema = undefined;
}

class SingleGuardInputSchema extends Guard {
    public readonly writeToParams = false;
    public readonly writeToContext = false;
    public readonly contextSchema = undefined;
    public readonly paramSchema = [
        v.object({
            userId: v.string(),
        })
    ] as const;
}

class MultiParamSchemaGuard extends Guard {
    public readonly writeToParams = false;
    public readonly writeToContext = false;
    public readonly contextSchema = undefined;
    public readonly paramSchema = [
        v.object({
            userId: v.string(),
        }),
        v.object({
            fields: v.array(
                v.picklist([
                    '_id',
                    'userId',
                    'createdAt',
                ])
            ),
        })
    ] as const;
}