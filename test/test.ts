import "mocha";
import * as assert from "assert";
import { aspect, ErrorAspect } from "./../src/aspect";

describe("error aspect tests", () => {
    it("should call onError when method throws", () => {
        let isCalled = false;

        class TestAspect extends ErrorAspect {
            onError() {
                isCalled = true;
            }
        }

        @aspect(new TestAspect())
        class TestSubject {
            testMethod() {
                throw Error();
            }
        }

        (new TestSubject()).testMethod();

        assert.equal(isCalled, true);
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