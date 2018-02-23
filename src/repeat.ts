import { aspect, SurroundAspect } from "./aspect";

class RepeatOnErrorAspect extends SurroundAspect {
    constructor(private count: number,
                private interval?: number,
                private wait?: boolean) {
        super();
    }

    onInvoke(func: Function): Function {
        let count: number = this.count;
        let interval: number = this.interval;

        if (this.wait) {
            return function repeatWithWait(...args) {
                let previousExecutionTime = 0;
                while (true) {
                    if (Date.now() - previousExecutionTime > interval) {
                        previousExecutionTime = Date.now();
                        try {
                            return func.apply(this, args);
                        }
                        catch (error) {
                            if (count > 0) {
                                count--;
                            }
                            else {
                                throw error;
                            }
                        }
                    }
                }
            }
        }
        
        return function repeat(...args) {
            try {
                return func.apply(this, args);
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

export function repeatOnError(count: number, interval?: number, wait?: boolean) {
    return aspect(new RepeatOnErrorAspect(count, interval, wait));
}