"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const cache_1 = require("./cache");
const repeat_1 = require("./repeat");
const cachingService = new cache_1.MemoryCache();
class UserService {
    constructor() {
        this.count = 10;
    }
    getUserById(id) {
        console.log("In get user by id");
        console.log(this);
        if (this.count > 0) {
            this.count--;
            throw Error("Err");
        }
        return {
            name: "Ivan",
            age: 21
        };
    }
    setUserById(id, user) {
    }
}
__decorate([
    cache_1.cache(cachingService, 0, 1000),
    repeat_1.repeatOnError(5, 100)
], UserService.prototype, "getUserById", null);
__decorate([
    cache_1.invalidateCache(cachingService, 0)
], UserService.prototype, "setUserById", null);
const us = new UserService;
const first = us.getUserById(1);
us.setUserById(1, {
    name: "bla",
    age: 23
});
// const second = us.getUserById(1);
// console.log(first == second) //false - cache was invalidated by set method
// const third = us.getUserById(1);
// console.log(second == third) //true - result was cached during previous call 
// setTimeout(() => {
//     const fourth = us.getUserById(1)
//     console.log(third == fourth) //false - cache expired
// }, 2000) 
//# sourceMappingURL=app.js.map