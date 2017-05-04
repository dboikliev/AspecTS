"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
let TestClass = class TestClass {
    constructor(...args) {
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
};
TestClass = __decorate([
    aspect_1.aspect(new TestBoundary())
], TestClass);
let instance = new TestClass();
console.log(TestClass.staticMethod(1));
console.log(instance.instanceMethod(1));
//# sourceMappingURL=app.js.map