import mongoose from 'mongoose';

// Interface definition

export interface IOrderState {
    _id: mongoose.Schema.Types.ObjectId,
    state: string,
}

export enum OrderStatusEnum {
    CONFIRMED = 'CONFIRMED',
    UNCONFIRMED = 'UNCONFIRMED',
    DONE = 'DONE',
    CANCELLED = 'CANCELLED',
}