import * as v from 'valibot';
import { describe, expectTypeOf, it } from 'vitest';
import { Guard, type GuardStatic, UserLoggedInGuard } from './guards';
import type { ValidatedStaticThisType, ValidatedThisType } from './ResourceTypes';

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
            expectTypeOf(result).toMatchTypeOf<{ userId: string | null }>();
            expectTypeOf(result).toMatchTypeOf<{ extra: string }>();
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
    })
   
    
});

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
