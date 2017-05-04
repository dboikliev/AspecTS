import {
    aspect,
    ErrorAspect,
    BoundaryAspect,
    Target
} from "./aspect";

class TestBoundary extends BoundaryAspect {
    onError() {
        console.log("On error.");
    }

    onEntry(...args) {
        console.log("dasdasda");
        return args;
    }

    onExit(returnValue) {
        return returnValue;
    }
}

@aspect(new TestBoundary())
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
console.log(TestClass.staticMethod(1));
console.log(instance.instanceMethod(1));