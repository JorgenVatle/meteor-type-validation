/// <reference types="meteor/globals/ddp-rate-limiter" />
import { Meteor } from '@meteor';
import { performance } from 'node:perf_hooks';
import type Pino from 'pino';
import { type GenericSchema, parse, ValiError } from 'valibot';
import { formatValibotError } from './Errors';
import type { GuardStatic } from './guards/Guard';
import { Logger } from './Logger';
import type {
    BaseContext,
    ContextWrapper,
    MethodDefinition,
    PublicationDefinition,
    RateLimiterRule, ResourceDefinition,
    ResourceType, UnwrapMethods, UnwrapPublications,
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
        TResult extends Record<keyof TSchemas | keyof TGuards, unknown>,
        TMethods extends {
            [key in keyof TSchemas | keyof TGuards | keyof TResult]: {
                guards: any,
                schema: any,
                method: MethodDefinition<TSchemas[key], TGuards[key], TExtendedContext, TResult[key]>['method']
            }
        }
    >(methods: {
        [key in keyof TSchemas | keyof TGuards | keyof TResult]: MethodDefinition<TSchemas[key], TGuards[key], TExtendedContext, TResult[key]>
    }): TMethods {
        return methods as TMethods;
    }
    
    public definePublications<
        TSchemas extends Record<keyof TGuards, GenericSchema[]>,
        TGuards extends Record<keyof TSchemas | keyof TResult, GuardStatic[]>,
        TResult extends Record<keyof TSchemas | keyof TGuards, unknown>,
        TPublications extends {
            [key in keyof TSchemas | keyof TGuards | keyof TResult]: {
                schema: any,
                guards: any,
                publish: PublicationDefinition<TSchemas[key], TGuards[key], TExtendedContext, TResult[key]>['publish']
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
    
    public exposeMethods<TMethods extends Record<string, MethodDefinition<any, any>>>(methods: TMethods): UnwrapMethods<TMethods> {
        const methodMap = Object.entries(methods).map(([name, definition]) => {
            definition.rateLimiters?.forEach((rule) => this.loadRateLimit({ rule, name, type: 'method' }));
            return [name, this.wrapResource({ definition, name })]
        })
        const wrappedMethods = Object.fromEntries(methodMap);
        Meteor.methods(wrappedMethods);
        return wrappedMethods;
    }
    
    public exposePublications<TPublications extends Record<string, PublicationDefinition<any, any>>>(publications: TPublications): UnwrapPublications<TPublications> {
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
    
    protected extendContext({ type, context, name }: ContextWrapper) {
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
        
        const handle = async function(this: BaseContext, ...params: unknown[]) {
            const context = await api.extendContext({
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
    
    private isType<
        TType extends ResourceType,
        TDefinition extends ResourceDefinition,
    >(definition: TDefinition, type: TType): type is TType {
        return this.parseDefinition(definition).type === type;
    }
}