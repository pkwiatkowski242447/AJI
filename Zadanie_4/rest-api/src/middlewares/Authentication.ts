import express from 'express';
import jwt from 'jsonwebtoken';
import { JWTToken } from '../types/JWTToken';
import { authorizationErrorFunction, forbiddenErrorFunction } from '../errors/HTTPErrors';

export const authenticate = async (request : express.Request, response : express.Response, nextFunction : express.NextFunction) => {
    try {
        const authHeader = request.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            return authorizationErrorFunction(response);
        } else {
            const token = authHeader.split(' ')[1];
            jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (error : Error, decoded : JWTToken) {
                if (error) {
                    return forbiddenErrorFunction(response);
                } else {
                    const userDataString = JSON.stringify({
                        user: decoded.userInformation,
                        role: decoded.role,
                    });

                    (request as any).userData = userDataString;
                    nextFunction();
                }
            });
        }
    } catch (error) {
        return forbiddenErrorFunction(response);
    }
};