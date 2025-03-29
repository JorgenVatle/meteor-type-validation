import * as v from 'valibot';
import { humanizeProperty } from './Humanize';

type Issue = v.BaseIssue<unknown>;

export const ErrorMessageFormatter = {
    required: (issue: Issue) => {
        const key = v.getDotPath(issue);
        return {
            message: `${humanizeProperty(key)} is required`,
            reason: issue.message,
            key,
        }
    },
} satisfies Record<string, (issue: Issue) => { message: string, key: string | null, reason: string }>