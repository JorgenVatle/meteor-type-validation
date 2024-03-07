import { Meteor, DefinedMethods, DefinedPublications } from 'meteor/meteor';

export default new class MeteorApi {
    
    public callAsync<TName extends keyof DefinedMethods>(
        name: TName,
        ...params: Parameters<DefinedMethods[TName]>
    ) {
        return Meteor.callAsync<TName>(name, ...params);
    }
    
    public call<TName extends keyof DefinedMethods>(
        name: TName,
        ...params: [
            ...Parameters<DefinedMethods[TName]>,
            ...[callback?: (error?: Error, response?: ReturnType<DefinedMethods[TName]>) => void]
        ]
    ) {
        return Meteor.call<TName>(name, ...params);
    }
    
    public subscribe<TName extends keyof DefinedPublications>(name: TName, ...params: Parameters<DefinedPublications[TName]>) {
        return Meteor.subscribe<TName>(name, ...params);
    }
    
}