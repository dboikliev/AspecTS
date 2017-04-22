import { aspect, BoundaryAspect, ErrorAspect } from "./aspect";

class TestAspect extends BoundaryAspect {
    onEntry(...args) {
        console.log("On Entry.");
        args[0] = 10;
        return args;
    }

    onExit(returnValue) {
        console.log("On Exit.");
        return returnValue - 5;
    }
}

class ErrorLogger extends ErrorAspect {
    onError(error: Error) {
        console.log(`Logged error: ${error.message}`);
    }
}

class Test {
    someVal = 5;

    @aspect(TestAspect)
    @aspect(TestAspect)
    do(arg) {
        return "wat";
    }
}
console.log(new Test().do(1));