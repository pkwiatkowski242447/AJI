export class FileNotAnImageError extends Error {
    
    private _fileName: string;
    private _givenMIMEType: string;
    private _allowedMIMETypes : Array<string> = ['image/jpeg', 'image/jpg', 'image/png']
    
    constructor(fileName : string, givenMIMEType : string) {
        super('Sent file is not an image.');
        this.name = 'FileNotAnImageError';
        this._fileName = fileName;
        this._givenMIMEType = givenMIMEType;
        Error.captureStackTrace(this, this.constructor);
        Object.setPrototypeOf(this, FileNotAnImageError.prototype);
    }

    get fileName() : string {
        return this._fileName;
    }

    get givenMIMEType() : string {
        return this._givenMIMEType;
    }

    get allowedMIMETypes() : Array<string> {
        return this._allowedMIMETypes;
    }
};