import mongoose from 'mongoose';
import { IItem } from './Item';

// Interface definition

export interface IOrder extends Document {
    _id: mongoose.Schema.Types.ObjectId,
    confirmationDate?: Date,
    orderState: mongoose.Schema.Types.ObjectId,
    user: mongoose.Schema.Types.ObjectId,
    products: Array<IItem>
}