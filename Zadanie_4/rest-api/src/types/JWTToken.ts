import mongoose from 'mongoose';

export type JWTToken = {
    userInformation: {
        _id: mongoose.Schema.Types.ObjectId,
        username: String,
        email: String,
    },
    role: String,
}