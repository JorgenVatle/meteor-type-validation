import { Meteor } from 'meteor/meteor';
import * as v from 'valibot';
import { type BaseSchema, getDotPath, ValiError } from 'valibot';
import { ErrorMessageFormatter, type FormattedErrorMessage } from './ErrorMessageFormatter';

export function formatValibotError(error: ValiError<BaseSchema<any, any, any>>) {
    const errors: FormattedErrorMessage[] = error.issues.map((issue) => formatIssue(issue));
    
    return new MeteorValiError(error.message, {
        errors,
        issues: error.issues
    });
}

function isDefaultMessage(issue: v.BaseIssue<unknown>) {
    const message = issue.message;
    if (message.includes('Invalid key: Expected')) {
        return true;
    }
    return false;
}

export function formatIssue(issue: v.BaseIssue<unknown>): FormattedErrorMessage {
    
    if (!isDefaultMessage(issue)) {
        return {
            key: getDotPath(issue),
            message: issue.message,
            reason: issue.message,
        }
    }
    
    if (issue.type === 'object') {
        if (issue.received === 'undefined') {
            return ErrorMessageFormatter.required(issue);
        }
    }
    
    return {
        message: issue.message,
        key: getDotPath(issue),
        reason: issue.message,
    }
}

class MeteorValiError extends Meteor.Error {
    constructor(message: string, details: string | object) {
        super(
            'ValiError',
            message,
            // @ts-expect-error @types/meteor invalidly sets a 'string' type here.
            details
        );
    }
}
