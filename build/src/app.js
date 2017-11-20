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
class Cached extends aspect_1.SurroundAspect {
    constructor(cachingService) {
        super();
        this.cachingService = cachingService;
    }
    onInvoke(func) {
        const cache = this.cachingService;
        return function (id) {
            if (cache.has(id)) {
                return cache.get(id);
            }
            const result = func.call(this, id);
            cache.set(id, result);
            return result;
        };
    }
}
function createCachingAspect(cachingService) {
    return aspect_1.aspect.bind(null, new Cached(cachingService), aspect_1.Target.All ^ aspect_1.Target.Constructor);
}
const cachingAspect = createCachingAspect(new MemoryCache());
let UserService = class UserService {
    getUserById(id) {
        console.log("In get user by id");
        return {
            name: "Ivan",
            age: 21
        };
    }
};
UserService = __decorate([
    cachingAspect()
], UserService);
const us = new UserService;
const first = us.getUserById(1);
const second = us.getUserById(1);
console.log(first == second);
//# sourceMappingURL=app.js.map