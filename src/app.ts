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
    constructor(private cachingService: CachingService<T>) {
        super();
    }

    onInvoke(func: Function): Function {
        const cache = this.cachingService;
        return function (id: string | number) {
            if (cache.has(id)) {
                return cache.get(id);
            }
            const result = func.call(this, id);
            cache.set(id, result);
            return result;
        }
    }
}

function createCachingAspect<T>(cachingService: CachingService<T>) {
    return aspect.bind(null, new Cached(cachingService), Target.All ^ Target.Constructor);
}

const cachingAspect = createCachingAspect(new MemoryCache<User>())

@cachingAspect()
class UserService {
    getUserById(id: number): User {
        console.log("In get user by id");
        return {
            name: "Ivan",
            age: 21
        }
    }
}

interface User {
    name: string,
    age: number
}

const us = new UserService
const first = us.getUserById(1)
const second = us.getUserById(1);
console.log(first == second);