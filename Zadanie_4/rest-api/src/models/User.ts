import mongoose from 'mongoose';
import path from 'path';
import { IUser } from '../interfaces/User';

// Schema definition for User

export const UserSchema : mongoose.Schema = new mongoose.Schema<IUser>({
    _id: mongoose.Schema.Types.ObjectId,

    username: { 
        type : String, 
        required: true, 
        minlength: [8, 'Username must be at least 8 characters long.'],
        maxlength: [20, 'Username could not be longer than 20 characters.'],
    },
    
    email: { 
        type: String, 
        required: true, 
        unique: true,
        minlength: [5, 'Email must be at least 5 characters long.'],
        maxlength: [75, 'Email could not be longer than 75 characters.'],
        validate: [/(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/, 'Given email does not follow email constraints.'],
    },

    phoneNumber: { 
        type: String, 
        required: true,
        validate: [/^[0-9]{3}-[0-9]{3}-[0-9]{3}$/, 'Phone number does not follow phone number constraints.']
    },

    authentication: {
        type: Object,
        required: true,
        password: { 
            type: String, 
            required: true, 
            select: false,
            minlength: [10, 'Password must be at least 10 characters long.'],
        },
        refreshToken: {
            type: String,
            required: false,
            select: true,
        },
    },

    role: {
        type: String,
        required: true,
        select: true,
        validate: [/ADMIN|CLIENT|STAFF/, 'Given role name is not available.']
    },

    userImage: {
        type: String,
        required: true,
        default: path.resolve(__dirname, '../../uploads/users/default.png'),
        select: true,
    }
}, { strict: true });

// Definition of object containing all users roles.

export const UserRole = {
    ADMIN: 'ADMIN',
    STAFF: 'STAFF',
    CLIENT: 'CLIENT',
}

// Generating model from Schema
export const UserModel = mongoose.model<IUser>('User', UserSchema);