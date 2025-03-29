import { expect, it } from 'vitest';
import { humanize } from '../src/server/util/Humanize';

it('should split camelCase', () => {
    expect(humanize('createdBy')).toBe('Created by');
})