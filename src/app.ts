import {
    aspect,
    ErrorAspect,
    BoundaryAspect,
    Target,
    surround,
    boundary,
    error
} from "./aspect";

class SomeBase {
}

class Bla extends error(surround(boundary(SomeBase))) {
    onError(e) {
        console.log("Error: " + e.message);
    }

    onEntry(...args) {
        // console.log(args);
        return args;
    }

    onExit(returnValue) {
        // console.log(returnValue);
        return returnValue;
    }

    onInvoke(func) {
        return function (...args) {
            console.log("you've been");
            // console.log(func.toString());
            let result = func.apply(this, args);
            console.log("surrounded");
            return result;
        };
    }
}

@aspect(new Bla())
class TestClass {
    private _testField: number;
    private static _testStaticField: number;

    constructor(...args) {
        console.log("In ctor");
    }

    get instanceAccessor() {
        return this._testField;
    }

    set instanceAccessor(value) {
        this._testField = value;
    }

    @aspect(new Bla())
    instanceMethod(testParameter: number) {
        return testParameter;
    }

    static staticMethod(testParameter: number) {
        return testParameter;
    }

    static get staticField() {
        return this._testStaticField;
    }

    static set staticField(value) {
        this._testStaticField = value;
    }
}


let instance = new TestClass();
instance.instanceMethod(1);
console.log(TestClass.staticMethod(1));
console.log(instance.instanceMethod(1));
