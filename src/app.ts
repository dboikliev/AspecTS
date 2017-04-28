import { 
    aspect,
    BoundaryAspect,
    Target
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


@aspect(new TestBoundary(), Target.InstanceAccessors | Target.InstanceMethods | Target.StaticMethods | Target.StaticAccessors)
class TestClass {
    private _testField: number;
    private static _testStaticField: number;

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
// instance.instanceAccessor = 2;
// console.log(instance.instanceAccessor);
console.log(TestClass.staticMethod(1));
console.log(instance.instanceMethod(1));