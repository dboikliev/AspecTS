export declare type Id = string | number;
export interface CachingService<T> {
    get(id: Id): T;
    set(id: Id, element: T, period?: number): void;
    has(id: Id): boolean;
    invalidate(id: Id): void;
}
export declare class MemoryCache<T> implements CachingService<T> {
    private elements;
    get(id: Id): T;
    has(id: Id): boolean;
    set(id: Id, element: T, period?: number): void;
    invalidate(id: Id): void;
}
export declare function cache<T>(cachingService: CachingService<T>, keyIndex: number, period?: number): (...args: any[]) => any;
export declare function invalidateCache<T>(cachingService: CachingService<T>, keyIndex: number): (...args: any[]) => any;
