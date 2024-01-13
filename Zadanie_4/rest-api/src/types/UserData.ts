import mongoose from 'mongoose'

export type UserData = {
    user: {
        _id: mongoose.Schema.Types.ObjectId,
        username: String,
        email: String,
    }
    role: String,
}