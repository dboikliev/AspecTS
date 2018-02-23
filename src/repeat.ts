import { aspect, SurroundAspect } from "./aspect";

class RepeatOnErrorAspect extends SurroundAspect {
    constructor(private count: number,
                private interval: number) {
        super();
    }

    onInvoke(func: Function): Function {
        let count: number = this.count;
        let interval: number = this.interval;
        return function repeat(...args) {
            try {
                func.apply(this, args);
            }
            catch (error) {
                if (count > 0) {
                    count--;
                    setTimeout(repeat.bind(this), interval);
                }
                else {
                    throw error;
                }
            }
        }
    }
}

export function repeatOnError(count: number, interval: number) {
    return aspect(new RepeatOnErrorAspect(count, interval));
}