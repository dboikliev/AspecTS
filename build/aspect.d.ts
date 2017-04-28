export declare enum Target {
    InstanceMethods = 1,
    InstanceAccessors = 2,
    StaticMethods = 4,
    StaticAccessors = 8,
}
export interface AspectBase {
    overload(func: (...args) => any): (...args) => any;
}
export declare abstract class BoundaryAspect implements AspectBase {
    abstract onEntry(...args: any[]): any[];
    abstract onExit(returnValue: any): any;
    overload(func: (...args) => any): (...args) => any;
}
export declare abstract class ErrorAspect implements AspectBase {
    abstract onError(error: any): any;
    overload(func: (...args) => any): (...args) => any;
}
export declare abstract class SurroundAspect implements AspectBase {
    abstract onInvoke(func: Function): Function;
    overload(func: (...args) => any): (...args) => any;
}
export declare function aspect(aspectObject: AspectBase, targetFlags?: number): any;
