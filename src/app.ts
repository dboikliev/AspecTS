import { aspect, BoundaryAspect, ErrorAspect, SurroundAspect } from "./aspect";

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

class LoggerAspect extends ErrorAspect {
    onError(error) {
        console.log(error.message);
    }
}

class Surround extends SurroundAspect {
    onInvoke(func: Function): Function {
        return function (...args) {
            console.log("YOU ARE");
            func.apply(this, args);
            console.log("SURROUNDED");
        };
    }
}

@aspect(new TestAspect())
class Test {
    someVal = 5;

    @aspect(new LoggerAspect())
    @aspect(new Surround())
    ala(test) {
        console.log(this.someVal);
    }

    bala() {
        console.log("In bala.");
    }
}

let test = new Test();
console.log(test.ala(1));