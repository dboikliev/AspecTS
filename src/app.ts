import { cache, invalidateCache, MemoryCache } from "./cache"
import { repeatOnError } from "./repeat";

const cachingService = new MemoryCache<User>();

class UserService {
    private count: number = 3;

    @cache(cachingService, 0, 1000)
    @repeatOnError(5, 100, true)    
    getUserById(id: number): User {
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

interface User {
    name: string,
    age: number
}

const us = new UserService()

let user = us.getUserById(1)
let cached = us.getUserById(1)

console.log(user)
console.log("Is cached: ", user == cached) 