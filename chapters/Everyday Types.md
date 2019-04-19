<!-- Extremely WIP, do not review -->

# Everyday Types

In this chapter, we'll cover some of the most common types of values you'll find in JavaScript code, and explain the corresponding ways to describe those types in TypeScript.
This isn't an exhaustive list, and future chapters will describe more ways to name and use other types.

Types can also appear in many more *places* than just type annotations.
As we learn about the types themselves, we'll also learn about the places where we can refer to these types to form new constructs.

We'll start by reviewing the most basic and common types you might encounter when writing JavaScript or TypeScript code.
These will later form the core "building blocks" of more complex types.

__toc__

## Primitives `string`, `number`, and `boolean`

JavaScript has three main [primitive](https://developer.mozilla.org/en-US/docs/Glossary/Primitive) kinds of values: `string`, `number`, and `boolean`.
Each has a corresponding type in TypeScript.
As you might expect, these are the same names you'd see if you used the JavaScript `typeof` operator on a value of those types:

* `string` represents string values like `"Hello, world"`
* `number` is for numbers like `42`. JavaScript does not have a special runtime value for integers, so there's no equivalent to `int` or `float` - everything is simply `number`
* `boolean` is for the two values `true` and `false`

> The type names `String`, `Number`, and `Boolean` (starting with capital letters) are legal, but refer to some special built-in types that shouldn't appear in your code. *Always* use `string`, `number`, or `boolean`.

## Arrays

To specify the type of an array like `[1, 2, 3]`, you can use the syntax `number[]`; this syntax works for any type (e.g. `string[]` is an array of strings, and so on).
You may also see this written as `Array<number>`, which means the same thing.
We'll learn more about the syntax `T<U>` when we cover *generics*.

> Note that `[number]` is a different thing; refer to the section on *tuple types*.

## `any`

TypeScript also has a special type, `any`, that you can use whenever you don't want a particular value to cause typechecking errors.

When a value is of type `any`, you can access any properties of it (which will in turn be of type `any`), call it like a function, assign it to (or from) a value of any type, or pretty much anything else that's syntactically legal:

```ts
let obj: any = { x: 0 };
// None of these lines of code are errors
obj.foo();
obj();
obj.bar = 100;
obj = "hello";
const n: number = obj;
```

The `any` type is useful when you don't want to write out a long type just to convince TypeScript that a particular line of code is okay.

### `noImplicitAny`

When a type isn't specified and can't be inferred from context, TypeScript will typically default to `any`.
Because `any` values don't benefit from type-checking, it's usually desirable to avoid these situations.
The compiler flag `noImplicitAny` will cause any *implicit* `any` to be flagged as an error.

## Type Annotations on Variables

When you declare a variable using `const`, `var`, or `let`, you can optionally add a type annotation to explicitly specify the type of the variable:

```ts
let myName: string = "Alice";
          ^^^^^^^^ Type annotation
```

> TypeScript doesn't use "types on the left"-style declarations like `int x = 0;`
> Type annotations will always go *after* the thing being typed.

In most cases, though, this isn't needed.
Wherever possible, TypeScript tries to automatically *infer* the types in your code.
For example, the type of a variable is inferred based on the type of its initializer:

```ts
// No type annotation needed -- 'myName' inferred as type 'string'
let myName = "Alice";
```

For the most part you don't need to explicitly learn the rules of inference.
If you're starting out, try using fewer type annotations than you think - you might be surprised how few you need for TypeScript to fully understand what's going on.

## Functions

Functions are the primary means of passing data around in JavaScript.
TypeScript allows you to specify the types of both the input and output values of functions.

### Parameter Type Annotations

When you declare a function, you can add type annotations after each parameter to declare what kinds of parameters the function accepts.
Parameter type annotations go after the parameter name:

```ts
// Parameter type annotation
function greet(name: string) {
                   ^^^^^^^^
    console.log("Hello, " + name.toUpperCase() + "!!");
}
```

When a parameter has a type annotation, calls to that function will be validated:

```ts
declare function greet(name: string): void;
//cut
// Would be a runtime error if executed!
greet(42);
```

### Return Type Annotations

You can also add return type annotations.
Return type annotations appear after the parameter list:

```ts
function getFavoriteNumber(): number {
                            ^^^^^^^^
    return 26;
}
```

Much like variable type annotations, you usually don't need a return type annotation because TypeScript will infer the function's return type based on its `return` statements.
The type annotation in the above example doesn't change anything.
Some codebases will explicitly specify a return type for documentation purposes, to prevent accidental changes, or just for personal preference.

### Function Expressions

Function expressions are a little bit different from function declarations.
When a function expression appears in a place where TypeScript can determine how it's going to be called, the parameters of that function are automatically given types.

Here's an example:

```ts
// No type annotations here, but TypeScript can spot the bug
const names = ["Alice", "Bob", "Eve"];
names.forEach(function (s) {
    console.log(s.toUppercase());
});
```

Even though the parameter `s` didn't have a type annotation, TypeScript used the types of the `forEach` function, along with the inferred type of the array, to determine the type `s` will have.

This process is called *contextual typing* because the *context* that the function occurred in informed what type it should have.
Similar to the inference rules, you don't need to explicitly learn how this happens, but understanding that it *does* happen can help you notice when type annotations aren't needed.
Later, we'll see more examples of how the context that a value occurs in can affect its type.

## Object Types

Apart from primitives, the most common sort of type you'll encounter is an *object type*.
This refers to any JavaScript value with properties, which is almost all of them!
To define an object type, we simply list its properties and their types.

For example, here's a function that takes a point-like object:

```ts
// The parameter's type annotation is an object type
function printCoord(pt: { x: number, y: number }) {
                        ^^^^^^^^^^^^^^^^^^^^^^^^
  console.log("The coordinate's x value is " + pt.x);
  console.log("The coordinate's y value is " + pt.y);
}
printCoord({ x: 3, y: 7 });
```

Here, we annotated the parameter with a type with two properties - `x` and `y` - which are both of type `number`.
You can use `,` or `;` to separate the properties, and the last separator is optional either way.

The type part of each property is also optional.
If you don't specify a type, it will be assumed to be `any`.

### Optional Properties

Object types can also specify that some or all of their properties are *optional*.
To do this, add a `?` after the property name:

```ts
function printName(obj: { first: string, last?: string}) {
  // ...
}
// Both OK
printName({ first: "Bob" });
printName({ first: "Alice", last: "Alisson" });
```

In JavaScript, if you access a property that doesn't exist, you'll get the value `undefined` rather than a runtime error.
Because of this, when you *read* from an optional property, you'll have to check for `undefined` before using it.

```ts
function printName(obj: { first: string, last?: string}) {
  // Error - might crash if 'obj.last' wasn't provided!
  console.log(obj.last.toUpperCase());
  if (obj.last !== undefined) {
    // OK
    console.log(obj.last.toUpperCase());
  }
}
```

## Union Types

TypeScript's type system allows you to build new types out of existing ones using a large variety of operators.
Now that we know how to write a few types, it's time to start *combining* them in interesting ways.

### Defining a Union Type

The first way to combine types you might see is a *union* type.
A union type is type formed from two or more other types, representing values that may be *any one* of those types.
We refer to each of these types as the union's *members*.

Let's write a function that can operate on strings or numbers:

```ts
function printId(id: number | string) {
  console.log("Your ID is: " + id);
}
// OK
printId(101);
// OK
printId("202");
// Error
printId([1, 2]);
```

### Working with Union Types

It's easy to *provide* a value matching a union type - simply provide a type matching any of the union's members.
If you *have* a value of a union type, how do you work with it?

TypeScript will only allow you to do things with the union if that thing is valid for *every* member of the union.
For example, if you have the union `string | number`, you can't use methods that are only available on `string`:

```ts
function printId(id: number | string) {
  console.log(id.toUpperCase());
}
```

The solution is to *narrow* the union with code, the same as you would in JavaScript without type annotations.
*Narrowing* occurs when TypeScript can deduce a more specific type for a value based on the structure of the code.

For example, TypeScript knows that only a `string` value will have a `typeof` value `"string"`:

```ts
function printId(id: number | string) {
  if (typeof id === "string") {
    // In this branch, id is of type 'string'
    console.log(id.toUpperCase());
  } else {
    // Here, id is of type 'number'
    console.log(id);
  }
}
```

Another example is to use a function like `Array.isArray`:

```ts
function welcomePeople(x: string[] | string) {
  if (Array.isArray(x)) {
    // Here: 'x' is 'string[]'
    console.log("Hello, " + x.join(" and "));
  } else {
    // Here: 'x' is 'string'
    console.log("Welcome lone traveler " + x);
  }
}
```

Notice that in the `else` branch, we don't need to do anything special - if `x` wasn't a `string[]`, then it must have been a `string`.

Sometimes you'll have a union where all the members have something in common.
For example, both arrays and strings have a `slice` method.
If every member in a union has a property in common, you can use that property without narrowing:

```ts
// Return type is inferred as number[] | string
function getFirstThree(x: number[] | string) {
  return x.slice(0, 3);
}
```

> It might be confusing that a *union* of types appears to have the *intersection* of those types' properties.
> This is not an accident - the name *union* comes from type theory.
> The *union* `number | string` is composed by taking the union *of the values* from each type.
> Notice that given two sets with corresponding facts about each set, only the *intersection* of those facts applies to the *union* of the sets themselves.
> For example, if we had a room of tall people wearing hats, and another room of Spanish speakers wearings hats, after combining those rooms, the only thing we know about *every* person is that they must be wearing a hat.

## Type Aliases

We've been using object types and union types by writing them directly in type annotations.
This is convenient, but it's common to want to use the same type more than once and refer to it by a single name.

A *type alias* is exactly that - a *name* for any *type*.
The syntax for a type alias is:

```ts
type Point = {
  x: number,
  y: number
};

// Exactly the same as the earlier example
function printCoord(pt: Point) {
  console.log("The coordinate's x value is " + pt.x);
  console.log("The coordinate's y value is " + pt.y);
}

printCoord({ x: 100, y: 100 });
```

You can actually use a type alias to give a name to any type at all, not just an object type.
For example, a type alias can name a union type:

```ts
type ID = number | string;
```

Note that aliases are *only* aliases - you cannot use type aliases to create different/distinct "versions" of the same type.
When you use the alias, it's exactly as if you had written the aliased type.
In other words, this code might *look* illegal, but is OK according to TypeScript because both types are aliases for the same type:

```ts
type Age = number;
type Weight = number;

const myAge: Age = 73;
// *not* an error
const myWeight: Weight = myAge;
```

## Interfaces {#interfaces}

An *interface declaration* is another way to name an object type:

```ts
interface Point {
  x: number;
  y: number;
}

function printCoord(pt: Point) {
  console.log("The coordinate's x value is " + pt.x);
  console.log("The coordinate's y value is " + pt.y);
}

printCoord({ x: 100, y: 100 });
```

Just like when we used a type alias above, the example works just as if we had used an anonymous object type.
TypeScript is only concerned with the *structure* of the value we passed to `printCoord` - it only cares that it has the expected properties.
Being concerned only with the structure and capabilities of types is why we call TypeScript a *structurally typed* type system.

### Differences Between Type Aliases and Interfaces {#interface-vs-alias}

Type aliases and interfaces are very similar, and in many cases you can choose between them freely.
Here are the most relevant differences between the two that you should be aware of.
You'll learn more about these concepts in later chapters, so don't worry if you don't understand all of these right away.

* Interfaces may be `extend`ed, but not type aliases. We'll discuss this later, but it means that interfaces can provide more guarantees when creating new types out of other types.
* Type aliases may not participate in declaration merging, but interfaces can.
* Interfaces may only be used to declare object types.
* Interface names will *always* appear in their original form in error messages, but *only* when they are used by name.
* Type alias names *may* appear in error messages, sometimes in place of the equivalent anonymous type (which may or may not be desirable).

For the most part, you can choose based on personal preference, and TypeScript will tell you if it needs something to be the other kind of declaration.

## Type Assertions

Sometimes you will have information about the type of a value that TypeScript can't know about.

For example, if you're using `document.getElementById`, TypeScript only knows that this will return *some* kind of `HTMLElement`, but you might know that your page will always have an `HTMLCanvasElement` with a given ID.

In this situation, you can use a *type assertion* to specify a more specific type:

```ts
const myCanvas = document.getElementById("main_canvas") as HTMLCanvasElement;
```

Like a type annotation, type assertions are removed by the compiler and won't affect the runtime behavior of your code.

You can also use the angle-bracket syntax (except if the code is in a `.tsx` file), which is equivalent:

```ts
const myCanvas = <HTMLCanvasElement>document.getElementById("main_canvas");
```

> Reminder: Because they are removed at compile-time, there is no runtime checking associated with a type assertion.
> There won't be an exception or `null` generated if the type assertion is wrong.

TypeScript only allows type assertions which convert to a *more specific* or *less specific* version of a type.
This rule prevents "impossible" coercions like:

```ts
const x = "hello" as number;
```

Sometimes this rule can be too conservative and will disallow more complex coercions that might be valid.
If this happens, you can use two assertions, first to `any` (or `unknown`, which we'll introduce later), then to the desired type:

```ts
declare const expr: any;
type T = any;
//cut
const a = expr as any as T;
```

## Literal Types

In addition to the general types `string` and `number`, we can refer to *specific* strings and numbers in type positions.

By themselves, literal types aren't very valuable:

```ts
let x: "hello" = "hello";
// OK
x = "hello";
// OK
x = "hello";
// ...
x = "howdy";
```

It's not much use to have a variable that can only have one value!

But by *combining* literals into unions, you can express a much more useful thing - for example, functions that only accept a certain set of known values:

```ts
function printText(s: string, alignment: "left" | "right" | "center") {
  // ...
}
printText("Hello, world", "left");
printText("G'day, mate", "centre");
```

Numeric literal types work the same way:

```ts
function compare(a: string, b: string): -1 | 0 | 1 {
  return a === b ? 0 : a > b ? 1 : -1;
}
```

Of course, you can combine these with non-literal types:

```ts
interface Options {
  width: number;
}
function configure(x: Options | "auto") {
  // ...
}
configure({ width: 100 });
configure("auto");
configure("automatic");
```

There's one more kind of literal type: boolean literals.
There are only two boolean literal types, and as you might guess, they are the types `true` and `false`.
The type `boolean` itself is actually just an alias for the union `true | false`.

### Literal Inference

When you initialize a variable with an object, TypeScript assumes that the properties of that object might change values later.
For example, if you wrote code like this:

```ts
declare const someCondition: boolean;
//cut
const obj = { counter: 0 };
if (someCondition) {
  obj.counter = 1;
}
```

TypeScript doesn't assume the assignment of `1` to a field that previously had `0` to be an error.
Another way of saying this is that `obj.counter` must have the type `number`, not `0`, because types are used to determine both *reading* and *writing* behavior.

The same applies to strings:

```ts
declare function handleRequest(url: string, method: "GET" | "POST"): void;
//cut
const req = { url: "https://example.com", method: "GET" };
handleRequest(req.url, req.method);
```

<!-- TODO: Use and explain const contexts -->

Because it'd be legal to assign a string like `"GUESS"` TO `req.method`, TypeScript considers this code to have an error.
You can change this inference by adding a type assertion in either location:

```ts
declare function handleRequest(url: string, method: "GET" | "POST"): void;
//cut
const req = { url: "https://example.com", method: "GET" as "GET" };
/* or */
handleRequest(req.url, req.method as "GET");
```

The first change means "I intend for `req.method` to always have the *literal type* `"GET"`", preventing the possible assignment of `"GUESS"` to that field.
The second change means "I know for other reasons that `req.method` has the value `"GET"`".

## `null` and `undefined`

JavaScript has two primitive values, `null` and `undefined`, both of which are used to signal absent or uninitialized values.

TypeScript has two corresponding *types* by the same names. How these types behave depends on whether you have the `strictNullChecks` option on.

### `strictNullChecks` off

With `strictNullChecks` *off*, values that might be `null` or `undefined` can still be accessed normally, and the values `null` and `undefined` can be assigned to a property of any type.
This is similar to how languages without null checks (e.g. C#, Java) behave.
The lack of checking for these values tends to be a major source of bugs; we always recommend people turn `strictNullChecks` on if it's practical to do so in their codebase.

### `strictNullChecks` on

With `strictNullChecks` *on*, when a value is `null` or `undefined`, you will need to test for those values before using methods or properties on that value.
Just like checking for `undefined` before using an optional property, we can use *narrowing* to check for values that might be `null`:

```ts
function doSomething(x: string | null) {
  if (x === null) {
    // do nothing
  } else {
    console.log("Hello, " + x.toUpperCase());
  }
}
```

### Non-null Assertion Operator (Postfix `!`) {#non-null-operator}

TypeScript also has a special syntax for removing `null` and `undefined` from a type without doing any explicit checking.
Writing `!` after any expression is effectively a type assertion that the value isn't `null` or `undefined`:

```ts
function liveDangerously(x?: number | null) {
  // No error
  console.log(x!.toFixed());
}
```

Just like other type assertions, this doesn't change the runtime behavior of your code, so it's important to only use `!` when you know that the value *can't* be `null` or `undefined`.
