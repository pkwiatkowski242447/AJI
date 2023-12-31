export class DataIncorrectError extends Error {

    private reasons : Object;

    constructor(object : Object) {
        super('Given data is incorrect.');
        this.name = this.constructor.name;
        this.reasons = object;
        Error.captureStackTrace(this, this.constructor);
    }
}