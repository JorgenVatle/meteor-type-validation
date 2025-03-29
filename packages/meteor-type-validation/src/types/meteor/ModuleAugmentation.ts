declare module 'meteor/meteor' {
    // These are left empty so you can merge in your own types
    export interface DefinedMethods {}
    export interface DefinedPublications {}
    export type MethodName = keyof DefinedMethods;
    export type PublicationName = keyof DefinedPublications;
    export type PublicationParams<TName extends PublicationName> = Parameters<DefinedPublications[TName]>;
    export type MethodParams<TName extends MethodName> = Parameters<DefinedMethods[TName]>;
    export type MethodResult<TName extends MethodName> = Awaited<ReturnType<DefinedMethods[TName]>>;
    export type PublicationResult<TName extends PublicationName> = ReturnType<DefinedPublications[TName]>;
    
    namespace Meteor {
        function subscribe<
            TName extends PublicationName
        >(name: TName, ...params: PublicationParams<TName>): Meteor.SubscriptionHandle;
        
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