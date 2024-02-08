import mongoose from 'mongoose';
import { ICategory } from '../interfaces/Category';

// Schema definition for Category

export const CategorySchema = new mongoose.Schema<ICategory>({
    _id: mongoose.Schema.Types.ObjectId,

    categoryName: { 
        type : String, 
        require: true, 
        unique: true,
        minlength: [3, 'Category name must be at least 3 characters long.'],
        maxlength: [20, 'Category name could not be longer than 20 characters.'],
    }
}, { strict: true });

// Generatring model from Schema 
export const CategoryModel = mongoose.model<ICategory>('Category', CategorySchema);