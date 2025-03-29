import { humanizeProperty } from '@meteor-type-validation/utils';
import { expect, it } from 'vitest';

it('should split camelCase', () => {
    expect(humanizeProperty('createdBy')).toBe('Created by');
})