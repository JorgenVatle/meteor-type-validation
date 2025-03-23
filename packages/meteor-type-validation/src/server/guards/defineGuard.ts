import { Guard, type GuardStatic } from './Guard';

type OptionKeys = 'writeToParams' | 'paramSchema' | 'writeToContext' | 'contextSchema';
type GuardOptions = Pick<Guard, OptionKeys>;

export function defineGuard<TOptions extends GuardOptions>({ writeToContext, writeToParams, contextSchema, paramSchema }: TOptions): GuardStatic<Exclude<Guard, OptionKeys> & TOptions> {
    return class DefinedGuard extends Guard {
        public readonly writeToContext = writeToContext;
        public readonly writeToParams = writeToParams;
        public readonly contextSchema = contextSchema;
        public readonly paramSchema = paramSchema;
    } as any;
}