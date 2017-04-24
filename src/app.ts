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