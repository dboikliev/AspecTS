type Aspect = { new(...args): AspectBase };

export class AspectBase {
    onEntry(...args) {
        return args;
    }

    onExit(returnValue) {
        return returnValue;
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
            let aspectObject = new type();
            target.prototype[key] =  overloadFunction(aspectObject, original);
        }
    }
}

function functionAspect(target: Function, key: string | symbol, descriptor: PropertyDescriptor, type: Aspect) {
    let original = descriptor.value;
    let aspectObject = new type();
    descriptor.value = overloadFunction(aspectObject, original);
    return descriptor;
}

function overloadFunction(aspect: AspectBase, original: Function) {
    return function(...args) {
        let passThroughArgs = aspect.onEntry(...args);
        let returnValue = original(...passThroughArgs);
        let passThroughReturnValue = aspect.onExit(returnValue);
        return passThroughReturnValue;
    };
} 