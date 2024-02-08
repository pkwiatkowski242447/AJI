import mongoose from 'mongoose';

// Interface defintion

export interface IUser {
    _id: mongoose.Schema.Types.ObjectId,
    username: string,
    email: string,
    phoneNumber: string,
    authentication: {
        password: string,
        refreshToken: String,
    }
    role: string,
    userImage: string,
} 