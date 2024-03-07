# Meteor Type Validation
> Improves Meteor's built-in types using declarative API resource definitions.

## Installation
Install the package, and optionally [`valibot`](https://github.com/fabian-hiller/valibot) for schema validation.

```sh
npm i meteor-type-validation valibot
```

## Defining your Meteor API
This package takes a different approach to defining your Meteor methods and publications. To properly infer types for
each resource without resorting to a compilation step, we explicitly export each method/publication we want to expose.

Instead of defining your methods using `Meteor.methods(...)`, we export an object with the methods you want to publish.
We have two helper functions for this, `DefineMethods()` and `DefinePublications()` they're only there for type 
inference and just returns the same object you provided.

### Example methods
```ts
// ./imports/api/topics/methods.ts
import { DefineMethods } from 'meteor-type-validation';
import * as v from 'valibot';

const CreateSchema = v.object({
    title: v.string(),
});

export default DefineMethods({
    'topics.create': {
        schema: [CreateSchema],
        method(topic) { // Method parameters are validated and have proper types
            return TopicsCollection.insert(topic);
        }
    },
    'topics.remove': {
        schema: [v.string()],
        method(topicId) {
            return TopicsCollection.remove(topicId);
        }
    }
});
```
### Example publications
```ts
// ./imports/api/topics/server/publications.ts
import { DefinePublications } from 'meteor-type-validation';
import * as v from 'valibot';

const QuerySchema = v.object({
    _id: v.optional(v.string()),
    createdBy: v.optional(v.string()),
});
const OptionsSchema = v.object({
    limit: v.number(v.maxValue(255))
})

export default DefinePublications({
    'topics': {
        schema: [QuerySchema, OptionsSchema],
        publish(query, options) {
            return TopicsCollection.find(query, options);
        }
    }
})
```

## Registering your API definitions
Having all your Meteor API resources be defined as exports rather than through a method call, we can now extend and
augment all your resources. But most importantly, we can extend Meteor's types to make things like `Meteor.call()`
autocomplete and perform type validation.

On the server, import all of your publication and method definitions and add them to one big index object.
```ts
// ./imports/api/index.ts
import { ExposeMethods, WrappedMeteorMethods } from 'meteor-type-validation'
import TopicMethods from '/imports/api/topics/methods';
import TopicPublications from '/imports/api/topics/server/publications';

export const AllMethods = {
    ...TopicMethods,
} as const;

export const AllPublications = {
    ...TopicPublications,
} as const;
```

Then, in your server startup module, import and expose each resource like you normally would with `Meteor.publish()` 
and `Meteor.methods()`.
```ts
// ./server/startup.ts
import { AllMethods, AllPublications } from '/imports/api';
import { 
    ExposeMethods, 
    ExposePublications,
    WrappedMeteorPublications,
    WrappedMeteorMethods 
} from 'meteor-type-validation';

Meteor.startup(() => {
    ExposeMethods(AllMethods);
    ExposePublications(AllPublications);
});

// This extends Meteor's types so that Meteor.call() and Meteor.subscribe()
// will autocomplete and do all that sweet type checking for you 👌
declare module 'meteor/meteor' {
    interface DefinedPublications extends WrappedMeteorPublications<typeof AllPublications> {}
    interface DefinedMethods extends WrappedMeteorMethods<typeof AllPublications> {}
}
```

And that's about it. Whenever you use `Meteor.subscribe()` or `Meteor.call()` you should see that it both autocompletes
method/publication names, and it type checks your provided parameters.

## Notes
If you're using the `@types/meteor` package, you might only get auto-completion for publication/method names.
The best way to enforce strict typing for these calls would be to explicitly define the resource name as a generic param.

```ts
Meteor.call<'topics.create'>('topics.create', { 
    title: '...'  // strictly type checked
})

Meteor.subscribe<'topics'>('topics', { 
    createdBy: null // type error: `null` is not assignable to `string`
})
```



## License
MIT