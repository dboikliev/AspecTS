import { aspect, SurroundAspect, Target } from "./aspect";

export type Id = string | number;

export interface CachingService<T> {
    get(id: Id): T
    set(id: Id, element: T, period?: number): void
    has(id: Id): boolean
    invalidate(id: Id): void
}

export class MemoryCache<T> implements CachingService<T> {
    private elements: Map<Id, T> = new Map();

    get(id: Id): T {
        return this.elements.get(id);
    }

    has(id: Id): boolean {
        return this.elements.has(id);
    }

    set(id: Id, element: T, period?: number): void {
        this.elements.set(id, element);
        if (typeof period !== "undefined") {
            setTimeout((cache: MemoryCache<T>) => {
                cache.invalidate(id);
            }, period, this)
        }
    }

    invalidate(id: Id): void {
        if (this.elements.has(id)) {
            this.elements.delete(id);
        }
    }
}

class CacheAspect<T> extends SurroundAspect {
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

export function cache<T>(cachingService: CachingService<T>,
                   keyIndex: number, 
                   period?: number) {
    return aspect(new CacheAspect(cachingService, keyIndex, false, period), 
                       Target.All ^ Target.Constructor);
}

export function invalidateCache<T>(cachingService: CachingService<T>,
    keyIndex: number) {
    return aspect(new CacheAspect(cachingService, keyIndex, true), 
                       Target.All ^ Target.Constructor);
}
