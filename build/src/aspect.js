"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const overloadKey = typeof Symbol === "function" ? Symbol() : "__overload";
var Target;
(function (Target) {
    Target[Target["InstanceMethods"] = 1] = "InstanceMethods";
    Target[Target["InstanceAccessors"] = 2] = "InstanceAccessors";
    Target[Target["StaticMethods"] = 4] = "StaticMethods";
    Target[Target["StaticAccessors"] = 8] = "StaticAccessors";
    Target[Target["Constructor"] = 16] = "Constructor";
    Target[Target["InstanceMembers"] = 3] = "InstanceMembers";
    Target[Target["StaticMembers"] = 12] = "StaticMembers";
    Target[Target["All"] = 31] = "All";
})(Target = exports.Target || (exports.Target = {}));
class AspectBase {
    [overloadKey](func) {
        return func;
    }
}
exports.AspectBase = AspectBase;
class BoundaryAspect {
    [overloadKey](func) {
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
exports.BoundaryAspect = BoundaryAspect;
class ErrorAspect {
    [overloadKey](func) {
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
exports.ErrorAspect = ErrorAspect;
class SurroundAspect {
    [overloadKey](func) {
        let onInvoke = this.onInvoke.bind(this);
        return function (...args) {
            return onInvoke(func).apply(this, args);
        };
    }
}
exports.SurroundAspect = SurroundAspect;
function aspect(aspectObject, targetFlags = Target.All) {
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
exports.aspect = aspect;
function decorateClass(target, aspectObject, targetFlags) {
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
function decorateConstructor(target, aspectObject) {
    let construct = function (...args) {
        return new target(...args);
    };
    return new Proxy(target, {
        construct(target, argumentsList, newTarget) {
            let result = aspectObject[overloadKey](construct)(argumentsList);
            return result;
        }
    });
}
function decorateAccessor(target, key, descriptor, aspectObject) {
    Object.defineProperty(target, key, {
        get: descriptor.get ? aspectObject[overloadKey](descriptor.get) : undefined,
        set: descriptor.set ? aspectObject[overloadKey](descriptor.set) : undefined,
        enumerable: descriptor.enumerable,
        configurable: descriptor.configurable,
    });
}
function decorateProperty(target, key, descriptor, aspectObject) {
    Object.defineProperty(target, key, {
        value: aspectObject[overloadKey](descriptor.value),
        enumerable: descriptor.enumerable,
        configurable: descriptor.configurable,
    });
}
function getDescriptors(target, aspectObject) {
    return Object.getOwnPropertyNames(target)
        .filter(key => key !== "constructor")
        .map(key => ({ key: key, descriptor: Object.getOwnPropertyDescriptor(target, key) }));
}
function decorateFunction(target, key, descriptor, aspectObject) {
    if (descriptor.get || descriptor.set) {
        descriptor.get = descriptor.get ? aspectObject[overloadKey](descriptor.get) : undefined;
        descriptor.set = descriptor.set ? aspectObject[overloadKey](descriptor.set) : undefined;
    }
    else if (descriptor.value) {
        descriptor.value = aspectObject[overloadKey](descriptor.value);
    }
    return descriptor;
}
function mixinAspect(base, override) {
    let extended = class extends base {
    };
    applyMixins(extended, ErrorAspect);
    extended.prototype[overloadKey] = function (func) {
        let f = base.prototype[overloadKey] ? base.prototype[overloadKey].call(this, func) : func;
        let bound = override.bind(this, f);
        return bound();
    };
    return extended;
}
function error(base) {
    return mixinAspect(base, ErrorAspect.prototype[overloadKey]);
}
exports.error = error;
function surround(base) {
    return mixinAspect(base, SurroundAspect.prototype[overloadKey]);
}
exports.surround = surround;
function boundary(base) {
    return mixinAspect(base, BoundaryAspect.prototype[overloadKey]);
}
exports.boundary = boundary;
function applyMixins(targetClass, mixin) {
    Object.getOwnPropertyNames(mixin.prototype).forEach(prop => {
        targetClass.prototype[prop] = mixin.prototype[prop];
    });
}
//# sourceMappingURL=aspect.js.map