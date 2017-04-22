import { aspect, BoundaryAspect } from "./aspect";

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

class Test {
    @aspect(new TestAspect())
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