"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const aspect_1 = require("./aspect");
class MemoryCache {
    constructor() {
        this.elements = new Map();
    }
    get(id) {
        return this.elements.get(id);
    }
    has(id) {
        return this.elements.has(id);
    }
    set(id, element, period) {
        this.elements.set(id, element);
        if (typeof period !== "undefined") {
            setTimeout((cache) => {
                cache.invalidate(id);
            }, period, this);
        }
    }
    invalidate(id) {
        if (this.elements.has(id)) {
            this.elements.delete(id);
        }
    }
}
exports.MemoryCache = MemoryCache;
class Cache extends aspect_1.SurroundAspect {
    constructor(cachingService, keyIndex, invalidate, period) {
        super();
        this.cachingService = cachingService;
        this.keyIndex = keyIndex;
        this.invalidate = invalidate;
        this.period = period;
    }
    onInvoke(func) {
        const cache = this.cachingService;
        const period = this.period;
        const keyIndex = this.keyIndex;
        const invalidate = this.invalidate;
        return function (...args) {
            const id = args[keyIndex];
            if (invalidate) {
                cache.invalidate(id);
                const result = func.apply(this, args);
                return result;
            }
            else if (cache.has(id)) {
                return cache.get(id);
            }
            else {
                const result = func.apply(this, args);
                cache.set(id, result, period);
                return result;
            }
        };
    }
}
function cache(cachingService, keyIndex, period) {
    return aspect_1.aspect(new Cache(cachingService, keyIndex, false, period), aspect_1.Target.All ^ aspect_1.Target.Constructor);
}
exports.cache = cache;
function invalidateCache(cachingService, keyIndex) {
    return aspect_1.aspect(new Cache(cachingService, keyIndex, true), aspect_1.Target.All ^ aspect_1.Target.Constructor);
}
exports.invalidateCache = invalidateCache;
//# sourceMappingURL=caching.js.map