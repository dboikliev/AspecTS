"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
require("mocha");
const assert = require("assert");
const aspect_1 = require("./../src/aspect");
describe("error aspect tests", () => {
    it("should call onError when method throws", () => {
        let isOnErrorCalled = false;
        class TestAspect extends aspect_1.ErrorAspect {
            onError() {
                isOnErrorCalled = true;
            }
        }
        let TestSubject = class TestSubject {
            testMethod() {
                throw Error();
            }
        };
        TestSubject = __decorate([
            aspect_1.aspect(new TestAspect())
        ], TestSubject);
        (new TestSubject()).testMethod();
        assert.equal(isOnErrorCalled, true);
    });
    it("should recieve thrown object on onError when method throws", () => {
        let received = false;
        class TestAspect extends aspect_1.ErrorAspect {
            onError(...args) {
                received = args.length > 0;
            }
        }
        let TestSubject = class TestSubject {
            testMethod() {
                throw Error();
            }
        };
        TestSubject = __decorate([
            aspect_1.aspect(new TestAspect())
        ], TestSubject);
        (new TestSubject()).testMethod();
        assert.equal(received, true);
    });
});
describe("boundary aspect tests", () => {
    it("should call onEntry and onExit when method is called", () => {
        let [isOnEntryCalled, isOnExitCalled] = [false, false];
        console.log(isOnEntryCalled, isOnExitCalled);
        class TestAspect extends aspect_1.BoundaryAspect {
            onEntry(...args) {
                isOnEntryCalled = true;
                return args;
            }
            onExit(returnValue) {
                isOnExitCalled = true;
                return returnValue;
            }
        }
        let TestSubject = class TestSubject {
            testMethod(...args) {
                return args;
            }
        };
        TestSubject = __decorate([
            aspect_1.aspect(new TestAspect())
        ], TestSubject);
        (new TestSubject()).testMethod();
        assert.equal(isOnEntryCalled && isOnExitCalled, true);
    });
    it("should recieve arguments in onEntry and returnValue in onExit", () => {
        let originalArguments = [1, 2, 3], receivedArguments, originalReturnValue = "some value", receivedReturnValue;
        class TestAspect extends aspect_1.BoundaryAspect {
            onEntry(...args) {
                console.log(args);
                receivedArguments = args;
                return args;
            }
            onExit(returnValue) {
                receivedReturnValue = returnValue;
                return returnValue;
            }
        }
        let TestSubject = class TestSubject {
            testMethod(...args) {
                return originalReturnValue;
            }
        };
        TestSubject = __decorate([
            aspect_1.aspect(new TestAspect())
        ], TestSubject);
        (new TestSubject()).testMethod(...originalArguments);
        assert.deepStrictEqual(originalArguments, receivedArguments);
        assert.deepStrictEqual(originalReturnValue, receivedReturnValue);
    });
});
//# sourceMappingURL=test.js.map