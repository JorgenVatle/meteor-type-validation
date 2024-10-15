import { Meteor } from '@meteor';
import { performance } from 'node:perf_hooks';
import Pino from 'pino';
import { type GenericSchema, parse, ValiError } from 'valibot';
import { formatValibotError } from './Errors';
import type { GuardStatic } from './Guard';
import { Logger } from './Logger';
import type {
    BaseContext,
    ContextWrapper,
    MethodDefinition,
    MethodDefinitionMap,
    PublicationDefinition,
    PublicationDefinitionMap, RateLimiterRule,
    ResourceType,
    WrappedContext,
} from './types/ValidatedResources';

export class MeteorTypeValidation<
    TAddedContext = {},
    TOptionsContext extends {
        logger?: Pino.Logger;
    } = {},
    TExtendedContext extends TAddedContext & TOptionsContext = TAddedContext & TOptionsContext
> {
    constructor(protected readonly options: {
        extendContext?: (context: ContextWrapper) => TExtendedContext;
        createLogger?: (context: ContextWrapper) => TOptionsContext['logger'];
        errorHandler?: (error: unknown) => never;
    } = {}) {
        this.setupDefaultLogger();
    }
    
    protected setupDefaultLogger() {
        if (this.options.createLogger) return;
        if (this.options.createLogger === false) return;
        
        this.options.createLogger = ({ type, name, context }) => {
            return  Logger.child({
                [type]: { name },
                user: { id: context.userId },
            }, {
                msgPrefix: `[${type}] [${name}] `,
            });
        }
    }
    
    public defineMethods<
        TSchemas extends Record<keyof TGuards, GenericSchema[]>,
        TGuards extends Record<keyof TSchemas | keyof TResult, GuardStatic[]>,
        TResult extends Record<keyof TSchemas | keyof TGuards, unknown>
    >(methods: {
        [key in keyof TSchemas | keyof TGuards | keyof TResult]: MethodDefinition<TSchemas[key], TGuards[key], TExtendedContext, TResult[key]>
    }) {
        return methods;
    }
    
    public definePublications<
        TSchemas extends Record<keyof TGuards, GenericSchema[]>,
        TGuards extends Record<keyof TSchemas | keyof TResult, GuardStatic[]>,
        TResult extends Record<keyof TSchemas | keyof TGuards, unknown>
    >(publications: {
        [key in keyof TSchemas | keyof TGuards | keyof TResult]: PublicationDefinition<TSchemas[key], TGuards[key], TExtendedContext, TResult[key]>
    }) {
        return publications;
    }
    
    public exposeMethods(methods: MethodDefinitionMap) {
        const methodMap = Object.entries(methods).map(([name, definition]) => {
            definition.rateLimiters?.forEach((rule) => this.loadRateLimit({ rule, name, type: 'method' }));
            return [name, this.wrapResource({ definition, name })]
        })
        Meteor.methods(Object.fromEntries(methodMap));
    }
    
    public exposePublications(publications: PublicationDefinitionMap) {
        for (const [name, definition] of Object.entries(publications)) {
            Meteor.publish(name, this.wrapResource({ name, definition }))
            definition.rateLimiters?.forEach((rule) => this.loadRateLimit({ rule, name, type: 'publication' }));
        }
    }
    
    protected loadRateLimit({ rule, type, name }: { rule: RateLimiterRule, type: ContextWrapper['type'], name: string }) {
        DDPRateLimiter.addRule({
            ...rule,
            name,
            type,
        }, rule.requestCount ?? 10, rule.intervalMs ?? 1000);
    }
    
    protected extendContext({ type, context, name }: ContextWrapper) {
        const startTime = performance.now();
        const logger = this.options.createLogger?.({ type, context, name });
        const addedContext = this.options.extendContext?.({ type, context, name });
        logger?.debug('Incoming request');
        
        return Object.assign(context, {
            type,
            name,
            logger,
            startTime,
        }, addedContext);
    }
    
    protected async validateRequest({ context, definition, params }: {
        context: WrappedContext;
        definition: MethodDefinition | PublicationDefinition,
        params: unknown[]
    }) {
        // Run input validation on method arguments
        const validatedParams = definition.schema.map((schema, index) => {
            return parse(schema, params[index]);
        });
        
        // Warn user if too many arguments were provided
        if (params.length > validatedParams.length) {
            throw new Meteor.Error(
                'too_many_parameters',
                `You're only allowed to supply ${definition.schema.length} parameters`,
            );
        }
        
        // Run guard validators
        for (const guard of definition.guards) {
            await new guard(context, validatedParams).validate();
        }
        
        return {
            validatedParams,
        }
    }
    
    protected withErrorHandler(method: (...params: unknown[]) => unknown): (...params: unknown[]) => any {
        const api = this;
        return function(this: WrappedContext & TExtendedContext, ...params: unknown[]) {
            try {
                const result = method.apply(this, params);
                this.logger?.debug(`Request completed in ${(performance.now() - this.startTime).toLocaleString()}ms`);
                return result;
            } catch (error) {
                if (api.options.errorHandler) {
                    return api.options.errorHandler(error);
                }
                
                let formattedError = error instanceof Error
                                     ? error
                                     : new Error(`Unexpected internal server error: ${error}`);
                
                if (error instanceof ValiError) {
                    formattedError = formatValibotError(error);
                }
                
                this.logger?.error({
                    error: formattedError,
                }, `Request failed: ${formattedError.message}`);
                
                throw formattedError;
            }
        };
    }
    
    protected wrapResource({ definition, name }: {
        definition: MethodDefinition | PublicationDefinition,
        name: string,
    }) {
        const api = this;
        const { run, type } = this.parseDefinition(definition);
        
        const handle = async function(this: BaseContext, ...params: unknown[]) {
            const context = api.extendContext({
                type,
                name,
                context: this,
            });
            
            const { validatedParams } = await api.validateRequest({
                context,
                definition,
                params,
            });
            
            return run.apply(context, validatedParams);
        };
        
        return this.withErrorHandler(handle);
    }
    
    private parseDefinition(definition: MethodDefinition | PublicationDefinition): {
        type: ResourceType,
        run: (...params: unknown[]) => unknown
    } {
        if ('publish' in definition) {
            return {
                type: 'publication',
                run: definition.publish,
            };
        }
        return {
            type: 'method',
            run: definition.method,
        };
    }
}