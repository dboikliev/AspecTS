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
        this.count = 3;
    }
    getUserById(id) {
        console.log("In get user by id");
        if (this.count > 0) {
            this.count--;
            throw Error("Err");
        }
        return {
            name: "Ivan",
            age: 21
        };
    }
}
__decorate([
    cache_1.cache(cachingService, 0, 1000),
    repeat_1.repeatOnError(5, 100, true)
], UserService.prototype, "getUserById", null);
const us = new UserService();
let user = us.getUserById(1);
let cached = us.getUserById(1);
console.log(user);
console.log("Is cached: ", user == cached);
//# sourceMappingURL=app.js.map