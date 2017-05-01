declare const Symbol: any;

const overloadKey = typeof Symbol === "function" ? Symbol() : "__overload";

export enum Target {
    InstanceMethods = 1,
    InstanceAccessors = 1 << 1,
    StaticMethods = 1 << 2,
    StaticAccessors = 1 << 3,
    Constructor = 1 << 4,
    InstanceMembers = InstanceMethods | InstanceAccessors,
    StaticMembers = StaticMethods | StaticAccessors
}

export abstract class AspectBase {
    protected [overloadKey](func: (...args) => any): (...args) => any {
        return func;
    }
}

export abstract class BoundaryAspect implements AspectBase {
    abstract onEntry(...args): any[]

    abstract onExit(returnValue): any

    [overloadKey](func: (...args) => any): (...args) => any {
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

    [overloadKey](func: (...args) => any): (...args) => any {
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

    [overloadKey](func: (...args) => any): (...args) => any {
        let onInvoke = this.onInvoke.bind(this);
        return function (...args) {
            return onInvoke(func).apply(this, args);
        };
    }
}

export function aspect(aspectObject: AspectBase, targetFlags: number = Target.Constructor | Target.InstanceAccessors | Target.InstanceMethods | Target.StaticMethods | Target.StaticAccessors) {
    return function (...args) {
        switch (args.length) {
            case 1:
                classAspect.call(this, ...args, aspectObject, targetFlags);
                if (targetFlags & Target.Constructor) {
                    return constructorAspect.call(this, ...args, aspectObject);
                }
                break;
            case 2:
                throw Error("Cannot use aspect on properties.");
            case 3:
                if (args[2] === "number") {
                    throw Error("Cannot use aspect on parameters.");
                }
                functionAspect.call(this, ...args, aspectObject);
                break;
            default:
                throw Error("Cannot use aspect here.");
        }
    };
}

function classAspect(target: Function, aspectObject: AspectBase, targetFlags: number) {
    let instanceDescriptors = getDescriptors(target.prototype, aspectObject);
    let staticDescriptors = getDescriptors(target, aspectObject);

    instanceDescriptors.forEach(({ key, descriptor }) => {
        if ((targetFlags & Target.InstanceAccessors) && (descriptor.get || descriptor.set)) {
            decorateAccessor(target.prototype, key, descriptor, aspectObject);
        }

        if ((targetFlags & Target.InstanceMethods) && typeof descriptor.value === "function") {
            decorateProperty(target.prototype, key, descriptor, aspectObject);
        }
    });

    staticDescriptors.forEach(({ key, descriptor }) => {
        if ((targetFlags & Target.StaticAccessors) && (descriptor.get || descriptor.set) && descriptor.configurable) {
            decorateAccessor(target, key, descriptor, aspectObject);
        }

        if ((targetFlags & Target.StaticMethods) && typeof descriptor.value === "function") {
            decorateProperty(target, key, descriptor, aspectObject);
        }
    });
}

function constructorAspect(target: { new(...args): AspectBase }, aspectObject: AspectBase) {
    let ctor = function (...args) {
        return new target(...args);
    }

    ctor = aspectObject[overloadKey](ctor);

    ctor.prototype = target.prototype;
    Object.setPrototypeOf(ctor, Object.getPrototypeOf(target));
    // ctor.__proto__ = target.__proto__;

    Object.getOwnPropertyNames(target)
        .filter(key => !(ctor as Object).hasOwnProperty(key))
        .map(key => ({ key: key, descriptor: Object.getOwnPropertyDescriptor(target, key) }))
        .forEach(keyDescriptorPair => Object.defineProperty(ctor, keyDescriptorPair.key, keyDescriptorPair.descriptor));

    return ctor;
}

function decorateAccessor(target: Function, key: string, descriptor: PropertyDescriptor, aspectObject: AspectBase) {
    Object.defineProperty(target, key, {
        get: descriptor.get ? aspectObject[overloadKey](descriptor.get) : undefined,
        set: descriptor.set ? aspectObject[overloadKey](descriptor.set) : undefined,
        enumerable: descriptor.enumerable,
        configurable: descriptor.configurable,
    });
}

function decorateProperty(target: Function, key: string, descriptor: PropertyDescriptor, aspectObject: AspectBase) {
    Object.defineProperty(target, key, {
        value: aspectObject[overloadKey](descriptor.value),
        enumerable: descriptor.enumerable,
        configurable: descriptor.configurable,
    });
}

function getDescriptors(target: any, aspectObject: AspectBase) {
    return Object.getOwnPropertyNames(target)
        .filter(key => key !== "constructor")
        .map(key => ({ key: key, descriptor: Object.getOwnPropertyDescriptor(target, key) }));
}

function functionAspect(target: Function, key: string | symbol, descriptor: PropertyDescriptor, aspectObject: AspectBase) {
    if (descriptor.get || descriptor.set) {
        descriptor.get = descriptor.get ? aspectObject[overloadKey](descriptor.get) : undefined;
        descriptor.set = descriptor.set ? aspectObject[overloadKey](descriptor.set) : undefined;
    }
    else if (descriptor.value) {
        descriptor.value =  aspectObject[overloadKey](descriptor.value);
    }
    return descriptor;
}