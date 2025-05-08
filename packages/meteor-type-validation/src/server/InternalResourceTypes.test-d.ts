import { describe, expectTypeOf, it } from 'vitest';
import { type GuardStatic, UserLoggedInGuard } from './guards';
import type { ValidatedStaticThisType } from './InternalResourceTypes';

describe('ValidatedStaticThisType', () => {
    function unwrapThis<TGuards extends GuardStatic[]>(guards: TGuards) {
        return null as ValidatedStaticThisType<TGuards>
    }
    
    it('can unwrap the this context for a single guard class', () => {
        const result = unwrapThis([
            UserLoggedInGuard,
        ]);
        
        expectTypeOf(result).toMatchTypeOf<{ userId: string | null }>();
    })
})