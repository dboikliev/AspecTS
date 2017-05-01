"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const aspect_1 = require("./aspect");
class TestBoundary extends aspect_1.BoundaryAspect {
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
class TestBase {
    constructor() {
        this.a = 5;
    }
    static shit() {
        return "shit";
    }
}
// @aspect(new TestBoundary())
class TestClass extends TestBase {
    constructor(...args) {
        super();
        console.log("In ctor");
    }
    get instanceAccessor() {
        return this._testField;
    }
    set instanceAccessor(value) {
        this._testField = value;
    }
    instanceMethod(testParameter) {
        return testParameter;
    }
    static staticMethod(testParameter) {
        return testParameter;
    }
    static get staticField() {
        return this._testStaticField;
    }
    static set staticField(value) {
        this._testStaticField = value;
    }
}
// let instance = new TestClass();
console.dir(TestClass.prototype);
console.log(TestClass.shit());
// // instance.instanceAccessor = 2;
// // console.log(instance.instanceAccessor);
// console.log(TestClass.shit())
// console.log(TestClass.staticMethod(1));
// console.log(instance.instanceMethod(1));
class A {
}
class B extends A {
}
console.log(B.prototype);
//# sourceMappingURL=app.js.map