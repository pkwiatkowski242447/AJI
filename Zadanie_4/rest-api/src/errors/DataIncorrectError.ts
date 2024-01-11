export class DataIncorrectError extends Error {

    private _reasons : Object;

    constructor(object : Object) {
        super('Given data is incorrect.');
        
        this.name = this.constructor.name;
        this.reasons = object;

        Error.captureStackTrace(this, this.constructor);
        Object.setPrototypeOf(this, DataIncorrectError.prototype);
    }

    get reasons() : Object {
        return this._reasons;
    }

    set reasons(reasons : Object) {
        this._reasons = reasons;
    }
}