import express from 'express';

export const authorizationErrorFunction = (response : express.Response) => {
    return response.status(401).json({
        message: 'Authorization failed.',
    });
}

export const forbiddenErrorFunction = (response : express.Response) => {
    return response.status(403).json({
        message: 'You are not authorized to perform this operation.',
    });
}