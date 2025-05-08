import * as v from 'valibot';
import { describe, expectTypeOf, it } from 'vitest';
import { Guard, type GuardStatic, UserLoggedInGuard } from './guards';
import type {
    InferResourceHandleFn,
    UnwrapGuardStaticSchemas,
    ValibotSchema,
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
        TSchemas extends ValibotSchema[] = [],
        TGuards extends GuardStatic[] = [],
        TExtendedContext = {},
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
            expectTypeOf(result).parameters.toEqualTypeOf([{ userId: '1' }])
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
    function unwrapGuardSchemas<TGuards extends GuardStatic[]>(guard: TGuards) {
        return {} as UnwrapGuardStaticSchemas<TGuards>
    }
    
    describe('single guard input schema', () => {
        const result = unwrapGuardSchemas([
            SingleGuardInputSchema,
        ]);
        
        it('unwraps the first guard param schema', () => {
            expectTypeOf(result).toEqualTypeOf([{ userId: 'foo' }]);
        })
    })
    
    describe('multiple guard input schemas', () => {
        const result = unwrapGuardSchemas([
            MultiParamSchemaGuard,
        ]);
        
        it('unwraps the first guard param schema', () => {
            expectTypeOf(result[0]).toEqualTypeOf({ userId: 'foo' });
        })
        
        it('unwraps the second guard param schema', () => {
            expectTypeOf(result[1]).toEqualTypeOf({ fields: ['_id', 'userId', 'createdAt'] });
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
    ];
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