import { Meteor, type Subscription } from 'meteor/meteor';
import { performance } from 'node:perf_hooks';
import { parse, ValiError } from 'valibot';
import { formatValibotError } from './Errors';
import { Logger } from './Logger';

import type {
    BaseContext, ExtendedContext,
    MethodDefinition,
    MethodDefinitionMap,
    PublicationDefinition, PublicationDefinitionMap,
    WrappedContext,
} from './Types';

function validateRequest({ context, definition, params }: {
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

function withErrorHandler(method: (...params: unknown[]) => unknown) {
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

function wrapMethod(name: string, method: MethodDefinition, options?: WrapperOptions) {
    const methodHandle = function(this: Meteor.MethodThisType, ...params: unknown[]) {
        const context = extendContext({
            name,
            type: 'method',
            context: this,
        });
        
        if (options?.extendContext) {
            Object.assign(context, options.extendContext({ context, type: 'method', name }));
        }
        
        validateRequest({
            definition: method,
            context,
            params
        });
        
        return method.method.apply(context, params);
    }
    
    return withErrorHandler(methodHandle);
}

function wrapPublication(name: string, publication: PublicationDefinition, options?: WrapperOptions): (...params: unknown[]) => any {
    const publish = function(this: Subscription, ...params: unknown[]) {
        const context = extendContext({
            type: 'publication',
            name,
            context: this,
        });
        
        if (options?.extendContext) {
            Object.assign(context, options.extendContext({ context, type: 'publication', name }));
        }
        
        validateRequest({
            definition: publication,
            context,
            params,
        });
        
        return publication.publish.apply(context, params);
    }
    
    return withErrorHandler(publish);
}

function extendContext({ type, context, name }: ContextWrapper) {
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

export function ExposeMethods(methods: MethodDefinitionMap, options?: WrapperOptions) {
    const methodEntries = Object.entries(methods).map(([name, definition]) => {
        return [name, wrapMethod(name, definition, options)];
    });
    
    Meteor.methods(Object.fromEntries(methodEntries));
}

export function ExposePublications(publications: PublicationDefinitionMap, options?: WrapperOptions) {
    Object.entries(publications).map(([name, definition]) => {
        Meteor.publish(name, wrapPublication(name, definition, options))
    });
}

interface WrapperOptions {
    extendContext?: (wrapper: ContextWrapper) => ExtendedContext;
}

interface ContextWrapper {
    name: string;
    context: BaseContext;
    type: 'method' | 'publication';
}