export enum Target {
    InstanceMethods = 1,
    InstanceAccessors = 1 << 1,
    StaticMethods = 1 << 2,
    StaticAccessors = 1 << 3
}

export interface AspectBase {
    overload(func: (...args) => any): (...args) => any;
}

export abstract class BoundaryAspect implements AspectBase {
    abstract onEntry(...args): any[]

    abstract onExit(returnValue): any

    overload(func: (...args) => any): (...args) => any {
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

    overload(func: (...args) => any): (...args) => any {
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

    overload(func: (...args) => any): (...args) => any {
        let onInvoke = this.onInvoke.bind(this);
        return function (...args) {
            return onInvoke(func).apply(this, args);
        };
    }
}

export function aspect(aspectObject: AspectBase, targetFlags: number = Target.InstanceAccessors | Target.InstanceMethods | Target.StaticMethods | Target.StaticAccessors) {
    return function (...args) {
        if (args.length === 1) {
            classAspect.call(this, ...args, aspectObject, targetFlags);
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

function classAspect(target: Function, aspectObject: AspectBase, targetFlags: number) {
    let instanceDescriptors = getDescriptors(target.prototype, aspectObject)
    let staticDescriptors = getDescriptors(target, aspectObject);
    instanceDescriptors.forEach(({ key, descriptor }) => {
        if ((targetFlags & Target.InstanceAccessors) && (descriptor.get || descriptor.set)) {
            decorateAccessor(target.prototype, key, descriptor, aspectObject);
        }

        if ((targetFlags & Target.InstanceMethods) && typeof descriptor.value == "function") {
            decorateProperty(target.prototype, key, descriptor, aspectObject);
        }
    });

    staticDescriptors.forEach(({ key, descriptor }) => {
        if ((targetFlags & Target.StaticAccessors) && (descriptor.get || descriptor.set)) {
            decorateAccessor(target, key, descriptor, aspectObject);
        }

        if ((targetFlags & Target.StaticMethods) && typeof descriptor.value == "function") {
            decorateProperty(target, key, descriptor, aspectObject);
        }
    });
}

function decorateAccessor(target: Function, key: string, descriptor: PropertyDescriptor, aspectObject: AspectBase) {
    Object.defineProperty(target, key, {
        get: descriptor.get ? aspectObject.overload(descriptor.get) : undefined,
        set: descriptor.set ? aspectObject.overload(descriptor.set) : undefined,
        enumerable: descriptor.enumerable,
        configurable: descriptor.configurable,
    });
}

function decorateProperty(target: Function, key: string, descriptor: PropertyDescriptor, aspectObject: AspectBase) {
    Object.defineProperty(target, key, {
        value: aspectObject.overload(descriptor.value),
        enumerable: descriptor.enumerable,
        configurable: descriptor.configurable,
    });
}

function getDescriptors(target: any, aspectObject: AspectBase) {
    return Object.getOwnPropertyNames(target)
        .filter(key => key !== "constructor")
        .map(key => ({ key: key, descriptor: Object.getOwnPropertyDescriptor(target, key) }))
}

function functionAspect(target: Function, key: string | symbol, descriptor: PropertyDescriptor, aspectObject: AspectBase) {
    if (descriptor.get || descriptor.set) {
        descriptor.get = descriptor.get ? aspectObject.overload(descriptor.get) : undefined;
        descriptor.set = descriptor.set ? aspectObject.overload(descriptor.set) : undefined;
    }
    else if (descriptor.value) {
        descriptor.value =  aspectObject.overload(descriptor.value);
    }
    return descriptor;
}