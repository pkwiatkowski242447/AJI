import mongoose from 'mongoose';
import path from 'path';
import { IProduct } from '../interfaces/Product';

// Schema definition for Product 

export const ProductSchema = new mongoose.Schema<IProduct>({
    _id: mongoose.Schema.Types.ObjectId,

    productName: { 
        type : String, 
        required : true,
        minlenght: [5, 'Product name must be at least 5 characters long.'],
        maxlength: [40, 'Proudct name could not be longer than 40 characters.'],
    },
    
    productDescription: { 
        type : String, 
        required : true,
        maxlength: [120, 'Proudct description could not be longer than 120 characters.'],
    },
    
    productPrice: { 
        type : Number, 
        required : true,
        min: [0, 'Product price could not be negative.'],
    },

    productWeight: { 
        type : Number, 
        required : true,
        min: [0, 'Product weight could not be negative.'],
    },

    arrayOfCategories: { 
        type: [ mongoose.Schema.Types.ObjectId ], 
        ref: 'Category',
        validate: {
            validator: function(arrayOfCategories : Array<mongoose.Schema.Types.ObjectId>) {
                return arrayOfCategories.length > 0;
            },
            message: 'Each product must belong to at least one category.',
        }
    },

    productCount: {
        type: Number,
        required: true,
        min: [0, 'Product count could not be below zero.'],
    },

    productImage: {
        type: String,
        required: false,
        default: path.resolve(__dirname, '../../uploads/products/default.png'),
    },
});

// Generating model from Schema
export const ProductModel = mongoose.model<IProduct>('Product', ProductSchema);