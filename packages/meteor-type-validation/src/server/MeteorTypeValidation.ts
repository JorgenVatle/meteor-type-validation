/// <reference types="meteor/globals/ddp-rate-limiter" />
/// <reference path="../types/meteor/ModuleAugmentation.ts" />
import { Meteor } from 'meteor/meteor';
import { performance } from 'node:perf_hooks';
import type Pino from 'pino';
import { type GenericSchema, parse, ValiError } from 'valibot';
import { formatValibotError } from '../utils/FormatValibotError';
import type { GuardStatic } from './guards';
import { Logger } from './Logger';
import type {
    BaseContext,
    ContextWrapper,
    MethodDefinition,
    MethodDefinitionMap,
    MethodDefinitionResult,
    PublicationDefinition,
    PublicationDefinitionMap,
    PublicationDefinitionResult,
    RateLimiterRule,
    ResourceType,
    WrappedContext,
} from './ResourceTypes';

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
        TSchemas extends Record<TKeys, GenericSchema[]>,
        TGuards extends Record<TKeys,  GuardStatic[]>,
        TResult extends Record<TKeys, unknown>,
        const TKeys extends keyof TGuards | keyof TSchemas | keyof TResult,
    >(methods: {
        [key in TKeys]: MethodDefinition<TSchemas[key], TGuards[key], TExtendedContext, TResult[key]>
    }): {
        [key in TKeys]: MethodDefinitionResult<TSchemas[key], TResult[key]>
    } {
        return methods;
    }
    
    public definePublications<
        TSchemas extends Record<TKeys, GenericSchema[]>,
        TGuards extends Record<TKeys,  GuardStatic[]>,
        TResult extends Record<TKeys, unknown>,
        const TKeys extends keyof TGuards | keyof TSchemas | keyof TResult,
    >(publications: {
        [key in TKeys]: PublicationDefinition<TSchemas[key], TGuards[key], TExtendedContext, TResult[key]>
    }): {
        [key in TKeys]: PublicationDefinitionResult<TSchemas[key], TResult[key]>
    } {
        if (Meteor.isClient && !Meteor.isProduction) {
            const logger = this.options?.createLogger?.({ type: 'publication', name: '<internal definition>', context: {} as any }) || console;
            logger.warn(new Error(`Publication definition included in client bundle. This is generally unwanted as publications should only live on the server.`));
        }
        
        return publications;
    }
    
    public exposeMethods<TMethods extends MethodDefinitionMap>(methods: TMethods): {
        [key in keyof TMethods]: TMethods[key]['method']
    } {
        const methodMap = Object.entries(methods).map(([name, definition]) => {
            definition.rateLimiters?.forEach((rule) => this.loadRateLimit({ rule, name, type: 'method' }));
            return [name, this.wrapResource({ definition, name })]
        })
        const wrappedMethods = Object.fromEntries(methodMap);
        Meteor.methods(wrappedMethods);
        return wrappedMethods;
    }
    
    public exposePublications<TPublications extends PublicationDefinitionMap>(publications: TPublications): {
        [key in keyof TPublications]: TPublications[key]['publish']
    } {
        const publicationMap = Object.entries(publications).map(([name, definition]) => {
            const wrappedPublication = this.wrapResource({ name, definition });
            Meteor.publish(name, wrappedPublication);
            definition.rateLimiters?.forEach((rule) => this.loadRateLimit({ rule, name, type: 'publication' }));
            return [name, wrappedPublication];
        });
        
        return Object.fromEntries(publicationMap);
    }
    
    protected loadRateLimit({ rule, type, name }: { rule: RateLimiterRule, type: ContextWrapper['type'], name: string }) {
        DDPRateLimiter.addRule({
            ...rule,
            name,
            type,
        }, rule.requestCount ?? 10, rule.intervalMs ?? 1000);
    }
    
    protected extendContext({ type, context, name }: ContextWrapper): Promise<WrappedContext> | WrappedContext {
        const startTime = performance.now();
        const logger = this.options.createLogger?.({ type, context, name });
        const addedContext = this.options.extendContext?.({ type, context, name });
        logger?.debug('Incoming request');
        
        Object.assign(context, {
            type,
            name,
            logger,
            startTime,
        });
        
        if (!(addedContext instanceof Promise)) {
            // @ts-expect-error Type mismatch, can't be bothered
            return Object.assign(context, addedContext);
        }
        
        return addedContext.then((addedContext) => {
            return Object.assign(context, addedContext)
        })
    }
    
    protected async validateRequest({ context, definition, params }: {
        context: WrappedContext;
        definition: MethodDefinition | PublicationDefinition,
        params: unknown[]
    }): Promise<{ validatedParams: unknown[] }> {
        // Run input validation on method arguments
        const validatedParams = definition.schema.map((schema, index) => {
            return parse(schema, params[index]);
        });
        
        if (params.length > validatedParams.length) {
            throw new Meteor.Error(
                'too_many_parameters',
                `You're only allowed to supply ${definition.schema.length} parameters`,
            );
        }
        
        // Run guard validators
        for (const guard of definition.guards) {
            const validation = new guard(context, validatedParams)._validate();
            Promise.await ? Promise.await(validation) : await validation;
        }
        
        return {
            validatedParams,
        }
    }
    
    protected withErrorHandler(method: (...params: unknown[]) => unknown): (...params: unknown[]) => any {
        const customErrorHandler = this.options.errorHandler?.bind(this);
        return async function(this: WrappedContext & TExtendedContext, ...params: unknown[]) {
            try {
                const resultPromise = method.apply(this, params);
                const result = Promise.await ? Promise.await(resultPromise) : await resultPromise;
                this.logger?.debug(`Request completed in ${(performance.now() - this.startTime).toLocaleString()}ms`);
                return result;
            } catch (error) {
                if (customErrorHandler) {
                    return customErrorHandler(error);
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
            const contextPromise = api.extendContext({
                type,
                name,
                context: this,
            });
            
            const context = Promise.await ? Promise.await(contextPromise) : await contextPromise;
            
            const request = api.validateRequest({
                context,
                definition,
                params,
            });
            
            const { validatedParams } = Promise.await ? Promise.await(request) : await request;
            return run.apply(context, validatedParams)
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