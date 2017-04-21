export abstract class AspectBase {
    onEntry() {
    }

    onExit() {
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

function classAspect(target: Function, type: Function) {
    for (let key in target.prototype) {
        if (target.prototype[key] instanceof Function) {
            let original = target.prototype[key];
            target.prototype[key] = function(...args) {
                type.prototype.onEntry.apply(...args);
                let returnValue = original();
                type.prototype.onExit.apply(null, returnValue);
            };
        }
    }
}

function functionAspect(target: Function, key: string | symbol, descriptor: PropertyDescriptor, type: Function) {
    let original = descriptor.value;
    descriptor.value = function (...args) {
        type.prototype.onEntry.apply(null, args);
        let returnValue = original();
        type.prototype.onExit.apply(null, returnValue);
    };
    return descriptor;
}