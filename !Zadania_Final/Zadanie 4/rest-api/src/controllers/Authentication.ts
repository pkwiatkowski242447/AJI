import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import path from 'path';
import { unlink } from 'node:fs';

import { UserModel, UserRole } from '../models/User';
import { IUser } from '../interfaces/User';
import { generalErrorFunction, validationErrorFunction } from '../errors/ErrorHandler';
import { StatusCodes } from 'http-status-codes';
import { authorizationErrorFunction, forbiddenErrorFunction } from '../errors/HTTPErrors';

// Create methods

export const createAdmin = async (request : express.Request, response : express.Response) => {
    createUser(request, response, UserRole.ADMIN);
}

export const createStaff = async (request : express.Request, response : express.Response) => {
    createUser(request, response, UserRole.STAFF);
}

export const createClient = async (request : express.Request, response : express.Response) => {
    createUser(request, response, UserRole.CLIENT);
}

const createUser = async (request : express.Request, response : express.Response, userRole : String) => {
    
    const userData = JSON.parse(request.body.userData);

    UserModel.find<IUser>({ email: userData.email })
        .exec()
        .then(existingUser => {
            if (existingUser.length != 0) {
                if (request.file && request.file.path !== path.resolve(__dirname, '../../uploads/users/default.png')) {
                    unlink(request.file.path, (error) => {
                        console.log('Some error occured when file was being deleted: ' + error.message);
                    });
                }
                return response
                        .status(StatusCodes.CONFLICT)
                        .json({
                            message: `User with email equal to ${userData.email} is already in the database.`,
                        });
            } else {
                bcrypt.hash(userData.password, 10, (error, passwordHash) => {
                    if (error) {
                        return generalErrorFunction(error, response);
                    } else {
                        const newUser = new UserModel({
                            _id: new mongoose.Types.ObjectId(),
                            username: userData.username,
                            email: userData.email,
                            phoneNumber: userData.phoneNumber,
                            authentication: {
                                password: passwordHash,
                            },
                            role: userRole,
                        });

                        if (request.file) {
                            newUser.userImage = request.file.path;
                        }
            
                        newUser.save()
                            .then(newUser => {
                                const customResponse = {
                                    newUser: {
                                        _id: newUser._id,
                                        username: newUser.username,
                                        email: newUser.email,
                                        phoneNumber: newUser.phoneNumber,
                                    },
                                    request: {
                                        description: 'HTTP request for getting details of created user account.',
                                        method: 'GET',
                                        url: 'http://localhost:8080/users/' + newUser._id,
                                    },
                                }
                                return response
                                        .status(StatusCodes.CREATED)
                                        .json(customResponse);
                            })
                            .catch(error => {
                                if (newUser.userImage !== '../../uploads/users/default.png') {
                                    unlink(newUser.userImage, (error) => {
                                        console.log('Some error occured when file was being deleted: ' + error.message);
                                    });
                                }
                                if (error.name === 'ValidationError') {
                                    return validationErrorFunction(error, response);
                                } else {
                                    return generalErrorFunction(error, response);
                                }
                            });
                    }
                });
            }
        })
        .catch(error => {
            return generalErrorFunction(error, response);
        });
}

// Login method

export const loginUser = async (request : express.Request, response : express.Response) => {

    try {
        const userDocument = await UserModel.findOne<IUser>({ email: request.body.email })
        .select(' _id username email phoneNumber authentication ')
        .exec();

        if (userDocument) {
            bcrypt.compare(request.body.password, userDocument.authentication.password, async function (error, result) {
                if (error) {
                    return generalErrorFunction(error, response);
                } else if (result) {
                    const accessToken = generateAccessToken(userDocument);
                    const refreshToken = generateRefreshToken(userDocument);

                    userDocument.authentication.refreshToken = refreshToken;
                    UserModel.updateOne({ _id: userDocument._id }, userDocument)
                        .exec()

                    response.cookie('jwtreftoken', refreshToken, { 
                        httpOnly: true,
                        sameSite: "none",
                        secure: true,
                        maxAge: 1000 * 60 * 45,
                    });

                    return response
                            .status(StatusCodes.OK)
                            .json({
                                message: 'Authentication succedded.',
                                accessToken: accessToken,
                            });
                } else {
                    return response
                            .status(StatusCodes.UNAUTHORIZED)
                            .json({
                                message: 'Authentication failed since email or password is incorrect.',
                            });
                }
            });
        } else {
            return response
                    .status(StatusCodes.UNAUTHORIZED)
                    .json({
                        message: 'Authentication failed since email or password is incorrect.',
                    });
        }
    } catch (error) {
        return generalErrorFunction(error, response);
    }
};

// Refresh access token method

export const useRefreshToken = async (request : express.Request, response : express.Response) => {
    const cookies = request.cookies;

    if (cookies?.jwtreftoken) {
        const refreshToken = cookies.jwtreftoken;

        try {
            const userDocument = await UserModel.findOne<IUser>({ 'authentication.refreshToken': refreshToken })
            .select(' _id username email role')
            .exec();

            if (!userDocument) {
                return forbiddenErrorFunction(response);
            } else {
                jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (error : Error) => {
                    if (error) {
                        return forbiddenErrorFunction(response);
                    } else {
                        const accessToken = generateAccessToken(userDocument);
                        return response
                                .status(StatusCodes.OK)
                                .json({
                                    message: 'Access token has been refreshed.',
                                    accessToken: accessToken,
                                });
                    }
                });
            }
        } catch (error) {
            return generalErrorFunction(error, response);
        }
    } else {
        return authorizationErrorFunction(response);
    }
};

// Delete refresh token method

export const deleteRefreshToken = async (request : express.Request, response : express.Response) => {
    const cookies = request.cookies;
    if (cookies?.jwtreftoken) {
        const refreshToken = cookies.jwtreftoken;

        try {
            const userDocument = await UserModel.findOne<IUser>({ 'authentication.refreshToken': refreshToken })
            .exec()

            if (userDocument) {
                delete userDocument.authentication.refreshToken;

                UserModel.updateOne<IUser>({ _id: userDocument._id }, userDocument)
                    .exec()
            }
            return clearCookieAndSendResponse(response);
        } catch (error) {
            return generalErrorFunction(error, response);
        }
    } else {
        return response
                .status(StatusCodes.OK)
                .json({
                    message: 'Operation was successful.',
                });
    }
};

function clearCookieAndSendResponse(response : express.Response) {
    response.clearCookie('jwtreftoken', { 
        httpOnly: true,
        sameSite: "none",
        secure: true,
        maxAge: 1000 * 60 * 45,
    });

    return response
            .status(StatusCodes.OK)
            .json({
                message: 'Operation was successful.',
            });
}

function generateAccessToken(user : IUser) : String {
    const accessToken = jwt.sign({
        userInformation: {
            _id: user._id,
            username: user.username,
            email: user.email,
        },
        role: user.role,
    }, 
    process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '24h',
    });

    return accessToken;
}

function generateRefreshToken(user : IUser) : String {
    const refreshToken = jwt.sign({
        userInformation: {
            _id: user._id,
            username: user.username,
            email: user.email,
        }
    },
    process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: '45m',
    });

    return refreshToken;
}