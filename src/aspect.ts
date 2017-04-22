type Aspect = { new(...args): AspectBase };

export class Metadata {
    args: any[];
    returnValue: any;
}

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

export function aspect(type: Aspect, ...args) {
    return function (...args) {
        if (args.length === 1) {
            let aspectObject = new type(...args);
            classAspect.call(this, ...args, aspectObject);
        }
        else if (args.length === 2) {
            throw Error("Cannot use aspect on properties.");
        }
        else if (args.length === 3) {
            if (args[2] === "number") {
                throw Error("Cannot use aspect on parameters.");
            }
            let aspectObject = new type(...args);
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
            target.prototype[key] =  aspectObject.overload(original.bind(target.prototype));
        }
    }
}

function functionAspect(target: Function, key: string | symbol, descriptor: PropertyDescriptor, aspectObject: AspectBase) {
    let original = descriptor.value;
    descriptor.value = aspectObject.overload(original);
    return descriptor;
}