declare module 'meteor/meteor' {
    // These are left empty so you can merge in your own types
    export interface DefinedMethods {}
    export interface DefinedPublications {}
    
    module Meteor {
        function subscribe<
            TName extends keyof DefinedPublications
        >(
            name: TName,
            ...params: Parameters<DefinedPublications[TName]>
        ): Meteor.SubscriptionHandle;
        
        function call<TName extends keyof DefinedMethods>(
            name: TName,
            ...params: [
                ...Parameters<DefinedMethods[TName]>,
                callback?: (error?: Error, response?: ReturnType<DefinedMethods[TName]>) => void
            ],
        ): void;
        
        function callAsync<TName extends keyof DefinedMethods>(
            name: TName,
            ...params: Parameters<DefinedMethods[TName]>
        ): Awaited<ReturnType<DefinedMethods[TName]>>;
    }
}