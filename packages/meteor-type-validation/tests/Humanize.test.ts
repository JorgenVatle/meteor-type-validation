import { expect, it } from 'vitest';
import { humanizeProperty } from '../src/server/utils/Humanize';

it('should split camelCase', () => {
    expect(humanizeProperty('createdBy')).toBe('Created by');
})