"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
function invalidateCache(cachingService, keyIndex) {
    return aspect_1.aspect(new Cache(cachingService, keyIndex, true), aspect_1.Target.All ^ aspect_1.Target.Constructor);
}
const cachingService = new MemoryCache();
class UserService {
    getUserById(id) {
        console.log("In get user by id");
        return {
            name: "Ivan",
            age: 21
        };
    }
    setUserById(id, user) {
    }
}
__decorate([
    cache(cachingService, 0, 1000)
], UserService.prototype, "getUserById", null);
__decorate([
    invalidateCache(cachingService, 0)
], UserService.prototype, "setUserById", null);
const us = new UserService;
const first = us.getUserById(1);
us.setUserById(1, {
    name: "bla",
    age: 23
});
const second = us.getUserById(1);
console.log(first == second); //true - still in cache
setTimeout(() => {
    const third = us.getUserById(1);
    console.log(first == third); //false - cache invalidated
}, 2000);
//# sourceMappingURL=app.js.map