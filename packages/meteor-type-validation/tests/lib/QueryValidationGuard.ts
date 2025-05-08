import { Guard } from '@meteor-type-validation/server';
import * as v from 'valibot';

export class QueryValidationGuard extends Guard {
    
    public readonly writeToParams = false;
    public readonly writeToContext = false;
    public readonly contextSchema = undefined
    public readonly paramSchema = [
        v.object({
            channelId: v.string(),
        }),
        v.object({
            fields: v.record(v.picklist(['title', 'completed', 'createdAt']), v.literal(1)),
            limit: v.pipe(v.number(), v.integer(), v.minValue(1), v.maxValue(100)),
        })
    ];
    
}