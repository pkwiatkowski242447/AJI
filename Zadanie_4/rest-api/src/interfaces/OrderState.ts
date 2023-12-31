import mongoose from 'mongoose';

// Interface definition

export interface IOrderState {
    _id: mongoose.Schema.Types.ObjectId,
    state: string,
}