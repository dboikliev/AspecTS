import { aspect, BoundaryAspect, ErrorAspect, SurroundAspect } from "./aspect";

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