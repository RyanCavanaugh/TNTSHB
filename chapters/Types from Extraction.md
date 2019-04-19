# Types from Extraction

TypeScript's type system is very powerful because it allows expressing types *in terms of other types*.
Although the simplest form of this is generics, we actually have a wide variety of *type operators* available to us.
It's also possible to express types in terms of *values* that we already have.

By combining various type operators, we can express complex operations and values in a succinct, maintainable way.
In this chapter we'll cover ways to express a type in terms of an existing type or value.

__toc__

## The `typeof` type operator  {#typeof}

JavaScript already has a `typeof` operator you can use in an *expression* context:

```ts
// Prints "string"
console.log(typeof "Hello world");
```

TypeScript adds a `typeof` operator you can use in a *type* context to refer to the *type* of a variable or property:

```ts
let s = "hello";
let n: typeof s;
    ^?
```

This isn't very useful for basic types, but combined with other type operators, you can use `typeof` to conveniently express many patterns.
For an example, let's start by looking at the predefined type `ReturnType<T>`.
It takes a *function type* and produces its return type:

```ts
type Predicate = (x: unknown) => boolean;
// K is just "boolean"
type K = ReturnType<Predicate>;
```

If we try to use `ReturnType` on a function name, we see an instructive error:

```ts
function f() {
    return { x: 10, y: 3 };
}
type P = ReturnType<f>;
```

Remember that *values* and *types* aren't the same thing.
To refer to the *type* that the *value `f`* has, we use `typeof`:

```ts
function f() {
    return { x: 10, y: 3 };
}
type P = ReturnType<typeof f>;
     ^?
```

### Limitations

TypeScript intentionally limits the sorts of expressions you can use `typeof` on.
Specifically, it's only legal to use `typeof` on identifiers (i.e. variable names) or their properties.
This helps avoid the confusing trap of writing code you think is executing, but isn't:

```ts
declare const msgbox: any;
type msgbox = any;
//cut
// Meant to use =
let x : msgbox("Are you sure you want to continue?");
```

## The `keyof` type operator {#keyof}

The `keyof` operator takes a type and produces a string or numeric literal union of its keys:

```ts
type Point = { x: number, y: number };
type P = keyof Point;
     ^?
```

If the type has a `string` or `number` index signature, `keyof` will return those types instead:

```ts
type Arrayish = { [n: number]: unknown };
type A = keyof Arrayish;
     ^?

type Mapish = { [k: string]: boolean };
type M = keyof Mapish;
     ^?
```

Note that in this example, `M` is `string | number` -- this is because JavaScript object keys are always coerced to a string, so `obj[0]` is always the same as `obj["0"]`.

`keyof` types become especially useful when combined with mapped types, which we'll learn more about later.

## Indexed Access Types

We can use `typeof` to reference the type of a property of a value.
What if we want to reference the type of a property of a type instead?

We can use an *indexed access type* to look up a specific property on another type:

```ts
type Person = { age: number, name: string, alive: boolean };
type A = Person["age"];
     ^?
```

The indexing type is itself a type, so we can use unions, `keyof`, or other types entirely:

```ts
type Person = { age: number, name: string, alive: boolean };
//cut
type I1 = Person["age" | "name"];
     ^?

type I2 = Person[keyof Person];
     ^?

type AliveOrName = "alive" | "name";
type I3 = Person[AliveOrName];
     ^?
```

You'll even see an error if you try to index a property that doesn't exist:

```ts
type Person = { age: number, name: string, alive: boolean };
//cut
type I1 = Person["alve"];
```

Another example of indexing with an arbitrary type is using `number` to get the type of an array's elements.
We can combine this with `typeof` to conveniently capture the element type of an array literal:

```ts
const MyArray = [
    { name: "Alice", age: 15 },
    { name: "Bob", age: 23 },
    { name: "Eve", age: 38 }
];

type T = (typeof MyArray)[number];
     ^?
```
