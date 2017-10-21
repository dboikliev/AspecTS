import {
    aspect,
    ErrorAspect,
    BoundaryAspect,
    SurroundAspect,
    Target,
    surround,
    boundary,
    error
} from "./aspect";

class TestAspect extends SurroundAspect {
    onInvoke(func: Function): Function {
        return function (...args) {
            let result = func.apply(this, args);
            return result;
        }
    }
}

@aspect(new TestAspect())
class TestSubject {
    testMethod() {
    }
}  

let test = new TestSubject();
test.testMethod();