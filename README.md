# AspecTS
[![Build Status](https://travis-ci.org/dboikliev/AspecTS.svg?branch=master)](https://travis-ci.org/dboikliev/AspecTS)

An [aspect-oriented programming](https://en.wikipedia.org/wiki/Aspect-oriented_programming) library implemented in TypeScript

## Supported aspects:

1. [BoundaryAspect](#boundary)
2. [SurroundAspect](#surround)
3. [ErrorAspect](#error)

## Examples:

#### 1. BounaryAspect:<a id="boundary"></a>

The `BoundaryAspect` class provides method for intercepting the places of entry and exit of functions.
Classes inheriting from `BoundaryAspect` can provide custom iplementations to `onEntry` and/or `onExit`.
`onEntry` recieves the decorated function's arguments. Its return value is passed as argument(s) to the decorated function.
`onExit` reieves the decorated function's return value. Its return value will be returned to the caller of the decorated method.
This aspect is most suitable when you want to perform some action specifically on function entry and/or exit.

```typescript
import { aspect, BoundaryAspect } from "./aspect";

class TestBoundaryAspect extends BoundaryAspect {
    onEntry(...args) {
        console.log("On Entry.");
        args[0] = 10;
        return args;
    }

    onExit(returnValue) {
        console.log("On Exit.");
        return returnValue + 5;
    }
}

class Test {
    @aspect(new TestBoundaryAspect())
    doSomething(argument) {
        console.log("In doSomething.");
        console.log(argument)
        return "doSomething's result.";
    }
}

let test = new Test();
console.log(test.doSomething(1));
```

#### Result:

```
On Entry.
In doSomething.
10
On Exit.
doSomething's result.5
```

####  2. SurroundAspect:<a id="surround"></a>

The `SurroundAspect` class provides a method for intercepting a function invocation.
`onInvoke` function recieves as paramerameter the decoratad function and returns a new function.
This aspect is most suitable for cases where you  want to place code around the method, hence the name.

```typescript
import { aspect, SurroundAspect } from "./aspect";

class TestSurroundAspect extends SurroundAspect {
    onInvoke(func) {
        return function(...args) {
            console.log("You've been");
            let returnValue = func.apply(this, args);
            console.log("surrounded.");
            return returnValue;
        };
    }
}

class Test {
    @aspect(new TestSurroundAspect())
    doSomething(argument) {
        console.log("In doSomething.");
        return "doSomething's result.";
    }
}

let test = new Test();
console.log(test.doSomething(1));
```

#### Result:

```
You've been
In doSomething.
surrounded.
doSomething's result.
```

#### 3. ErrorAspect:<a id="error"></a>

The ErrorAspect provides an `onError` function which is called when the decorated function throws an error.
`onError` receives as argument the caught object which the decorated function has thrown.
This aspect is suitable for implementing loggers and error handlers.

```typescript
import { aspect, ErrorAspect } from "./aspect";

class TestErrorAspect extends ErrorAspect {
    onError(error) {
        console.log("LOGGED ERROR: " + (error.message ? error.message : error));
    }
}

class Test {
    @aspect(new TestErrorAspect())
    doSomething() {
        throw Error("Something went wrong while doing something.");
    }
}

let test = new Test();
test.doSomething();
```

#### Result:

```
LOGGED ERROR: Something went wrong while doing something.
```