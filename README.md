# AspecTS

[![Build Status](https://travis-ci.org/dboikliev/AspecTS.svg?branch=master)](https://travis-ci.org/dboikliev/AspecTS)

An [aspect-oriented programming](https://en.wikipedia.org/wiki/Aspect-oriented_programming) library implemented in TypeScript

## Supported aspects:

### Basic aspects:

* [BoundaryAspect](#boundary)
* [SurroundAspect](#surround)
* [ErrorAspect](#error)
* [Aspect mixins](#mixins)

### Advanced aspects:

* [Caching](#caching)
* [Repeating](#repeating)

## Supported targets:

The aspects can be applied on methods or [on the class itself](#target).
When applied on a class the aspect is applied on **all** instance and static members and accessors and on the constructor.
It is possible to choose only specific members using the `Target` enum.

* Instance methods
* Static methods
* Instance accessors
* Static accessors
* Constructor

## Basic Aspects Examples:

#### BoundaryAspect:<a id="boundary"></a>

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

####  SurroundAspect:<a id="surround"></a>

The `SurroundAspect` class provides a method for intercepting a function invocation.
`onInvoke` function recieves as paramerameter the decorated function and returns a new function.
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

#### ErrorAspect:<a id="error"></a>

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

#### Aspect mixins:<a id="mixins"></a>

The `surround`, `boundary`, `error` methods allow the creation of a new aspect by combining joint points of `SurroundAspect`, `BoundaryAspect` and `ErrorAspect`.

```typescript
import {
    aspect,
    ErrorAspect,
    BoundaryAspect,
    Target,
    surround,
    boundary,
    error
} from "./aspect";

class BaseLogger {
    protected _logger: { log: (...args: any[]) => void };

    constructor() {
        this._logger = console;
    }
}

class LoggerAspect extends error(surround(boundary(BaseLogger))) {
    onError(e: Error) {
        this._logger.log("ERROR: " + e.message);
    }

    onEntry(...args) {
        this._logger.log("ENTRY: " + args);
        return args;
    }

    onExit(returnValue) {
        this._logger.log("EXIT: " + returnValue);
        return returnValue;
    }

    onInvoke(func: Function) {
        let logger = this._logger;
        return function (...args) {
            logger.log("INVOKE BEGIN");
            let result = func.apply(this, args);
            logger.log("INVOKE END");
            return result;
        };
    }
}


@aspect(new LoggerAspect(), Target.All ^ Target.Constructor)
class TestClass {
    private _testField: number;
    private static _testStaticField: number;

    get instanceAccessor() {
        return this._testField;
    }

    set instanceAccessor(value) {
        this._testField = value;
    }

    instanceMethod(testParameter: number) {
        throw Error("Test error.");
        return testParameter;
    }

    static staticMethod(testParameter: number) {
        return testParameter;
    }

    static get staticAccessor() {
        return this._testStaticField;
    }

    static set staticAccessor(value) {
        this._testStaticField = value;
    }
}


let instance = new TestClass();
instance.instanceMethod(1);
console.log("-".repeat(20));
TestClass.staticMethod(1);
```

#### Result:

```
INVOKE BEGIN
ENTRY: 1
ERROR: Test error.
--------------------
INVOKE BEGIN
ENTRY: 1
EXIT: 1
INVOKE END
```


#### Target:<a id="target"></a>

Target is a bit flags enum which contains the possible targets for an aspect.
Targets can be combined with the bitwise-or operator ( | ).

```typescript
@aspect(new TestBoundary(), 
    Target.InstanceAccessors | 
    Target.InstanceMethods | 
    Target.StaticMethods | 
    Target.StaticAccessors)
class TestClass {
    private _testField: number;
    private static _testStaticField: number;

    get instanceAccessor() {
        return this._testField;
    }

    set instanceAccessor(value) {
        this._testField = value;
    }

    instanceMethod(testParameter: number) {
        return testParameter;
    }

    static staticMethod(testParameter: number) {
        return testParameter;
    }

    static get staticField() {
        return this._testStaticField;
    }

    static set staticField(value) {
        this._testStaticField = value;
    }
}
```

## Advanced Aspects Examples:

You can use the basic types of aspects to build more complex solutions like caching, logging etc.

#### Caching:<a id="caching"></a>

The `cache` and `invalidateCache` functions are supposed to be used on methods. Both functions expenct and instance of a caching service - the cache wich will hold the data. The cache functions also exptects a `keyIndex` - the index of the method argument which will be used as a key in the cache and an optional `period` parameter - the time in milliseconds after which the cache will expire. Calling a method marked with the `invalidateCache` decorator will cause the cache at the specified index to be removed. 

#### Example:

```typescript
import { cache, invalidateCache, MemoryCache } from "./caching"

const cachingService = new MemoryCache<User>();

class UserService {
    @cache(cachingService, 0, 1000)
    getUserById(id: number): User {
        console.log("In get user by id");
        return {
            name: "Ivan",
            age: 21
        }
    }

    @invalidateCache(cachingService, 0)
    setUserById(id: number, user: User) {
        
    }
}

interface User {
    name: string,
    age: number
}

const us = new UserService()
const first = us.getUserById(1)

us.setUserById(1, {
    name: "bla",
    age: 23
})

const second = us.getUserById(1);
console.log(first == second) //false - cache was invalidated by set method

const third = us.getUserById(1);
console.log(second == third) //true - result was cached during previous call 

setTimeout(() => {
    const fourth = us.getUserById(1)
    console.log(third == fourth) //false - cache expired
}, 2000)
```

#### Repeating:<a id="repeating"></a>

The `repeatOnError` aspect allos code to be executed a maximumg of `count` times with delays between calls of `interval` milliseconds. The repeater can be set to block until all repetitions are over by setting the `wait` parameter to `true`.

#### Example:

```typescript
import { cache, invalidateCache, MemoryCache } from "./cache"
import { repeatOnError } from "./repeat";

const cachingService = new MemoryCache<User>();

class UserService {
    private count: number = 3;

    @cache(cachingService, 0, 1000)
    @repeatOnError(5, 100, true)    
    getUserById(id: number): User {
        console.log("In get user by id");
        if (this.count > 0) {
            this.count--;
            throw Error("Err");
        }

        return {
            name: "Ivan",
            age: 21
        };
    }
}

interface User {
    name: string,
    age: number
}

const us = new UserService()
let user = us.getUserById(1)
console.log(user)
```

#### Output:

```
In get user by id
In get user by id
In get user by id
In get user by id

Object {name: "Ivan", age: 21}
```