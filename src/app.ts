import { cache, invalidateCache, MemoryCache } from "./caching"

const cachingService = new MemoryCache<User>();

class UserService {
    @cache(cachingService, 0, 1000)
    getUserById(id: number): User {
        console.log("In get user by id");
        return {
            name: "Ivan",
            age: 21
        }
    }

    @invalidateCache(cachingService, 0)
    setUserById(id: number, user: User) {
        
    }
}

interface User {
    name: string,
    age: number
}

const us = new UserService
const first = us.getUserById(1)

us.setUserById(1, {
    name: "bla",
    age: 23
})

const second = us.getUserById(1);
console.log(first == second) //false - cache was invalidated by set method

const third = us.getUserById(1);
console.log(second == third) //true - result was cached during previous call 

setTimeout(() => {
    const fourth = us.getUserById(1)
    console.log(first == fourth) //false - cache expired
}, 2000)