import mongoose from 'mongoose';
import { IItem } from '../interfaces/Item';
import { IOrder } from '../interfaces/Order';
import { ItemSchema } from './Item';

// Schema definition for Order

export const OrderSchema = new mongoose.Schema<IOrder>({
    _id: mongoose.Schema.Types.ObjectId,

    confirmationDate: {
        type: Date,
        required: false,
    },

    orderState: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OrderState',
        required: true,
    },

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },

    products: {
        type: [ ItemSchema ],
        required: true,
        validate: {
            validator: function (products: Array<IItem>) {
                return products.length > 0;
            },
            message: 'Each order must contain at least one product in any quantity.',
        }
    }
}, { strict: true });

// Generating model from Schema
export const OrderModel = mongoose.model<IOrder>('Order', OrderSchema);