import express from 'express';
import mongoose from 'mongoose';
import { CategoryModel } from '../models/Category';
import { ICategory } from '../interfaces/Category';
import { generalErrorFunction, validationErrorFunction } from '../errors/ErrorHandler';

// Create methods

export const createCategory = async (request : express.Request, response : express.Response) => {
    const newCategory = new CategoryModel({
        _id: new mongoose.Types.ObjectId,
        categoryName: request.body.categoryName,
    });

    newCategory.save()
        .then(newCategory => {
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
            return response.status(201).json(customResponse);
        })
        .catch(error => {
            if (error.name === 'ValidationError') {
                return validationErrorFunction(error, response);
            } else {
                return generalErrorFunction(error, response);
            }
        });
};

// Read methods

export const getAllCategories = async (request : express.Request, response : express.Response) => {
    CategoryModel.find<ICategory>()
        .select('_id categoryName')
        .exec()
        .then(documents => {
            if (documents.length > 0) {
                const customResponse = {
                    count: documents.length,
                    categories: documents.map(document => {
                        return {
                            category: {
                                _id: document._id,
                                categoryName: document.categoryName,
                            },
                            request: {
                                description: 'HTTP request for getting certain category details.',
                                method: 'GET',
                                url: 'http://localhost:8080/categories/' + document._id,
                            },
                        }
                    }),
                }
                return response.status(200).json(customResponse);
            } else {
                return response.status(404).json({
                    message: 'No documents for categories were found in the database.',
                });
            }
        })
        .catch(error => {
            return generalErrorFunction(error, response);
        });
};

export const getCategoryById = async (request : express.Request, response : express.Response) => {
    const categoryId = request.params.categoryId;
    CategoryModel.findById<ICategory>(categoryId)
        .select('_id categoryName')
        .exec()
        .then(document => {
            if (document) {
                return response.status(200).json(document);
            } else {
                return response.status(404).json({
                    message: `Category object with id equal to ${categoryId} could not be found in the database.`,
                });
            }
        })
        .catch(error => {
            return generalErrorFunction(error, response);
        });
};

// Update methods

export const updateCategoryById = async (request : express.Request, response : express.Response) => {
    const categoryId = request.params.categoryId;

    const updateOpts : any = {};

    Object.keys(request.body).forEach(key => {
        updateOpts[key] = request.body[key];
    });

    CategoryModel.findOneAndUpdate<ICategory>({ _id: categoryId }, { $set: updateOpts }, { runValidators: true })
        .exec()
        .then(document => {
            if (document) {
                const customResponse = {
                    message: `Category object with id equal to ${categoryId} was updated successfully in the database.`,
                    oldCategory: {
                        _id: document._id,
                        categoryName: document.categoryName,
                    },
                    request: {
                        description: 'HTTP request for getting the updated version of the category.',
                        method: 'GET',
                        url: 'http://localhost:8080/categories/' + categoryId,
                    }
                }
                return response.status(200).json(customResponse);
            } else {
                return response.status(400).json({
                    message: `There is no category object with id equal to ${categoryId} in the database.`,
                });
            }
        })
        .catch(error => {
            if (error.name === 'ValidationError') {
                return validationErrorFunction(error, response);
            } else {
                return generalErrorFunction(error, response);
            }
        });
};

// Delete methods

export const deleteCategoryById = async (request : express.Request, response : express.Response) => {
    const categoryId = request.params.categoryId;
    
    CategoryModel.findOneAndDelete<ICategory>({ _id: categoryId })
        .select(' _id categoryName')
        .exec()
        .then(document => {
            if (document) {
                const customResponse = {
                    message: `Category object with id: ${categoryId} was deleted successfully from the database.`,
                    removedCategory: {
                        _id: document._id,
                        categoryName: document.categoryName,
                    }
                };
                return response.status(200).json(customResponse);
            } else {
                return response.status(404).json({
                    message: `There is no category object with id equal to ${categoryId} in the database.`,
                });
            }
        })
        .catch(error => {
            return generalErrorFunction(error, response);
        });
};