import { Meteor, DefinedMethods, DefinedPublications } from 'meteor/meteor';

export default new class MeteorApi {
    
    public callAsync<TMethod extends keyof DefinedMethods>(
        name: TMethod,
        ...params: Parameters<DefinedMethods[TMethod]>
    ) {
        return Meteor.callAsync<TMethod>(name, ...params);
    }
    
}