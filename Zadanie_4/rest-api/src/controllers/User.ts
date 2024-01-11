import express from 'express';
import path from 'path';
import { UserModel } from '../models/User';
import { IUser } from '../interfaces/User';
import { generalErrorFunction, validationErrorFunction } from '../errors/ErrorHandler';
import { unlink } from 'node:fs';
import { StatusCodes } from 'http-status-codes';
import mongoose from 'mongoose';

// Read methods

export const getAllUsers = async (request : express.Request, response : express.Response) => {
    UserModel.find<IUser>()
        .select(' _id username phoneNumber userImage ')
        .exec()
        .then(documents => {
            if (documents.length > 0) {
                const customResponse = {
                    count: documents.length,
                    users: documents.map(document => {
                        return {
                            user: {
                                _id: document._id,
                                username: document.username,
                                email: document.email,
                                phoneNumber: document.phoneNumber,
                                userImage: document.userImage,
                            },
                            request: {
                                description: 'HTTP request for getting certain user details.',
                                method: 'GET',
                                url: 'http://localhost:8080/users/' + document._id,
                            },
                        }
                    }),
                }
                return response
                        .status(StatusCodes.OK)
                        .json(customResponse);
            } else {
                return response
                        .status(StatusCodes.NOT_FOUND)
                        .json({
                            message: 'No documents for users were found in the database.',
                        });
            }   
        })
        .catch(error => {
            return generalErrorFunction(error, response);
        });
}

export const getUserById = async (request : express.Request, response : express.Response) => {
    const userId = request.params.userId;

    UserModel.findById<IUser>(userId)
        .select(' _id username email phoneNumber userImage ')
        .exec()
        .then(document => {
            if (document) {
                return response
                        .status(StatusCodes.OK)
                        .json(document);
            } else {
                return response
                        .status(StatusCodes.NOT_FOUND)
                        .json({
                            message: `User object with id equal to ${userId} could not be found in the database.`,
                        });
            }
        })
        .catch(error => {
            return generalErrorFunction(error, response);
        });
}

export const getUserByEmail = async (request : express.Request, response : express.Response) => {
    const email = request.params.email;

    UserModel.findOne<IUser>({ email: email })
        .select(' _id username email phoneNumber userImage ')
        .exec()
        .then(document => {
            if (document) {
                return response
                        .status(StatusCodes.OK)
                        .json(document);
            } else {
                return response
                        .status(StatusCodes.NOT_FOUND)
                        .json({
                            message: `User object with email equal to ${email} could not be found in the database.`,
                        });
            }
        })
        .catch(error => {
            return generalErrorFunction(error, response);
        });
}

export const getUsersByUsername = async (request : express.Request, response : express.Response) => {
    const username = request.params.username;

    UserModel.find<IUser>({ username: username })
        .select(' _id username email phoneNumber userImage ')
        .exec()
        .then(documents => {
            if (documents.length > 0) {
                const customResponse = {
                    count: documents.length,
                    users: documents.map(document => {
                        return {
                            user: {
                                _id: document._id,
                                username: document.username,
                                email: document.email,
                                phoneNumber: document.phoneNumber,
                                userImage: document.userImage,
                            },
                            request: {
                                description: 'HTTP request for getting certain user details.',
                                method: 'GET',
                                url: 'http://localhost:8080/users/' + document._id,
                            },
                        }
                    }),
                }
                return response
                        .status(StatusCodes.OK)
                        .json(customResponse);
            } else {
                return response
                        .status(StatusCodes.NOT_FOUND)
                        .json({
                            message: `User object with username equal to ${username} could not be found in the database.`,
                        });
            }
        })
        .catch(error => {
            return generalErrorFunction(error, response);
        });
}

export const getUserImageByUserId = (request : express.Request, response : express.Response) => {
    const userId = request.params.userId;

    UserModel.findById<IUser>(userId)
        .select(' _id username email phoneNumber userImage ')
        .exec()
        .then(existingUser => {
            if (existingUser) {
                const userImagePath = existingUser.userImage;
                return response
                        .status(StatusCodes.OK)
                        .sendFile(userImagePath);
            } else {
                return response
                        .status(StatusCodes.NOT_FOUND).json({
                            message: `User with id equal to ${userId} could not be found in the database.`,
                        });
            }
        })
        .catch(error => {
            return generalErrorFunction(error, response);
        });
};

// Update methods

export const updateUserById = async (request : express.Request, response : express.Response) => {
    const userId = request.params.userId;

    const updateOpts : any = {};

    Object.keys(request.body).forEach(key => {
        updateOpts[key] = request.body[key];
    });

    UserModel.findOneAndUpdate<IUser>({ _id: userId }, { $set: updateOpts }, { runValidators: true })
        .select(' _id username email phoneNumber userImage ')
        .exec()
        .then(document => {
            if (document) {
                const customResponse = {
                    message: `User object with id equal to ${userId} was updated successfully in the database.`, 
                    oldUser: {
                        _id: document._id,
                        username: document.username,
                        email: document.email,
                        phoneNumber: document.phoneNumber,
                    },
                    request: {
                        description: 'HTTP request for getting the updated version of the user.',
                        method: 'GET',
                        url: 'http://localhost:8080/users/' + userId,
                    }
                }
                return response
                        .status(StatusCodes.OK)
                        .json(customResponse);
            } else {
                return response
                        .status(StatusCodes.NOT_FOUND)
                        .json({
                            message: `There is no user object with id equal to ${userId} in the database.`,
                        });
            }
        })
        .catch(error => {
            if (error instanceof mongoose.Error.ValidationError) {
                return validationErrorFunction(error, response);
            } else {
                return generalErrorFunction(error, response);
            }
        });
}

export const updateUserImageByUserId = (request : express.Request, response : express.Response) => {
    const userId = request.params.userId;

    if (request.file) {
        const newImage = request.file.path;

        const updateOpts : any = {
            userImage: newImage,
        }
    
        UserModel.findOneAndUpdate<IUser>({ _id: userId }, { $set: updateOpts })
            .exec()
            .then(document => {
                if (document.userImage !== path.resolve(__dirname, '../../uploads/users/default.png')) {
                    unlink(document.userImage, (error) => {
                        if (!error) {
                            console.log(`File ${document.userImage} was deleted successfully.`);
                        } else {
                            console.log(error.message);
                        }
                    });
                }
                return response
                        .status(StatusCodes.OK)
                        .json({
                            message: 'You user image has been updated successfully.',
                            userImage: newImage,
                        });
            })
            .catch(error => {
                return generalErrorFunction(error, response);
            });
    } else {
        return response
                .status(StatusCodes.BAD_REQUEST)
                .json({
                    message: 'Your new user image was not sent along with request.',
                });
    }
};

// Delete methods

export const deleteUserById = async (request : express.Request, response : express.Response) => {
    const userId = request.params.userId;

    UserModel.findOneAndDelete<IUser>({ _id: userId })
        .select(' _id username email phoneNumber userImage ')
        .exec()
        .then(document => {
            if (document) {
                const customResponse = {
                    message: `User with id equal to ${userId} was deleted successfully from the database.`,
                    deletedUser: {
                        _id: document._id,
                        username: document.username,
                        email: document.email,
                        phoneNumber: document.phoneNumber
                    }
                };
                if (document.userImage !== path.resolve(__dirname, '../../uploads/users/default.png')) {
                    unlink(document.userImage, (error) => {
                        if (!error) {
                            console.log(`File ${document.userImage} was deleted successfully.`);
                        } else {
                            console.log(error.message);
                        }
                    })
                }
                return response
                        .status(StatusCodes.OK)
                        .json(customResponse); 
            } else {
                return response
                        .status(StatusCodes.NOT_FOUND)
                        .json({
                            message: `There is no user object with id equal to ${userId} in the database.`,
                        });
            }
        })
        .catch(error => {
            return generalErrorFunction(error, response);
        });
}

export const deleteUserImageByUserId = (request : express.Request, response : express.Response) => {
    const userId = request.params.userId;

    const defaultImage = path.resolve(__dirname, '../../uploads/users/default.png');

    const updateOpts : any = {
        userImage: defaultImage,
    }

    UserModel.findOneAndUpdate<IUser>({ _id: userId }, { $set: updateOpts })
        .exec()
        .then(document => {
            if (document.userImage !== defaultImage) {
                unlink(document.userImage, (error) => {
                    if (!error) {
                        console.log(`File ${document.userImage} was deleted successfully.`);
                    } else {
                        console.log(error.message);
                    }
                });
                return response
                        .status(StatusCodes.OK)
                        .json({
                            message: 'You custom user image was deleted and replaced with default user image.',
                            userImage: defaultImage,
                        });
            } else {
                return response
                        .status(StatusCodes.BAD_REQUEST)
                        .json({
                            message: 'It is not possible to remove default user image.',
                        });
            }
        })
        .catch(error => {
            return generalErrorFunction(error, response);
        });
};