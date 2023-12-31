import mongoose from 'mongoose';
import { IOrderState } from '../interfaces/OrderState';

// Schema definition for OrderState

export const OrderStateSchema = new mongoose.Schema<IOrderState>({
    _id: mongoose.Schema.Types.ObjectId,

    state: { 
        type: String, 
        require: true,
        minlength: [5, 'Order state name must be at least 5 characters long.'],
        maxlength:[20, 'Order state name could not be longer than 20 characters.'],
        validate: /[A-Za-z ]/
    }
});

// Generating model from Schema
export const OrderStateModel = mongoose.model<IOrderState>('OrderState', OrderStateSchema);