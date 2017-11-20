import {
    aspect,
    ErrorAspect,
    BoundaryAspect,
    SurroundAspect,
    Target,
    surround,
    boundary,
    error
} from "./aspect";

interface CachingService<T> {
    get(id: string | number): T
    set(id: string | number, element: T, period?: number): void
    has(id: string | number): boolean
    invalidate(id: string | number): void
}

class MemoryCache<T> implements CachingService<T> {
    private elements: Map<string | number, T> = new Map();

    get(id: string | number): T {
        return this.elements.get(id);
    }

    has(id: string | number): boolean {
        return this.elements.has(id);
    }

    set(id: string | number, element: T, period?: number): void {
        this.elements.set(id, element);
        if (typeof period !== "undefined") {
            setTimeout((cache: MemoryCache<T>) => {
                cache.invalidate(id);
            }, period, this)
        }
    }

    invalidate(id: string | number): void {
        if (this.elements.has(id)) {
            this.elements.delete(id);
        }
    }
}

class Cached<T> extends SurroundAspect {
    constructor(private cachingService: CachingService<T>,
                private keyIndex: number,
                private invalidate: boolean,
                private period?: number) {
        super();
    }

    onInvoke(func: Function): Function {
        const cache = this.cachingService;
        const period = this.period;
        const keyIndex = this.keyIndex;
        const invalidate = this.invalidate;
        return function (...args) {
            const id = args[keyIndex]
            if (invalidate) {
                cache.invalidate(id);
                const result = func.apply(this, args)
                return result
            }
            else if (cache.has(id)) {
                return cache.get(id)
            }
            else {
                const result = func.apply(this, args)
                cache.set(id, result, period)
                return result
            }
        }
    }
}

function cache<T>(cachingService: CachingService<T>,
                   keyIndex: number, 
                   period?: number) {
    return aspect.call(null, 
                       new Cached(cachingService, keyIndex, false, period), 
                       Target.All ^ Target.Constructor);
}

function invalidateCache<T>(cachingService: CachingService<T>,
    keyIndex: number) {
    return aspect.call(null, 
                       new Cached(cachingService, keyIndex, true), 
                       Target.All ^ Target.Constructor);
}

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
console.log(first == second) //true - still in cache


setTimeout(() => {
    const third = us.getUserById(1)
    console.log(first == third) //false - cache invalidated
}, 2000)