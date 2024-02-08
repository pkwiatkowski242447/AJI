import express from 'express';
import { StatusCodes } from 'http-status-codes';

export const authorizationErrorFunction = (response : express.Response) => {
    return response
            .status(StatusCodes.UNAUTHORIZED)
            .json({
                message: 'Authorization failed.',
            });
}

export const forbiddenErrorFunction = (response : express.Response) => {
    return response
            .status(StatusCodes.FORBIDDEN)
            .json({
                message: 'You are forbidden from performing this operation.',
            });
}