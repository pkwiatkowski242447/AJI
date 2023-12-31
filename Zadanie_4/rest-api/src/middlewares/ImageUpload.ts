import express from 'express';
import multer from 'multer';
import path from 'path';
import { FileNotAnImageError } from '../errors/FileNotAnImageError';
import { generalErrorFunction } from '../errors/ErrorHandler';

// Storages definitions

const storageUsers = multer.diskStorage({
    destination: (request, file, callback) => {
        callback(null, path.resolve(__dirname, '../../uploads/users'));
    },
    filename: (request, file, callback) => {
        const uniquePrefix = new Date().toISOString().replace(/:/g, '-') + '-' + Math.round(Math.random() * 1E9)
        callback(null, uniquePrefix + '-' + file.originalname)
    },
});

const storageProducts = multer.diskStorage({
    destination: (request, file, callback) => {
        callback(null, path.resolve(__dirname, '../../uploads/products'));
    },
    filename: (request, file, callback) => {
        const uniquePrefix = new Date().toISOString().replace(/:/g, '-') + '-' + Math.round(Math.random() * 1E9)
        callback(null, uniquePrefix + '-' + file.originalname)
    },
});

const fileFilter = (request : express.Request, file : Express.Multer.File, callback : Function) => {
    
    if (new Array('image/jpeg', 'image/jpg', 'image/png').includes(file.mimetype)) {
        callback(null, true);
    } else {
        callback(new FileNotAnImageError(file.originalname, file.mimetype));
    }
};

const userImageUpload = multer({ 
    storage: storageUsers,
    limits: {
        fileSize: 1024 * 1024 * 5, 
        files: 1,
    },
    fileFilter: fileFilter,
})

const productImageUpload = multer({ 
    storage: storageProducts,
    limits: {
        fileSize: 1024 * 1024 * 5, 
        files: 1,
    },
    fileFilter: fileFilter,
})

export const uploadUserImage = userImageUpload.single('userImage');
export const uploadProductImage = productImageUpload.single('productImage');

export const userImageMiddleware = (request : express.Request, response : express.Response, nextFunction : express.NextFunction) => {
    imageMiddlewareFunction(request, response, nextFunction, uploadUserImage);
};

export const productImageMiddleware = (request : express.Request, response : express.Response, nextFunction : express.NextFunction) => {
    imageMiddlewareFunction(request, response, nextFunction, uploadProductImage);
};

const imageMiddlewareFunction = (request : express.Request, response : express.Response, nextFunction : express.NextFunction, objectFunction : Function) => {
    objectFunction(request, response, function (error : Error) {
        if (!error) {
            nextFunction();
        } else if (error instanceof FileNotAnImageError) {
            return response.status(400).json({
                message: error.message,
                fileName: error.fileName,
                givenMIMEType: error.givenMIMEType,
                allowedMIMETypes: error.allowedMIMETypes,
            });
        } else if (error instanceof multer.MulterError) {
            return response.status(500).json({
                message: 'There was some issue when saving given file.',
            });
        } else {
            return generalErrorFunction(error, response);
        }
    });
}