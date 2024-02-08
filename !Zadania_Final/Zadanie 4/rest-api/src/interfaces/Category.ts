import mongoose from 'mongoose';

// Interface definition

export interface ICategory {
    _id: mongoose.Schema.Types.ObjectId,
    categoryName: string,
}