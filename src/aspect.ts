declare const Symbol: any;

const overrideKey = typeof Symbol === "function" ? Symbol() : "__override";

export enum Target {
    InstanceMethods = 1,
    InstanceAccessors = 1 << 1,
    StaticMethods = 1 << 2,
    StaticAccessors = 1 << 3,
    Constructor = 1 << 4,
    InstanceMembers = InstanceMethods | InstanceAccessors,
    StaticMembers = StaticMethods | StaticAccessors,
    All = InstanceMembers | StaticMembers | Constructor
}

export abstract class AspectBase {
    protected [overrideKey](func: (...args) => any): (...args) => any {
        return func;
    }
}

export abstract class BoundaryAspect implements AspectBase {
    abstract onEntry(...args): any[]

    abstract onExit(returnValue): any

    [overrideKey](func: (...args) => any): (...args) => any {
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

    [overrideKey](func: (...args) => any): (...args) => any {
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

    [overrideKey](func: (...args) => any): (...args) => any {
        let onInvoke = this.onInvoke.bind(this);
        return function (...args) {
            return onInvoke(func).apply(this, args);
        };
    }
}

export function aspect(aspectObject: AspectBase, targetFlags: number = Target.All) {
    return function (...args) {
        switch (args.length) {
            case 1:
                decorateClass.call(this, ...args, aspectObject, targetFlags);
                if (targetFlags & Target.Constructor) {
                    return decorateConstructor.call(this, ...args, aspectObject);
                }
                break;
            case 2:
                throw Error("Cannot use aspect on properties.");
            case 3:
                if (args[2] === "number") {
                    throw Error("Cannot use aspect on parameters.");
                }
                decorateFunction.call(this, ...args, aspectObject);
                break;
            default:
                throw Error("Cannot use aspect here.");
        }
    };
}

function decorateClass(target: Function, aspectObject: AspectBase, targetFlags: number) {
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

function decorateConstructor(target: Constructable<AspectBase> , aspectObject: AspectBase) {
    let construct = function (...args) {
        return new target(...args);
    }

    return new Proxy(target, {
        construct(target, argumentsList, newTarget) {
            let result = aspectObject[overrideKey](construct)(argumentsList);
            return result;
        }
    });
}

function decorateAccessor(target: Function, key: string, descriptor: PropertyDescriptor, aspectObject: AspectBase) {
    Object.defineProperty(target, key, {
        get: descriptor.get ? aspectObject[overrideKey](descriptor.get) : undefined,
        set: descriptor.set ? aspectObject[overrideKey](descriptor.set) : undefined,
        enumerable: descriptor.enumerable,
        configurable: descriptor.configurable,
    });
}

function decorateProperty(target: Function, key: string, descriptor: PropertyDescriptor, aspectObject: AspectBase) {
    Object.defineProperty(target, key, {
        value: aspectObject[overrideKey](descriptor.value),
        enumerable: descriptor.enumerable,
        configurable: descriptor.configurable,
    });
}

function getDescriptors(target: any, aspectObject: AspectBase) {
    return Object.getOwnPropertyNames(target)
        .filter(key => key !== "constructor")
        .map(key => ({ key: key, descriptor: Object.getOwnPropertyDescriptor(target, key) }));
}

function decorateFunction(target: Function, key: string | symbol, descriptor: PropertyDescriptor, aspectObject: AspectBase) {
    if (descriptor.get || descriptor.set) {
        descriptor.get = descriptor.get ? aspectObject[overrideKey](descriptor.get) : undefined;
        descriptor.set = descriptor.set ? aspectObject[overrideKey](descriptor.set) : undefined;
    }
    else if (descriptor.value) {
        descriptor.value = aspectObject[overrideKey](descriptor.value);
    }
    return descriptor;
}

export interface Constructable<T> {
    new(...args): T;
}

function mixinAspect<TBase, TAspect extends AspectBase>(base: Constructable<TBase>, aspectPrototype): Constructable<TAspect & TBase> {
    let extended =  class extends (base as any) { };

    Object.getOwnPropertyNames(aspectPrototype).forEach(prop => {
        extended.prototype[prop] = aspectPrototype[prop];
    });

    extended.prototype[overrideKey] = function (func: Function): Function {
        let f = base.prototype[overrideKey] ? base.prototype[overrideKey].call(this, func) : func;
        let bound = aspectPrototype[overrideKey].bind(this, f);
        return bound();
    }
    return extended as any;
}

export function error<T>(base: Constructable<T>): Constructable<ErrorAspect & T>  {
    return mixinAspect<T, ErrorAspect>(base, ErrorAspect.prototype);
}

export function surround<T>(base: Constructable<T>): Constructable<SurroundAspect & T> {
    return mixinAspect<T, SurroundAspect>(base, SurroundAspect.prototype);
}

export function boundary<T>(base: Constructable<T>): Constructable<BoundaryAspect & T> {
    return mixinAspect<T, BoundaryAspect>(base, BoundaryAspect.prototype);
}