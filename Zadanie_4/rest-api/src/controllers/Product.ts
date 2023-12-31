import express from 'express';
import mongoose from 'mongoose';
import path from 'path';
import { ProductModel } from '../models/Product';
import { IProduct } from '../interfaces/Product';
import { CategoryModel } from '../models/Category';
import { ICategory } from '../interfaces/Category';
import { DataIncorrectError } from '../errors/DataIncorrectError';
import { generalErrorFunction, validationErrorFunction } from '../errors/ErrorHandler';
import { unlink } from 'node:fs';

// Create methods

export const createProduct = async (request : express.Request, response : express.Response) => {

    const productData = JSON.parse(request.body.productData);

    try {
        await checkIfCategoriesExist(request);
    } catch (error) {
        return response.status(400).json({
            message: error.message,
            reasons: error.reasons,
        });
    }

    const newProduct = new ProductModel({
        _id: new mongoose.Types.ObjectId(),
        productName: productData.productName,
        productDescription: productData.productDescription,
        productPrice: productData.productPrice,
        productWeight: productData.productWeight,
        arrayOfCategories: productData.arrayOfCategories,
        productCount: productData.productCount,
    });

    if (request.file) {
        newProduct.productImage = request.file.path;
    }

    newProduct.save()
        .then(newProduct => {
            const customResponse = {
                newProduct: {
                    _id: newProduct._id,
                    productName: newProduct.productName,
                    productDescription: newProduct.productDescription,
                    productPrice: newProduct.productPrice,
                    productWeight: newProduct.productWeight,
                    arrayOfCategories: newProduct.arrayOfCategories,
                    productCount: newProduct.productCount,
                    productImage: newProduct.productImage,
                },
                requests: {
                    details: {
                        description: 'HTTP request for getting details of created product.',
                        method: 'GET',
                        url: 'http://localhost:8080/products/' + newProduct._id,
                    },
                    image: {
                        description: 'HTTP request for getting image of created product.',
                        method: 'GET',
                        url: 'http://localhost:8080/products/' + newProduct._id + '/image',
                    }
                }
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

export const getAllProducts = async (request : express.Request, response : express.Response) => {
    ProductModel.find<IProduct>()
        .select(' _id productName productDescription productPrice productWeight arrayOfCategories productCount productImage')
        .exec()
        .then(documents => {
            if (documents.length > 0) {
                const customResponse = {
                    count: documents.length,
                    products: documents.map(document => {
                        return {
                            product: {
                                _id: document._id,
                                productName: document.productName,
                                productDescription: document.productDescription,
                                productPrice: document.productPrice,
                                productWeight: document.productWeight,
                                arrayOfCategories: document.arrayOfCategories,
                                productCount: document.productCount,
                                productImage: document.productImage,
                            },
                            requests: {
                                details: {
                                    description: 'HTTP request for getting certain user details.',
                                    method: 'GET',
                                    url: 'http://localhost:8080/products/' + document._id,
                                },
                                image: {
                                    description: 'HTTP request for getting product image.',
                                    method: 'GET',
                                    url: 'http://localhost:8080/products/' + document._id + '/image',
                                },
                            },
                        }
                    }),
                };
                return response.status(200).json(customResponse);
            } else {
                return response.status(404).json({
                    message: 'No documents for products were found in the database.',
                });
            }
        })
        .catch(error => {
            return generalErrorFunction(error, response);
        });
};

export const getProductById = async (request : express.Request, response : express.Response) => {
    const productId = request.params.productId;

    ProductModel.findById<IProduct>(productId)
        .select(' _id productName productDescription productPrice productWeight arrayOfCategories productCount productImage')
        .populate( 'arrayOfCategories', ' _id categoryName ' )
        .exec()
        .then(document => {
            if (document) {
                return response.status(200).json({
                    ...document,
                    requests: {
                        image: {
                            description: 'HTTP request for getting product image.',
                            method: 'GET',
                            url: 'http://localhost:8080/products/' + document._id + '/image',
                        }
                    }
                });
            } else {
                return response.status(404).json({
                    message: `Product object with id equal to ${productId} could not be found in the database.`,
                });
            }
        })
        .catch(error => {
            return generalErrorFunction(error, response);
        });
};

export const getProductsByCategoryId = async (request : express.Request, response : express.Response) => {
    const categoryId = request.params.categoryId;

    ProductModel.find<IProduct>({ 'arrayOfCategories._id': categoryId})
        .select(' _id productName productDescription productPrice productWeight arrayOfCategories productCount productImage ')
        .exec()
        .then(documents => {
            if (documents.length > 0) {
                const customResponse = {
                    count: documents.length,
                    products: documents.map(document => {
                        return {
                            product: {
                                _id: document._id,
                                productName: document.productName,
                                productDescription: document.productDescription,
                                productPrice: document.productPrice,
                                productWeight: document.productWeight,
                                arrayOfCategories: document.arrayOfCategories,
                                productCount: document.productCount,
                                productImage: document.productImage,
                            },
                            requests: {
                                details: {
                                    description: 'HTTP request for getting certain products details.',
                                    method: 'GET',
                                    url: 'http://localhost:8080/products/' + document._id,
                                },
                                image: {
                                    description: 'HTTP request for getting product image.',
                                    method: 'GET',
                                    url: 'http://localhost:8080/products/' + document._id + '/image',
                                }
                            }
                        }
                    }),
                };
                return response.status(200).json(customResponse);
            } else {
                return response.status(404).json({
                    message: `No document for products with category which id equals ${categoryId} were found in the database.`,
                });
            }
        })
        .catch(error => {
            return generalErrorFunction(error, response);
        });
};

export const getProductImageByProductId = (request : express.Request, response : express.Response) => {
    const productId = request.params.productId;

    ProductModel.findById<IProduct>(productId)
        .select(' _id productName productDescription productPrice productWeight arrayOfCategories productCount productImage ')
        .exec()
        .then(existingProduct => {
            if (existingProduct) {
                const productImagePath = existingProduct.productImage;
                return response.status(200).sendFile(productImagePath);
            } else {
                return response.status(404).json({
                    message: `Product with id equal to ${productId} could not be found in the database.`,
                });
            }
        })
        .catch(error => {
            return generalErrorFunction(error, response);
        });
};

// Update methods

export const updateProductById = async (request : express.Request, response : express.Response) => {

    try {
        await checkIfCategoriesExist(request);
    } catch (error) {
        return response.status(400).json({
            message: error.message,
            reasons: error.reasons,
        });
    }

    const productId = request.params.productId;
    const updateOpts : any = {};

    Object.keys(request.body).forEach(key => {
        updateOpts[key] = request.body[key];
    });

    ProductModel.findOneAndUpdate<IProduct>({ _id: productId }, { $set: updateOpts }, { runValidators: true })
        .select(' _id productName productDescription productPrice productWeight arrayOfCategories productCount ')
        .exec()
        .then(document => {
            if (document) {
                const customResponse = {
                    message: `Product object with id equal to ${productId} was updated successfully in the database.`,
                    oldProduct: {
                        _id: document._id,
                        productName: document.productName,
                        productDescription: document.productDescription,
                        productPrice: document.productPrice,
                        productWeight: document.productWeight,
                        arrayOfCategories: document.arrayOfCategories,
                        productCount: document.productCount,
                    },
                    request: {
                        description: 'HTTP request for getting the updated version of the product.',
                        method: 'GET',
                        url: 'http://localhost:8080/products/' + document._id,
                    }
                };
                return response.status(200).json(customResponse);
            } else {
                return response.status(400).json({
                    message: `There is no product object with id equal to ${productId} in the database.`,
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

export const updateProductImageByProductId = (request : express.Request, response : express.Response) => {
    const productId = request.params.productId;

    if (request.file) {
        console.log(request.file.path);
        const newImage = request.file.path;

        const updateOpts : any = {
            productImage: newImage,
        }

        ProductModel.findOneAndUpdate<IProduct>({ _id: productId }, { $set: updateOpts })
            .exec()
            .then(document => {
                if (document.productImage !== path.resolve(__dirname, '../../uploads/products/default.png')) {
                    unlink(document.productImage, (error) => {
                        if (!error) {
                            console.log(`File ${document.productImage} was deleted successfully.`);
                        } else {
                            console.log(error.message);
                        }
                    });
                }
                return response.status(200).json({
                    message: 'Product image was updated successfully.',
                    userImage: newImage,
                });
            })
            .catch(error => {
                return generalErrorFunction(error, response);
            });
    } else {
        return response.status(400).json({
            message: 'Your new product image was not sent along with request.',
        });
    }
};

// Delete methods

export const deleteProductById = async (request : express.Request, response : express.Response) => {
    const productId = request.params.productId;

    ProductModel.findOneAndDelete<IProduct>({ _id: productId })
        .select(' _id productName productDescription productPrice productWeight arrayOfCategories productCount productImage ')
        .exec()
        .then(document => {
            if (document) {
                const customResponse = {
                    message: `Product with id equal to ${productId} was deleted successfully from the database.`,
                    removedProduct: {
                        _id: document._id,
                        productName: document.productName,
                        productDescription: document.productDescription,
                        productPrice: document.productPrice,
                        productWeight: document.productWeight,
                        arrayOfCategories: document.arrayOfCategories,
                        productCount: document.productCount,
                    },
                };
                if (document.productImage !== path.resolve(__dirname, '../../uploads/products/default.png')) {
                    unlink(document.productImage, (error) => {
                        if (!error) {
                            console.log(`File ${document.productImage} was deleted successfully.`);
                        } else {
                            console.log(error.message);
                        }
                    })
                }
                return response.status(200).json(customResponse);
            } else {
                return response.status(400).json({
                    message: `There is no product object with id equal to ${productId} in the database.`,
                });
            }
        })
        .catch(error => {
            return generalErrorFunction(error, response);
        });
};

export const deleteProductImageByProductId = (request : express.Request, response : express.Response) => {
    const productId = request.params.productId;

    const defaultImage = path.resolve(__dirname, '../../uploads/products/default.png');

    const updateOpts : any = {
        productImage: defaultImage,
    }

    ProductModel.findOneAndUpdate<IProduct>({ _id: productId }, { $set: updateOpts })
        .exec()
        .then(document => {
            if (document.productImage !== defaultImage) {
                unlink(document.productImage, (error) => {
                    if (!error) {
                        console.log(`File ${document.productImage} was deleted successfully.`);
                    } else {
                        console.log(error.message);
                    }
                });
                return response.status(200).json({
                    message: 'Product image was deleted successfully.',
                    userImage: defaultImage,
                });
            } else {
                return response.status(400).json({
                    message: 'It is not possible to remove default product image.',
                });
            }
        })
        .catch(error => {
            return generalErrorFunction(error, response);
        });
};

async function checkIfCategoriesExist(request : express.Request) {
    const categoryErrors : Array<String> = [];

    if (request.body.arrayOfCategories) {
        for (let i = 0; i < request.body.arrayOfCategories.length; i++) {
            const categoryId = request.body.arrayOfCategories[i]; 
            const existingCategory = await CategoryModel.findById<ICategory>(categoryId);
            if (!existingCategory) {
                categoryErrors.push(`Category with id equal to ${categoryId} could not be found in the database.`);
            };
        }
    
        if (categoryErrors.length != 0) {
            throw new DataIncorrectError({
                category: categoryErrors
            });
        };
    }
}