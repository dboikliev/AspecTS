import {
    aspect,
    ErrorAspect,
    BoundaryAspect,
    Target,
    surround,
    boundary,
    error
} from "./aspect";

class BaseLogger {
    protected _logger: { log: (...args: any[]) => void };

    constructor() {
        this._logger = console;
    }
}

class LoggerAspect extends error(surround(boundary(BaseLogger))) {
    onError(e: Error) {
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

    onInvoke(func: Function) {
        let logger = this._logger;
        return function (...args) {
            logger.log("INVOKE BEGIN");
            let result = func.apply(this, args);
            logger.log("INVOKE END");
            return result;
        };
    }
}


@aspect(new LoggerAspect(), Target.All)
class TestClass {
    private _testField: number;
    private static _testStaticField: number;

    constructor () {
        // throw Error("Test error.");
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
instance.instanceMethod(1);
console.log("-".repeat(20));
TestClass.staticMethod(1);
