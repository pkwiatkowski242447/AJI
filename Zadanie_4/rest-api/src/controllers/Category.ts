import express from 'express';
import mongoose from 'mongoose';
import { StatusCodes } from 'http-status-codes';

import { CategoryModel, CategorySchema } from '../models/Category';
import { ICategory } from '../interfaces/Category';
import { generalErrorFunction, invalidObjectIdentifier, validationErrorFunction } from '../errors/ErrorHandler';

// Create methods

export const createCategory = async (request : express.Request, response : express.Response) => {
    const newCategory = new CategoryModel({
        _id: new mongoose.Types.ObjectId,
        categoryName: request.body.categoryName,
    });

    try {
        newCategory.save();
    } catch (error) {
        if (error instanceof mongoose.Error.ValidationError) {
            return validationErrorFunction(error, response);
        } else {
            return generalErrorFunction(error, response);
        }
    }

    const customResponse = {
        newCategory: {
            _id: newCategory._id,
            categoryName: newCategory.categoryName,
        },
        request: {
            description: 'HTTP request for getting details of created category.',
            type: 'GET',
            url: 'http://localhost:8080/categories/' + newCategory._id,
        },
    }
    return response
            .status(StatusCodes.CREATED)
            .json(customResponse);
};

// Read methods

export const getAllCategories = async (request : express.Request, response : express.Response) => {
    try {
        const categoriesDocuments = await CategoryModel.find<ICategory>()
        .select('_id categoryName')
        .exec();

        if (categoriesDocuments.length > 0) {
            const customResponse = {
                count: categoriesDocuments.length,
                categories: categoriesDocuments.map(categoryDocument => {
                    return {
                        category: {
                            _id: categoryDocument._id,
                            categoryName: categoryDocument.categoryName,
                        },
                        request: {
                            description: 'HTTP request for getting certain category details.',
                            method: 'GET',
                            url: 'http://localhost:8080/categories/' + categoryDocument._id,
                        },
                    }
                }),
            };

            return response
                        .status(StatusCodes.OK)
                        .json(customResponse);
        } else {
            return response
                    .status(StatusCodes.NOT_FOUND)
                    .json({
                        message: 'No documents for categories were found in the database.',
                    });
        }
    } catch (error) {
        return generalErrorFunction(error, response);
    }
};

export const getCategoryById = async (request : express.Request, response : express.Response) => {
    const categoryId = request.params.categoryId;

    try {
        const categoryDocument = await CategoryModel.findById<ICategory>(categoryId)
        .select('_id categoryName')
        .exec();

        if (categoryDocument) {
            return response
                    .status(StatusCodes.OK)
                    .json(categoryDocument);
        } else {
            return response
                    .status(StatusCodes.NOT_FOUND)
                    .json({
                        message: `Category object with id equal to ${categoryId} could not be found in the database.`,
                    });
        }
    } catch (error) {
        if (error instanceof mongoose.Error.CastError) {
            return invalidObjectIdentifier(error, response);
        } else {
            return generalErrorFunction(error, response);
        }
    }
};

// Update methods

export const updateCategoryById = async (request : express.Request, response : express.Response) => {
    const categoryId = request.params.categoryId;

    const nonExistentKeys : Array<Object> = [];
    const updateOpts : any = {};

    Object.keys(request.body).forEach(key => {
        if (!(key in CategorySchema.obj)) {
            nonExistentKeys.push({
                message: `Category could not be update with property ${key}.`,
                cause: `Key ${key} could not be found in category document schema.`,
            });
        } else {
            updateOpts[key] = request.body[key];   
        }
    });

    try {
        const categoryDocument = await CategoryModel.findOneAndUpdate<ICategory>({ _id: categoryId }, { $set: updateOpts }, { runValidators: true, new: true })
        .select(' _id categoryName')
        .exec();

        if (categoryDocument) {
            const customResponse = {
                message: `Category object with id equal to ${categoryId} was updated successfully in the database.`,
                newCategory: {
                    _id: categoryDocument._id,
                    categoryName: categoryDocument.categoryName,
                },
                request: {
                    description: 'HTTP request for getting the updated version of the category.',
                    method: 'GET',
                    url: 'http://localhost:8080/categories/' + categoryId,
                }
            }
            return response
                    .status(StatusCodes.OK)
                    .json(customResponse);
        } else {
            return response
                    .status(StatusCodes.BAD_REQUEST)
                    .json({
                        message: `There is no category object with id equal to ${categoryId} in the database.`,
                    });
        }
    } catch (error) {
        if (error instanceof mongoose.Error.ValidationError) {
            return validationErrorFunction(error, response);
        } else {
            return generalErrorFunction(error, response);
        }
    }
};

// Delete methods

export const deleteCategoryById = async (request : express.Request, response : express.Response) => {
    const categoryId = request.params.categoryId;
    
    try {
        const categoryDocument = await CategoryModel.findOneAndDelete<ICategory>({ _id: categoryId })
        .select(' _id categoryName')
        .exec();

        if (categoryDocument) {
            const customResponse = {
                message: `Category object with id: ${categoryId} was deleted successfully from the database.`,
                removedCategory: {
                    _id: categoryDocument._id,
                    categoryName: categoryDocument.categoryName,
                }
            };
            return response
                    .status(StatusCodes.OK)
                    .json(customResponse);
        } else {
            return response
                    .status(StatusCodes.NOT_FOUND)
                    .json({
                        message: `There is no category object with id equal to ${categoryId} in the database.`,
                    });
        }
    } catch (error) {
        if (error instanceof mongoose.Error.CastError) {
            return invalidObjectIdentifier(error, response);
        } else {
            return generalErrorFunction(error, response);
        }
    }
};