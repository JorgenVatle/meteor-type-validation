import { Meteor } from 'meteor/meteor';
import { type BaseSchema, flatten, ValiError } from 'valibot';
import { humanizeProperty } from './Humanize';

export function formatValibotError(error: ValiError<BaseSchema<any, any, any>>) {
    const errors: { message: string, reason?: string, key: string }[] = [];
    const { nested, root } = flatten(error.issues) as { nested: Record<string, string[]>, root: string[] };
    
    Object.entries(nested).forEach(([key, messages]) => {
        messages?.forEach((message) => {
            errors.push({
                message: message.replace('Invalid type: Expected', `Expected ${humanizeProperty(key)} to be`),
                reason: message,
                key,
            })
        })
    });
    
    root?.forEach((message) => {
        errors.push({
            message,
            key: '[root]'
        })
    });
    return new MeteorError('ValiError', error.message, { errors, issues: error.issues });
}

class MeteorError extends Meteor.Error {
    constructor(code: string | number, message: string, details: string | object) {
        super(
            code,
            message,
            // @ts-expect-error @types/meteor invalidly sets a 'string' type here.
            details
        );
    }
}
