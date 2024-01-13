import express, { request } from 'express';
import { UserRole } from '../models/User';
import { forbiddenErrorFunction } from '../errors/HTTPErrors';
import { UserData } from 'types/UserData';

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

// Method for checking if user is of correct userType, as opposed to user types passed in userRoles arrray.

export const isCorrectUserType = (request : express.Request, response : express.Response, userRoles : Array<String>) => {
    let requestRole;
    const userData : UserData = JSON.parse((request as any).userData);
    if (userData) {
        requestRole = userData.role;
    } else {
        return false;
    }

    if (userRoles.includes(requestRole)) {
        return true;
    } else {
        return false;
    }
}