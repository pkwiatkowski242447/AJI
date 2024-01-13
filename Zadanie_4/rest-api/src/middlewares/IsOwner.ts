import express from 'express';
import { forbiddenErrorFunction } from '../errors/HTTPErrors';
import { OrderModel } from '../models/Order';
import { IOrder } from '../interfaces/Order';
import { isCorrectUserType } from './VerifyRole';
import { UserData } from 'types/UserData';

// Methods for permission checking - if conditions are ok then go to the next middleware.

export const checkAccountOwnerShipPermissions = (userRoles : Array<string>) => {
    return (request : express.Request, response : express.Response, nextFunction : express.NextFunction) => {
        if (isOwnerOfTheAccount(request, response) || isCorrectUserType(request, response, userRoles)) {
            nextFunction();
        } else {
            return forbiddenErrorFunction(response);
        }
    }
};

export const checkOrderOwnerShipPermissions = (userRoles : Array<string>) => {
    return (request : express.Request, response : express.Response, nextFunction : express.NextFunction) => {
        if (isOwnerOfTheOrder(request, response) || isCorrectUserType(request, response, userRoles)) {
            nextFunction();
        } else {
            return forbiddenErrorFunction(response);
        }
    }
};

export const isOwnerOfTheAccount = (request : express.Request, response : express.Response) => {
    const userData : UserData = JSON.parse((request as any).userData);
    if (userData) {
        const userId = userData.user._id;
        const requestUserId = request.params.userId;
        if (userId.toString() == requestUserId) {
            return true;
        } else {
            return false;
        }
    } else {
        return false;
    }
};

export const isOwnerOfTheOrder = (request : express.Request, response : express.Response) => {
    const userData : UserData = JSON.parse((request as any).userData);
    if (userData) {
        const userId = userData.user._id;
        const requestOrderId = request.params.orderId;
            
        OrderModel.findById<IOrder>(requestOrderId)
            .exec()
            .then(order => {
                if (order.user == userId) {
                    return true;
                }
            })
            .catch(error => {
                return false;
            });
    }
    return false;
};