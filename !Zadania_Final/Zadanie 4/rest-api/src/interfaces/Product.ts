import mongoose from 'mongoose';

// Interface definition

export interface IProduct {
    _id: mongoose.Schema.Types.ObjectId,
    productName: string,
    productDescription: string,
    productPrice: number,
    productWeight: number,
    arrayOfCategories: mongoose.Schema.Types.ObjectId[],
    productCount: number,
    productImage: string,
}