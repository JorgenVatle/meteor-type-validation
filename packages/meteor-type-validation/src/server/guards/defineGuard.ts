import { Guard, type GuardStatic } from '@meteor-type-validation/server';

export function defineGuard<TProps extends GuardProps>(guard: TProps): GuardStatic<ComposableGuard<TProps>> {
    return class GuardClass extends ComposableGuard<TProps> {
        public readonly contextSchema = guard.contextSchema;
        public readonly paramSchema = guard.paramSchema;
        public readonly writeToContext = guard.writeToContext;
        public readonly writeToParams = guard.writeToParams;
        
        public validate() {
            return guard.validate?.apply(this);
        }
    }
}

interface GuardProps {
    contextSchema: Guard['contextSchema'];
    paramSchema: Guard['paramSchema'];
    writeToContext: Guard['writeToContext'];
    writeToParams: Guard['writeToParams'];
    validate?: Guard['validate'];
}

class ComposableGuard<TProps extends GuardProps> extends Guard {
    public readonly contextSchema!: TProps['contextSchema'];
    public readonly paramSchema!: TProps['paramSchema'];
    public readonly writeToContext!: TProps['writeToContext'];
    public readonly writeToParams!: TProps['writeToParams'];
}
