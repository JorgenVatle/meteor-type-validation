import { expect, it } from 'vitest';
import { humanizeProperty } from '../src/server/util/Humanize';

it('should split camelCase', () => {
    expect(humanizeProperty('createdBy')).toBe('Created by');
})