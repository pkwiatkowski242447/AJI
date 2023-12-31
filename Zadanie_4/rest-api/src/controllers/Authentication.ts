import express, { request } from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserModel, UserRole } from '../models/User';
import { IUser } from '../interfaces/User';
import { generalErrorFunction, validationErrorFunction } from '../errors/ErrorHandler';
import { unlink } from 'node:fs';
import path from 'path';

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
                        console.log('Some error occured when file was being deleted.');
                    });
                }
                return response.status(409).json({
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
                                        userImage: newUser.userImage,
                                    },
                                    request: {
                                        description: 'HTTP request for getting details of created user account.',
                                        method: 'GET',
                                        url: 'http://localhost:8080/users/' + newUser._id,
                                    },
                                }
                                return response.status(201).json(customResponse);
                            })
                            .catch(error => {
                                if (newUser.userImage !== '../../uploads/users/default.png') {
                                    unlink(newUser.userImage, (error) => {
                                        console.log('Some error occured when file was being deleted.');
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
    UserModel.findOne<IUser>({ email: request.body.email })
        .select(' _id username email phoneNumber authentication ')
        .exec()
        .then((user) => {
            if (user) {
                bcrypt.compare(request.body.password, user.authentication.password, async function (error, result) {
                    if (error) {
                        return generalErrorFunction(error, response);
                    } else if (result) {
                        const accessToken = generateAccessToken(user);
                        const refreshToken = generateRefreshToken(user);

                        user.authentication.refreshToken = refreshToken;
                        UserModel.updateOne({ _id: user._id }, user)
                            .exec()
                            .catch(error => {
                                return generalErrorFunction(error, response);
                            });

                        response.cookie('jwtreftoken', refreshToken, { 
                            httpOnly: true,
                            sameSite: "none",
                            secure: true,
                            maxAge: 1000 * 60 * 45,
                        });

                        response.setHeader('Authorization', `Bearer ${accessToken}`).status(200).json({
                            message: 'Authentication succedded.',
                        });
                    } else {
                        return response.status(401).json({
                            message: 'Authentication failed since email or password is incorrect.',
                        });
                    }
                });
            } else {
                return response.status(401).json({
                    message: 'Authentication failed since email or password is incorrect.',
                });
            }
        })
        .catch(error => {
            return generalErrorFunction(error, response);
        });
};

// Refresh access token method

export const useRefreshToken = (request : express.Request, response : express.Response) => {
    const cookies = request.cookies;

    if (cookies?.jwtreftoken) {
        const refreshToken = cookies.jwtreftoken;

        UserModel.findOne<IUser>({ 'authentication.refreshToken': refreshToken })
            .exec()
            .then(existingUser => {
                if (!existingUser) {
                    return forbiddenErrorFunction(response);
                }
            })
            .catch(error => {
                return generalErrorFunction(error, response);
            });

        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (error : Error, user : IUser) => {
            if (error) {
                return forbiddenErrorFunction(response);
            } else {
                const accessToken = generateAccessToken(user);
                response.setHeader('Authorization', `Bearer ${accessToken}`);
                return response.status(200).json({
                    message: 'Access token has been refreshed.',
                });
            }
        });
    } else {
        return authroizationErrorFunction(response);
    }
};

// Delete refresh token method

export const deleteRefreshToken = (request : express.Request, response : express.Response) => {
    const cookies = request.cookies;
    if (cookies?.jwtreftoken) {
        const refreshToken = cookies.jwtreftoken;

        UserModel.findOne<IUser>({ 'authentication.refreshToken': refreshToken })
            .exec()
            .then(existingUser => {
                if (existingUser) {
                    delete existingUser.authentication.refreshToken;

                    UserModel.updateOne<IUser>({ _id: existingUser._id }, existingUser)
                        .exec()
                        .catch(error => {
                            throw error;
                        });
                }
                return clearCookieAndSendResponse(response);
            })
            .catch(error => {
                return generalErrorFunction(error, response);
            });
    } else {
        return response.status(200).json({
            message: 'Operation was successful.',
        });
    }
};

function authroizationErrorFunction(response : express.Response) {
    return response.status(401).json({
        message: 'Authorization failed.',
    });
}

function forbiddenErrorFunction(response : express.Response) {
    return response.status(403).json({
        message: 'You are not authorized to perform this operation.',
    })
}

function clearCookieAndSendResponse(response : express.Response) {
    response.clearCookie('jwtreftoken', { 
        httpOnly: true,
        sameSite: "none",
        secure: true,
        maxAge: 1000 * 60 * 45,
    });

    return response.status(200).json({
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
        expiresIn: '15m',
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