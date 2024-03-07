import { Meteor } from 'meteor/meteor';
import { performance } from 'node:perf_hooks';
import { parse, ValiError } from 'valibot';
import { formatValibotError } from './Errors';
import { Logger } from './Logger';
import type { BaseContext, MethodDefinition, PublicationDefinition, ResourceType, WrappedContext } from './Types';
import type { ContextWrapper } from './Wrappers';

export default class MeteorAPI {
    constructor() {
    }
    
    extendContext({ type, context, name }: ContextWrapper) {
        const startTime = performance.now();
        const logger = Logger.child({
            [type]: { name },
            user: { id: context.userId },
        }, {
            msgPrefix: `[${type}] [${name}] `
        });
        logger.debug('Incoming request');
        
        return Object.assign(context, {
            type,
            name,
            logger,
            startTime,
        });
    }
    
    validateRequest({ context, definition, params }: {
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
            throw new Meteor.Error('too_many_parameters', `You're only allowed to supply ${definition.schema.length} parameters`);
        }
        
        // Run guard validators
        definition.guards.forEach((guard) => new guard(context, validatedParams).validate());
    }
    
    private parseDefinition(definition: MethodDefinition | PublicationDefinition): { type: ResourceType, run: (...params: unknown[]) => unknown } {
        if ('publish' in definition) {
            return {
                type: 'publication',
                run: definition.publish,
            }
        }
        return {
            type: 'method',
            run: definition.method,
        }
    }
    
    withErrorHandler(method: (...params: unknown[]) => unknown) {
        return function(this: WrappedContext, ...params: unknown[]) {
            try {
                const result = method.apply(this, params);
                this.logger.debug(`Request completed in ${(performance.now() - this.startTime).toLocaleString()}ms`)
                return result;
            } catch (error) {
                let formattedError = new Error('Unexpected internal server error!');
                
                if (error instanceof ValiError) {
                    formattedError = formatValibotError(error);
                } else if (error instanceof Error) {
                    formattedError = error;
                }
                
                this.logger.error({
                    error: formattedError || error
                }, `Request failed: ${formattedError.message}`);
                throw error;
            }
        }
    }
    
    wrapResource({ definition, name }: { definition: MethodDefinition | PublicationDefinition, name: string, handle: (...params: unknown[]) => unknown }) {
        const api = this;
        const { run, type } = this.parseDefinition(definition);
        
        const handle = function(this: BaseContext, ...params: unknown[]) {
            const context = api.extendContext({
                type,
                name,
                context: this,
            });
            
            api.validateRequest({
                context,
                definition,
                params,
            });
            
            run.apply(context, params);
        }
        
        return this.withErrorHandler(handle);
    }
}