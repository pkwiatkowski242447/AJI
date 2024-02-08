import express from 'express';
import path from 'path';
import { UserModel, UserRole } from '../models/User';
import { IUser } from '../interfaces/User';
import { generalErrorFunction, invalidObjectIdentifier, validationErrorFunction } from '../errors/ErrorHandler';
import { unlink } from 'node:fs';
import { StatusCodes } from 'http-status-codes';
import mongoose from 'mongoose';

// Read methods

export const getAllUsers = async (request : express.Request, response : express.Response) => {
    
    try {
        const usersDocuments = await UserModel.find<IUser>()
        .select(' _id username phoneNumber userImage ')
        .exec();

        if (usersDocuments.length > 0) {
            const customResponse = {
                count: usersDocuments.length,
                users: usersDocuments.map(userDocument => {
                    return {
                        user: {
                            _id: userDocument._id,
                            username: userDocument.username,
                            email: userDocument.email,
                            phoneNumber: userDocument.phoneNumber,
                            userImage: userDocument.userImage,
                        },
                        request: {
                            description: 'HTTP request for getting certain user details.',
                            method: 'GET',
                            url: 'http://localhost:8080/users/' + userDocument._id,
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
    } catch (error) {
        return generalErrorFunction(error, response);
    }
}

export const getUserById = async (request : express.Request, response : express.Response) => {
    const userId = request.params.userId;

    try {
        const userDocument = await UserModel.findById<IUser>(userId)
        .select(' _id username email phoneNumber userImage ')
        .exec();

        if (userDocument) {
            return response
                    .status(StatusCodes.OK)
                    .json(userDocument);
        } else {
            return response
                    .status(StatusCodes.NOT_FOUND)
                    .json({
                        message: `User object with id equal to ${userId} could not be found in the database.`,
                    });
        }
    } catch (error) {
        if (error instanceof mongoose.Error.CastError) {
            return invalidObjectIdentifier(error, response);
        } else {
            return generalErrorFunction(error, response);
        }
    }
}

export const getUserByEmail = async (request : express.Request, response : express.Response) => {
    const email = request.params.email;

    try {
        const userDocument = await UserModel.findOne<IUser>({ email: email })
        .select(' _id username email phoneNumber userImage ')
        .exec();

        if (userDocument) {
            return response
                    .status(StatusCodes.OK)
                    .json(userDocument);
        } else {
            return response
                    .status(StatusCodes.NOT_FOUND)
                    .json({
                        message: `User object with email equal to ${email} could not be found in the database.`,
                    });
        }
    } catch (error) {
        return generalErrorFunction(error, response);
    }
}

export const getUsersByUsername = async (request : express.Request, response : express.Response) => {
    const username = request.params.username;

    try {
        const usersDocuments = await UserModel.find<IUser>({ username: username })
        .select(' _id username email phoneNumber userImage ')
        .exec();

        if (usersDocuments.length > 0) {
            const customResponse = {
                count: usersDocuments.length,
                users: usersDocuments.map(userDocument => {
                    return {
                        user: {
                            _id: userDocument._id,
                            username: userDocument.username,
                            email: userDocument.email,
                            phoneNumber: userDocument.phoneNumber,
                            userImage: userDocument.userImage,
                        },
                        request: {
                            description: 'HTTP request for getting certain user details.',
                            method: 'GET',
                            url: 'http://localhost:8080/users/' + userDocument._id,
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
    } catch (error) {
        return generalErrorFunction(error, response);
    }
}

export const getUserImageByUserId = async (request : express.Request, response : express.Response) => {
    const userId = request.params.userId;

    try {
        const userDocument = await UserModel.findById<IUser>(userId)
        .select(' _id username email phoneNumber userImage ')
        .exec();

        if (userDocument) {
            const userImagePath = userDocument.userImage;
            return response
                    .status(StatusCodes.OK)
                    .sendFile(userImagePath);
        } else {
            return response
                    .status(StatusCodes.NOT_FOUND).json({
                        message: `User with id equal to ${userId} could not be found in the database.`,
                    });
        }
    } catch (error) {
        if (error instanceof mongoose.Error.CastError) {
            return invalidObjectIdentifier(error, response);
        } else {
            return generalErrorFunction(error, response);
        }
    }
};

// Update methods

export const updateUserById = async (request : express.Request, response : express.Response) => {
    const userId = request.params.userId;

    const updateOpts : any = {};

    Object.keys(request.body).forEach(key => {
        updateOpts[key] = request.body[key];
    });

    try {
        const userDocument = await UserModel.findOneAndUpdate<IUser>({ _id: userId }, { $set: updateOpts }, { runValidators: true, new: true })
        .select(' _id username email phoneNumber userImage ')
        .exec();

        if (userDocument) {
            const customResponse = {
                message: `User object with id equal to ${userId} was updated successfully in the database.`, 
                newUser: {
                    _id: userDocument._id,
                    username: userDocument.username,
                    email: userDocument.email,
                    phoneNumber: userDocument.phoneNumber,
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
    } catch (error) {
        if (error instanceof mongoose.Error.ValidationError) {
            return validationErrorFunction(error, response);
        } else {
            return generalErrorFunction(error, response);
        }
    }
}

export const updateUserImageByUserId = async (request : express.Request, response : express.Response) => {
    const userId = request.params.userId;

    if (request.file) {
        const newImage = request.file.path;

        const updateOpts : any = {
            userImage: newImage,
        }
    
        try {
            const userDocument = await UserModel.findOneAndUpdate<IUser>({ _id: userId }, { $set: updateOpts }, { new: false })
            .select(' _id username email phoneNumber userImage ')
            .exec();

            if (userDocument.userImage !== path.resolve(__dirname, '../../uploads/users/default.png')) {
                unlink(userDocument.userImage, (error) => {
                    if (!error) {
                        console.log(`File ${userDocument.userImage} was deleted successfully.`);
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
        } catch (error) {
            if (error instanceof mongoose.Error.CastError) {
                return invalidObjectIdentifier(error, response);
            } else {
                return generalErrorFunction(error, response);
            }
        }
    } else {
        return response
                .status(StatusCodes.BAD_REQUEST)
                .json({
                    message: 'Your new user image was not sent along with request.',
                });
    }
};

// Delete methods

export const deleteClientById = (request : express.Request, response : express.Response) => {
    deleteUserById(request, response, UserRole.CLIENT);
};

export const deleteStaffById = (request : express.Request, response : express.Response) => {
    deleteUserById(request, response, UserRole.STAFF);
};

export const deleteAdminById = (request : express.Request, response : express.Response) => {
    deleteUserById(request, response, UserRole.ADMIN);
};

export const deleteUserById = async (request : express.Request, response : express.Response, userRole: String) => {
    const userId = request.params.userId;

    try {
        const userDocument = await UserModel.findOneAndDelete<IUser>({ _id: userId, role: userRole })
        .select(' _id username email phoneNumber userImage ')
        .exec();

        if (userDocument) {
            const customResponse = {
                message: `User with id equal to ${userId} was deleted successfully from the database.`,
                deletedUser: {
                    _id: userDocument._id,
                    username: userDocument.username,
                    email: userDocument.email,
                    phoneNumber: userDocument.phoneNumber
                }
            };
            if (userDocument.userImage !== path.resolve(__dirname, '../../uploads/users/default.png')) {
                unlink(userDocument.userImage, (error) => {
                    if (!error) {
                        console.log(`File ${userDocument.userImage} was deleted successfully.`);
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
    } catch (error) {
        if (error instanceof mongoose.Error.CastError) {
            return invalidObjectIdentifier(error, response);
        } else {
            return generalErrorFunction(error, response);
        }
    }
}

export const deleteUserImageByUserId = async (request : express.Request, response : express.Response) => {
    const userId = request.params.userId;

    const defaultImage = path.resolve(__dirname, '../../uploads/users/default.png');

    const updateOpts : any = {
        userImage: defaultImage,
    }

    try {
        const userDocument = await UserModel.findOneAndUpdate<IUser>({ _id: userId }, { $set: updateOpts })
        .select(' _id username email phoneNumber userImage ')
        .exec();

        if (userDocument.userImage !== defaultImage) {
            unlink(userDocument.userImage, (error) => {
                if (!error) {
                    console.log(`File ${userDocument.userImage} was deleted successfully.`);
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
    } catch (error) {
        if (error instanceof mongoose.Error.CastError) {
            return invalidObjectIdentifier(error, response);
        } else {
            return generalErrorFunction(error, response);
        }
    }
};