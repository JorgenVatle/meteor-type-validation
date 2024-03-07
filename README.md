# Meteor Type Validation
> Improves Meteor's built-in types using declarative API resource definitions.

## Usage
Install the package, and optionally [`valibot`](https://github.com/fabian-hiller/valibot) for schema validation.

```sh
npm i meteor-type-validation valibot
```

### Defining your Meteor API
This package takes a different approach to defining your Meteor methods and publications. To properly infer types for
each resource without resorting to a compilation step, we explicitly export each method/publication we want to expose.

Instead of defining your methods using `Meteor.methods(...)`, we export an object with the methods you want to publish.
We have two helper functions for this, `DefineMethods()` and `DefinePublications()` they're only there for type 
inference and just returns the same object you provided.

### Example
```ts
// ./imports/api/topics/methods.ts
import v from 'valibot';

const CreateSchema = v.object({
    title: v.string(),
});

export default DefineMethods({
    'topics.create': {
        schema: [CreateSchema],
        guards: [],
        method(topic) { 
            typeof topic.title // string
        }
    }
});
```

## Registering your API definitions
Having all your Meteor API resources be defined as exports rather than through a method call, we can now extend and
augment all your resources. But most importantly, we can extend Meteor's types to make things like `Meteor.call()`
autocomplete and perform type validation.

### Methods
On the server, import all of your method definitions and add them to one big index object.
```ts
// ./server/methods.ts
import { ExposeMethods, WrappedMeteorMethods } from 'meteor-type-validation'
import TopicMethods from '/imports/api/topics/methods';

const AllMethods = {
    ...TopicMethods,
} as const;

Meteor.startup(() => {
    ExposeMethods(AllMethods) // This is just a wrapper around Meteor.methods(...)
});

declare module 'meteor/meteor' {
    // This extends Meteor's types so that when you write Meteor.call(),
    // it will autocomplete and do all that sweet type checking for you 👌
    interface DefinedMethods extends WrappedMeteorMethods<typeof AllMethods> {}
}
```

### Publications
Just the same with your methods, add them to an object as const, and just expose them like you would with the
methods
```ts
// ./server/publications.ts
import { ExposePublications, WrappedMeteorPublications } from 'meteor-type-validation';
import TopicPublications from '/imports/api/topics/server/publications';

const AllPublications = {
    ...TopicPublications,
}

Meteor.startup(() => {
    ExposePublications(AllPublications);
});

declare module 'meteor/meteor' {
    interface DefinedPublications extends WrappedMeteorPublications<typeof AllPublications> {}
}
```

And that's about it. Whenever you use `Meteor.subscribe()` or `Meteor.call()` you should see that it both autocompletes
and type checks your parameters.

## License
ISC