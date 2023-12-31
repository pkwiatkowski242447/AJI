import mongoose from 'mongoose';
import { IItem } from '../interfaces/Item';

export const ItemSchema = new mongoose.Schema<IItem>({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    productCount: {
        type: Number,
        required: true,
        min: [1, 'It is not possible to order less than one product.'],
    },
});

export const ItemModel = mongoose.model('Item', ItemSchema);