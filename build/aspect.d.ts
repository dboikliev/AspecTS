export declare enum Target {
    InstanceMethods = 1,
    InstanceAccessors = 2,
    StaticMethods = 4,
    StaticAccessors = 8,
}
export declare abstract class AspectBase {
}
export declare abstract class BoundaryAspect implements AspectBase {
    abstract onEntry(...args: any[]): any[];
    abstract onExit(returnValue: any): any;
}
export declare abstract class ErrorAspect implements AspectBase {
    abstract onError(error: any): any;
}
export declare abstract class SurroundAspect implements AspectBase {
    abstract onInvoke(func: Function): Function;
}
export declare function aspect(aspectObject: AspectBase, targetFlags?: number): (...args: any[]) => void;
export interface Constructable<T> {
    new (...args: any[]): T;
}
export interface Base {
}
export declare function error<T extends Base>(base: Constructable<T>): Constructable<ErrorAspect & T>;
export declare function surround<T extends Base>(base: Constructable<T>): Constructable<SurroundAspect & T>;
export declare function boundary<T extends Base>(base: Constructable<T>): Constructable<BoundaryAspect & T>;
