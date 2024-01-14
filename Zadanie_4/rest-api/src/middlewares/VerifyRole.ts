import express, { request } from 'express';
import { UserRole } from '../models/User';
import { forbiddenErrorFunction } from '../errors/HTTPErrors';

// Methods for permission checking - if conditions are ok then go to the next middleware.

export const checkRolesPermission = (userRoles : Array<string>) => {
    return (request : express.Request, response : express.Response, nextFunction : express.NextFunction) => {
        if (isCorrectUserType(request, response, userRoles)) {
            nextFunction();
        } else {
            return forbiddenErrorFunction(response);
        }
    }
}

// Methods for permission checking - return boolean value representing whether permission is available.

export const isClient = (request : express.Request, response : express.Response, nextFunction : express.NextFunction) => {
    isCorrectUserType(request, response, new Array(UserRole.CLIENT));
};

export const isStaff = (request : express.Request, response : express.Response, nextFunction : express.NextFunction) => {
    isCorrectUserType(request, response, new Array(UserRole.STAFF));
};

export const isAdmin = (request : express.Request, response : express.Response, nextFunction : express.NextFunction) => {
    isCorrectUserType(request, response, new Array(UserRole.ADMIN));
};

// Method for checking if main is of correct userType, as opposed to main types passed in userRoles arrray.

export const isCorrectUserType = (request : express.Request, response : express.Response, userRoles : Array<String>) => {
    let requestRole : string;
    if (request.is('multipart/form-data')) {
        if ((request as any)?.userData) {
            const userData = JSON.parse((request as any).userData);
            requestRole = userData.role;
        } else {
            return false;
        }
    } else {
        if (request?.body) {
            requestRole = request.body.role;
        } else {
            return false;
        }
    }

    if (userRoles.includes(requestRole)) {
        return true;
    } else {
        return false;
    }
}