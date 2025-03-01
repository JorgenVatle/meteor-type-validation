/// <reference types="meteor/globals/ddp-rate-limiter" />
import { Meteor } from 'meteor/meteor';
import { performance } from 'node:perf_hooks';
import type Pino from 'pino';
import type {
    BaseContext,
    ContextWrapper,
    MethodDefinition,
    MethodDefinitionMap,
    PublicationDefinition,
    PublicationDefinitionMap,
    RateLimiterRule,
    ResourceType,
    UnwrapMethods,
    UnwrapPublications,
    UnwrapSchemaInput,
    WrappedContext,
} from 'src/types';
import { type GenericSchema, parse, ValiError } from 'valibot';
import { formatValibotError } from './Errors';
import type { GuardStatic } from './guards';
import { Logger } from './Logger';

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
        TResult extends Record<keyof TSchemas | keyof TGuards, unknown>,
        TMethods extends {
            [key in keyof TSchemas | keyof TGuards | keyof TResult]: {
                guards: any,
                schema: any,
                method: (...params: UnwrapSchemaInput<NoInfer<TSchemas>[key]>) => NoInfer<TResult>[key];
            }
        }
    >(methods: {
        [key in keyof TSchemas | keyof TGuards | keyof TResult]: MethodDefinition<TSchemas[key], TGuards[key], TExtendedContext, TResult[key]>
    }): TMethods {
        // @ts-expect-error The method() property is modified to accept schema input types instead of output schema types which are used by the actual definition
        return methods;
    }
    
    public definePublications<
        TSchemas extends Record<keyof TGuards, GenericSchema[]>,
        TGuards extends Record<keyof TSchemas | keyof TResult, GuardStatic[]>,
        TResult extends Record<keyof TSchemas | keyof TGuards, unknown>,
        TPublications extends {
            [key in keyof TSchemas | keyof TGuards | keyof TResult]: {
                schema: any,
                guards: any,
                publish: (...params: UnwrapSchemaInput<NoInfer<TSchemas>[key]>) => NoInfer<TResult>[key]
                rateLimiters?: RateLimiterRule[]
            }
        }
    >(publications: {
        [key in keyof TSchemas | keyof TGuards | keyof TResult]: PublicationDefinition<TSchemas[key], TGuards[key], TExtendedContext, TResult[key]>
    }): TPublications {
        if (Meteor.isClient && !Meteor.isProduction) {
            const logger = this.options?.createLogger?.({ type: 'publication', name: '<internal definition>', context: {} as any }) || console;
            logger.warn(new Error(`Publication definition included in client bundle. This is generally unwanted as publications should only live on the server.`));
        }
        
        // @ts-expect-error Type mismatch
        return publications;
    }
    
    public exposeMethods<TMethods extends MethodDefinitionMap>(methods: TMethods): UnwrapMethods<TMethods> {
        const methodMap = Object.entries(methods).map(([name, definition]) => {
            definition.rateLimiters?.forEach((rule) => this.loadRateLimit({ rule, name, type: 'method' }));
            return [name, this.wrapResource({ definition, name })]
        })
        const wrappedMethods = Object.fromEntries(methodMap);
        Meteor.methods(wrappedMethods);
        return wrappedMethods;
    }
    
    public exposePublications<TPublications extends PublicationDefinitionMap>(publications: TPublications): UnwrapPublications<TPublications> {
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
        context: WrappedContext | Promise<WrappedContext>;
        definition: MethodDefinition | PublicationDefinition,
        params: unknown[]
    }) {
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
        
        const awaitedContext: WrappedContext = await context;
        
        // Run guard validators
        for (const guard of definition.guards) {
            await new guard(awaitedContext, validatedParams)._validate();
        }
        
        return {
            validatedParams,
            validatedContext: awaitedContext,
        }
    }
    
    protected withErrorHandler(method: (...params: unknown[]) => unknown): (...params: unknown[]) => any {
        const customErrorHandler = this.options.errorHandler?.bind(this);
        return async function(this: WrappedContext & TExtendedContext, ...params: unknown[]) {
            try {
                const result = await method.apply(this, params);
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
        
        const handle = function(this: BaseContext, ...params: unknown[]) {
            const request = api.validateRequest({
                context: api.extendContext({
                    type,
                    name,
                    context: this,
                }),
                definition,
                params,
            });
            
            if (Promise.await) {
                const { validatedContext, validatedParams } = Promise.await(request);
                return run.apply(validatedContext, validatedParams);
            }
            
            return request.then(({ validatedParams, validatedContext }) => {
                return run.apply(validatedContext, validatedParams);
            })
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

declare global {
    interface PromiseConstructor {
        await?: <T>(promise: T) => Awaited<T>
    }
}