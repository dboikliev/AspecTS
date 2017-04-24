export interface AspectBase {
    overload(func: Function): Function;
}

export abstract class BoundaryAspect implements AspectBase {
    abstract onEntry(...args): any[]

    abstract onExit(returnValue): any

    overload(func: Function): Function {
        let onEntry = this.onEntry.bind(this);
        let onExit = this.onExit.bind(this);

        return function (...args) {
            let passThroughArgs = onEntry(...args);
            let returnValue = func.apply(this, passThroughArgs);
            let passThroughReturnValue = onExit(returnValue);
            return passThroughReturnValue;
        };
    }
}

export abstract class ErrorAspect implements AspectBase {
    abstract onError(error: any);

    overload(func: Function): Function {
        let onError = this.onError.bind(this);
        return function (...args) {
            try {
                return func.apply(this, args);
            }
            catch (e) {
                onError(e);
            }
        };
    }
}

export abstract class SurroundAspect implements AspectBase {
    abstract onInvoke(func: Function): Function;

    overload(func: Function): Function {
        let onInvoke = this.onInvoke.bind(this);
        return function (...args) {
            return onInvoke(func).apply(this, args);
        };
    }
}

export function aspect(aspectObject: AspectBase) {
    return function (...args) {
        if (args.length === 1) {
            classAspect.call(this, ...args, aspectObject);
        }
        else if (args.length === 2) {
            throw Error("Cannot use aspect on properties.");
        }
        else if (args.length === 3) {
            if (args[2] === "number") {
                throw Error("Cannot use aspect on parameters.");
            }
            functionAspect.call(this, ...args, aspectObject);
        }
        else {
            throw Error("Cannot use aspect here.");
        }
    };
}

function classAspect(target: Function, aspectObject: AspectBase) {
    for (let key in target.prototype) {
        if (target.prototype[key] instanceof Function) {
            let original = target.prototype[key];
            target.prototype[key] =  aspectObject.overload(original);
        }
    }
}

function functionAspect(target: Function, key: string | symbol, descriptor: PropertyDescriptor, aspectObject: AspectBase) {
    let original = descriptor.value;
    descriptor.value = aspectObject.overload(original);
    return descriptor;
}