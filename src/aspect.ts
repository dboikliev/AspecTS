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
        return (...args) => {
            let passThroughArgs = this.onEntry(...args);
            let returnValue = func(...passThroughArgs);
            let passThroughReturnValue = this.onExit(returnValue);
            return passThroughReturnValue;
        };
    }
}

export abstract class ErrorAspect implements AspectBase {
    abstract onError(error: any);

    overload(func: Function): Function {
        return (...args) => {
            try
            {
                return func(args);
            }
            catch (e)
            {
                this.onError(e);
            }
        };
    }
}

export function aspect(type: Function) {
    return function (...args) {
        if (args.length === 1) {
            classAspect.call(this, ...args, type);
        }
        else if (args.length === 2) {
            throw Error("Cannot use aspect on properties.");
        }
        else if (args.length === 3) {
            if (args[2] === "number") {
                throw Error("Cannot use aspect on parameters.");
            }
            functionAspect.call(this, ...args, type);
        }
        else {
            throw Error("Cannot use aspect here.");
        }
    };
}

function classAspect(target: Function, type: Aspect) {
    for (let key in target.prototype) {
        if (target.prototype[key] instanceof Function) {
            let original = target.prototype[key];
            let aspectObject: AspectBase = new type();
            target.prototype[key] =  aspectObject.overload(original);
        }
    }
}

function functionAspect(target: Function, key: string | symbol, descriptor: PropertyDescriptor, type: Aspect) {
    let original = descriptor.value;
    let aspectObject = new type();
    descriptor.value = aspectObject.overload(original);
    return descriptor;
}