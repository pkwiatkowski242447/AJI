import express from 'express';
import mongoose from 'mongoose';
import { StatusCodes, ReasonPhrases } from 'http-status-codes';

export const validationErrorFunction = (error : mongoose.Error.ValidationError, response : express.Response) => {  
    return response
            .status(StatusCodes.BAD_REQUEST)
            .json({
                message: "Given data did not pass validation.",
                error: error.errors,
            });
}

export const generalErrorFunction = (error: Error, response: express.Response) => {
    return response
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json({
                message: "Critical error occured while the request was being processed.",
                type: error.name,
                cause: error.message,
            });
}

export const invalidObjectIdentifier = (error : mongoose.Error.CastError, response : express.Response) => {
    return response
            .status(StatusCodes.BAD_REQUEST)
            .json({
                message: `Given id: ${error.value} cannot be an object identifier.`,
                type: error.name,
                cause: error.message,
            });
}