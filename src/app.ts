import { aspect, AspectBase } from "./aspect";

class TestAspect extends AspectBase {
    onEntry() {
        console.log("On Entry.");
    }

    onExit() {
        console.log("On Exit.");
    }
}

class Test {
    @aspect(TestAspect)
    ala() {
        console.log("In ala.");
    }

    bala() {
        console.log("In bala.");
    }
}

let test = new Test();
test.ala();