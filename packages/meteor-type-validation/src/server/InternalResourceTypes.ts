import type { InferOutput } from 'valibot';
import { Guard, type GuardStatic } from './guards';
import type { ValibotSchema } from './ResourceTypes';

export type ValidatedStaticThisType<
    TGuards extends GuardStatic[]
> = {
    [key in keyof TGuards]: InstanceType<TGuards[key]> extends Guard<infer TSchema extends ValibotSchema, any>
                            ? InferOutput<TSchema>
                            : never
}[number];
