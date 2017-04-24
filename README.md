# AspecTS
An AOP library implemented in TypeScript

### Supported aspects:

1. [BoundaryAspect](#boundary)
2. [SurroundAspect](#surround)
3. [ErrorAspect](#error)

### Examples:

#### 1. BounaryAspect:<a id="boundary"></a>

The `BoundaryAspect` class provides method for intercepting the places of entry and exit of functions.
Classes inheriting from `BoundaryAspect` can provide custom iplementations to `onEntry` and/or `onExit`.
`onEntry` recieves the decorated function's arguments and must. Its return value is passed as argument(s) to the decorated function.
`onExit` reieves the decorated function's return value. Its return value will be returned to the caller of the decorated method.

```typescript
import { aspect, BoundaryAspect } from "./aspect";

class TestAspect extends BoundaryAspect {
    onEntry(...args) {
        console.log("On Entry.");
        return args;
    }

    onExit(returnValue) {
        console.log("On Exit.");
        return returnValue;
    }
}

class Test {
    @aspect(new TestAspect())
    ala(test) {
        console.log(test);
        return "In ala.";
    }
}

let test = new Test();
console.log(test.ala(1));
```

#### Result:

```
On Entry.
10
On Exit.
In ala.5
```
