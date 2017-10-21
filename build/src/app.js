"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const aspect_1 = require("./aspect");
class TestAspect extends aspect_1.SurroundAspect {
    onInvoke(func) {
        return function (...args) {
            let result = func.apply(this, args);
            return result;
        };
    }
}
let TestSubject = class TestSubject {
    testMethod() {
    }
};
TestSubject = __decorate([
    aspect_1.aspect(new TestAspect())
], TestSubject);
let test = new TestSubject();
test.testMethod();
//# sourceMappingURL=app.js.map