"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const aspect_1 = require("./aspect");
class RepeatOnErrorAspect extends aspect_1.SurroundAspect {
    constructor(count, interval, wait) {
        super();
        this.count = count;
        this.interval = interval;
        this.wait = wait;
    }
    onInvoke(func) {
        let count = this.count;
        let interval = this.interval;
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
            };
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
        };
    }
}
function repeatOnError(count, interval, wait) {
    return aspect_1.aspect(new RepeatOnErrorAspect(count, interval, wait));
}
exports.repeatOnError = repeatOnError;
//# sourceMappingURL=repeat.js.map