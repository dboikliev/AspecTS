"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const aspect_1 = require("./aspect");
class BaseLogger {
    constructor() {
        this._logger = console;
    }
}
class LoggerAspect extends aspect_1.error(aspect_1.surround(aspect_1.boundary(BaseLogger))) {
    onError(e) {
        this._logger.log("ERROR: " + e.message);
    }
    onEntry(...args) {
        this._logger.log("ENTRY: " + args.join(","));
        return args;
    }
    onExit(returnValue) {
        this._logger.log("EXIT: " + returnValue);
        return returnValue;
    }
    onInvoke(func) {
        let logger = this._logger;
        return function (...args) {
            logger.log("INVOKE BEGIN");
            let result = func.apply(this, args);
            logger.log("INVOKE END");
            return result;
        };
    }
}
let TestClass = class TestClass {
    constructor() {
        // throw Error("Test error.");
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
    aspect_1.aspect(new LoggerAspect(), aspect_1.Target.All)
], TestClass);
let instance = new TestClass();
instance.instanceMethod(1);
console.log("-".repeat(20));
TestClass.staticMethod(1);
//# sourceMappingURL=app.js.map