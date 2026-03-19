declare module 'meteor/meteor' {
    // These are left empty so you can merge in your own types
    export interface DefinedMethods {}
    export interface DefinedPublications {}
    export type PublicationParams<TName extends Meteor.PublicationName> = Parameters<DefinedPublications[TName]>;
    export type MethodParams<TName extends Meteor.MethodName> = Parameters<DefinedMethods[TName]>;
    export type MethodResult<TName extends Meteor.MethodName> = Awaited<ReturnType<DefinedMethods[TName]>>;
    export type PublicationResult<TName extends Meteor.PublicationName> = ReturnType<DefinedPublications[TName]>;
    
    /**
     * Meteor.subscribe() options type. Remains untyped in current versions of @types/meteor
     * @link https://docs.meteor.com/api/meteor.html#Meteor-subscribe
     */
    export type SubscribeCallbacks = () => void | {
        onReady?: () => void,
        onStop?: (error?: Error) => void,
    }
    
    namespace Meteor {
        type MethodName = keyof DefinedMethods;
        type PublicationName = keyof DefinedPublications;
        
        function subscribe<
            TName extends PublicationName
        >(name: TName, ...params: [
            ...PublicationParams<TName>,
            callbacks?: SubscribeCallbacks,
        ]): Meteor.SubscriptionHandle;
        
        function call<
            TName extends MethodName
        >(
            name: TName,
            ...params: [...MethodParams<TName>, callback?: (error?: Error, response?: MethodResult<TName>) => void],
        ): void;
        
        function callAsync<
            TName extends MethodName
        >(name: TName, ...params: MethodParams<TName>): Promise<MethodResult<TName>>;
    }
}

export {}