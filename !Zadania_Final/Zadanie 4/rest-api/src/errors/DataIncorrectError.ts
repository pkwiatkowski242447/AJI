export class DataIncorrectError extends Error {

    private _reasons : Array<Object>;

    constructor(object : Array<Object>) {
        super('Given data is incorrect.');
        
        this.name = this.constructor.name;
        this.reasons = object;

        Error.captureStackTrace(this, this.constructor);
        Object.setPrototypeOf(this, DataIncorrectError.prototype);
    }

    get reasons() : Array<Object> {
        return this._reasons;
    }

    set reasons(reasons : Array<Object>) {
        this._reasons = reasons;
    }
}