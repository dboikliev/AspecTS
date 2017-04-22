import { aspect, BoundaryAspect, ErrorAspect } from "./aspect";

class TestAspect extends BoundaryAspect {
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

class ErrorLogger extends ErrorAspect {
    onError(error: Error) {
        console.log(`Logged error: ${error.message}`);
    }
}

class Test {
    @aspect(ErrorLogger)
    do() {
        throw Error("An error occured while doing something.");
    }
}

new Test().do()