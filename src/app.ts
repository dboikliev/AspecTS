import { aspect, BoundaryAspect, ErrorAspect } from "./aspect";

class ErrorLogger extends ErrorAspect {
    constructor(private file: string) {
        super();
    }

    onError(error: Error) {
        console.log(`Logged error: ${error.message} \nLocation: ${this.file}`);
    }
}

class Test {
    someVal = 5;

    @aspect(new ErrorLogger("D:\\logs\\"))
    do(arg) {
        throw Error("Some error.");
    }
}

new Test().do(1);