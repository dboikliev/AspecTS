# AspecTS
An AOP library implemented in TypeScript

### Example:

```typescript
import { aspect, AspectBase } from "./aspect";

class TestAspect extends AspectBase {
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
    @aspect(TestAspect)
    ala(test) {
        console.log(test);
        return "In ala.";
    }

    bala() {
        console.log("In bala.");
    }
}

let test = new Test();
console.log(test.ala(1));
```

### Result:

```
On Entry.
10
On Exit.
In ala.5
```
