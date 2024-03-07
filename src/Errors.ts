import { Meteor } from 'meteor/meteor';
import { ValiError, flatten } from 'valibot';
import { startCase } from 'lodash-es';

export function formatValibotError(error: ValiError) {
    const errors: { message: string, reason?: string, key: string }[] = [];
    Object.entries(flatten(error).nested).forEach(([key, messages]) => {
        messages?.forEach((message) => {
            errors.push({
                message: message.replace('Invalid type: Expected', `Expected ${startCase(key)} to be`),
                reason: message,
                key,
            })
        })
    });
    return new MeteorError('ValiError', error.message, errors);
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