import {
    Meteor,
    MethodName,
    MethodParams,
    MethodResult,
    PublicationName,
    PublicationParams,
    SubscribeCallbacks,
} from 'meteor/meteor';


/**
 * Overrides for Meteor's default types to enforce type safety.
 */
export const MeteorApi = {
    callAsync: Meteor.callAsync as <TName extends MethodName>(
        name: TName,
        ...params: MethodParams<TName>
    ) => Promise<MethodResult<TName>>,
    
    call: Meteor.call as <TName extends MethodName>(
        name: TName,
        ...params: [
            ...MethodParams<TName>,
            callback?: (error?: Error, response?: MethodResult<TName>
            ) => void
        ]
    ) => void,
    
    subscribe: Meteor.subscribe as <TName extends PublicationName>(
        name: TName,
        ...params: [
            ...PublicationParams<TName>,
            callbacks?: SubscribeCallbacks,
        ]
    ) => Meteor.SubscriptionHandle,
}
