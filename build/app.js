"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const aspect_1 = require("./aspect");
class SomeBase {
}
class Bla extends aspect_1.error(aspect_1.surround(aspect_1.boundary(SomeBase))) {
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
class TestClass {
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
__decorate([
    aspect_1.aspect(new Bla())
], TestClass.prototype, "instanceMethod", null);
let instance = new TestClass();
// instance.instanceAccessor = 2;
// console.log(instance.instanceAccessor);
instance.instanceMethod(1);
//# sourceMappingURL=app.js.map