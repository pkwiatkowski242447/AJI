import express from 'express';
import mongoose from 'mongoose';

export const validationErrorFunction = (error : mongoose.Error.ValidationError, response : express.Response) => {  
    return response.status(400).json({
        message: "Given data did not pass validation.",
        error: error.errors,
    });
}

export const generalErrorFunction = (error: Error, response: express.Response) => {
    return response.status(500).json({
        message: "Some error occured while the request was being processed.",
        type: error.name,
        cause: error.message,
    });
}