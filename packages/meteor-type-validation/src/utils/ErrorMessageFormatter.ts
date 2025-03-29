import * as v from 'valibot';
import { humanizeProperty } from './Humanize';

type Issue = v.BaseIssue<unknown>;

export const ErrorMessageFormatter = {
    required: (issue: Issue) => {
        const key = v.getDotPath(issue);
        return {
            message: `${humanizeProperty(key)} is required`,
            key,
        }
    },
}