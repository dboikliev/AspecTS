import "mocha";
import * as assert from "assert";
import {
    aspect,
    ErrorAspect,
    BoundaryAspect,
    SurroundAspect
} from "./../src/aspect";

describe("error aspect tests", () => {
    it("should call onError when method throws", () => {
        let isOnErrorCalled = false;

        class TestAspect extends ErrorAspect {
            onError() {
                isOnErrorCalled = true;
            }
        }

        @aspect(new TestAspect())
        class TestSubject {
            testMethod() {
                throw Error();
            }
        }

        (new TestSubject()).testMethod();

        assert.equal(isOnErrorCalled, true);
    });

    it("should recieve thrown object on onError when method throws", () => {
        let received = false;

        class TestAspect extends ErrorAspect {
            onError(...args) {
                received = args.length > 0;
            }
        }

        @aspect(new TestAspect())
        class TestSubject {
            testMethod() {
                throw Error();
            }
        }

        (new TestSubject()).testMethod();

        assert.equal(received, true);
    });
});

describe("boundary aspect tests", () => {
    it("should call onEntry and onExit when method is called", () => {
        let [isOnEntryCalled, isOnExitCalled] = [false, false];

        class TestAspect extends BoundaryAspect {
            onEntry(...args) {
                isOnEntryCalled = true;
                return args;
            }

            onExit(returnValue) {
                isOnExitCalled = true;
                return returnValue;
            }
        }

        @aspect(new TestAspect())
        class TestSubject {
            testMethod(...args) {
                return args;
            }
        }

        (new TestSubject()).testMethod();

        assert.equal(isOnEntryCalled && isOnExitCalled, true);
    });

    it("should recieve arguments in onEntry and returnValue in onExit", () => {
        let originalArguments = [1, 2, 3],
            receivedArguments,
            originalReturnValue = "some value",
            receivedReturnValue;


        class TestAspect extends BoundaryAspect {
            onEntry(...args) {
                receivedArguments = args;
                return args;
            }

            onExit(returnValue) {
                receivedReturnValue = returnValue;
                return returnValue;
            }
        }

        @aspect(new TestAspect())
        class TestSubject {
            testMethod(...args) {
                return originalReturnValue;
            }
        }

        (new TestSubject()).testMethod(...originalArguments);

        assert.deepStrictEqual(originalArguments, receivedArguments);
        assert.deepStrictEqual(originalReturnValue, receivedReturnValue);
    });
});

describe("surround aspect tests", () => {
    it("should be executed before and after decorated method", () => {
        let isPreconditionMet = false;
        let isPostconditionMet = false;

        class TestAspect extends SurroundAspect {
            onInvoke(func: Function): Function {
                return function (...args) {
                    isPreconditionMet = true;
                    let result = func.apply(this, args);
                    isPostconditionMet = true;
                    return result;
                }
            }
        }

        @aspect(new TestAspect())
        class TestSubject {
            testMethod() {
            }
        }  
        
        let test = new TestSubject();
        test.testMethod();

        assert(isPreconditionMet, "The precondition is not set.");
        assert(isPostconditionMet, "The postcondition is not set.");
    });
});
