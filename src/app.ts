import { 
    aspect,
    BoundaryAspect

} from "./aspect";

class TestBoundary extends BoundaryAspect {
    onEntry(...args) {
        console.log("dasdasda");
        return args;
    }

    onExit(returnValue) {
        return returnValue;
    }
}



@aspect(new TestBoundary())
class Test {
    someVale = 15;

    constructor() {
        console.log(this.someVale);
    }

    @aspect(new TestBoundary())
    test(...args) {
        return 1;
    }
}
let test = new Test();
console.log(test.test(1));
