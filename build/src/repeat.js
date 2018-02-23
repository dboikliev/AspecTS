"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const aspect_1 = require("./aspect");
class RepeatOnErrorAspect extends aspect_1.SurroundAspect {
    constructor(count, interval) {
        super();
        this.count = count;
        this.interval = interval;
    }
    onInvoke(func) {
        let count = this.count;
        let interval = this.interval;
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
        };
    }
}
function repeatOnError(count, interval) {
    return aspect_1.aspect(new RepeatOnErrorAspect(count, interval));
}
exports.repeatOnError = repeatOnError;
//# sourceMappingURL=repeat.js.map