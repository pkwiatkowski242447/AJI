import express, { request } from 'express';
import mongoose from 'mongoose';
import { OrderModel, OrderSchema } from '../models/Order';
import { IOrder } from '../interfaces/Order';
import { OrderStateModel } from '../models/OrderState';
import { IOrderState } from '../interfaces/OrderState';
import { OrderStatusEnum } from '../interfaces/OrderState';
import { UserModel } from '../models/User';
import { IUser } from '../interfaces/User';
import { ProductModel } from '../models/Product';
import { IProduct } from '../interfaces/Product';
import { DataIncorrectError } from '../errors/DataIncorrectError';
import { generalErrorFunction, invalidObjectIdentifier, validationErrorFunction } from '../errors/ErrorHandler';
import { StatusCodes } from 'http-status-codes';
import jsonpatch from 'jsonpatch';
import { IItem } from 'interfaces/Item';
import { ProductInputDTO } from 'types/ProductInputDTO';

// Create methods

export const createOrder = async (request: express.Request, response: express.Response) => {

    try {
        await checkIfDataExist(request);
    } catch (error) {
        return response
            .status(StatusCodes.BAD_REQUEST)
            .json({
                message: error.message,
                reasons: error.reasons,
            });
    }

    const session = await mongoose.startSession();

    await session.withTransaction(async () => {
        if (request.body.products) {
            for (let i = 0; i < request.body.products.length; i++) {
                const productId = request.body.products[i].productId;
                await ProductModel.findById<IProduct>(productId)
                    .session(session)
                    .exec()
                    .then(async (existingProduct) => {
                        existingProduct.productCount -= request.body.products[i].productCount;
                        await ProductModel.updateOne({ _id: productId }, { $set: existingProduct }, { runValidators: true }).session(session);
                    })
                    .catch(error => {
                        throw error;
                    });
            }
        }

        const orderState = await OrderStateModel.findOne<IOrderState>({ state: OrderStatusEnum.UNCONFIRMED });

        const newOrder = new OrderModel({
            _id: new mongoose.Types.ObjectId(),
            confirmationDate: request.body.confirmationDate,
            orderState: orderState._id,
            user: request.body.user,
            products: request.body.products,
        });

        newOrder.save()
            .then((newOrder) => {
                const customResponse = {
                    newOrder: {
                        _id: newOrder._id,
                        confirmationDate: newOrder.confirmationDate,
                        orderState: newOrder.orderState,
                        user: newOrder.user,
                        products: newOrder.products.map((product) => {
                            return {
                                productId: product.productId,
                                productCount: product.productCount,
                            };
                        }),
                    },
                    request: {
                        description: "HTTP request for getting details of created order.",
                        method: "GET",
                        url: "http://localhost:8080/orders/" + newOrder._id,
                    },
                };
                return response
                    .status(StatusCodes.CREATED)
                    .json(customResponse);
            })
            .catch((error) => {
                throw error;
            });
    })
        .catch((error) => {
            if (error instanceof mongoose.Error.ValidationError) {
                return validationErrorFunction(error, response);
            } else {
                return generalErrorFunction(error, response);
            }
        });

    await session.endSession();
};

// Read methods

export const getAllOrders = async (request: express.Request, response: express.Response) => {
    OrderModel.find<IOrder>()
        .select(" _id confirmationDate orderState user products ")
        .exec()
        .then((documents) => {
            if (documents.length > 0) {
                const customResponse = {
                    count: documents.length,
                    orders: documents.map((document) => {
                        return {
                            order: {
                                _id: document._id,
                                confirmationDate: document.confirmationDate,
                                orderState: document.orderState,
                                user: document.user,
                                products: document.products.map((product) => {
                                    return {
                                        productId: product.productId,
                                        productCount: product.productCount,
                                    };
                                }),
                            },
                            request: {
                                description: "HTTP request for getting certain order details.",
                                method: "GET",
                                url: "http://localhost:8080/orders/" + document._id,
                            },
                        };
                    }),
                };
                return response
                    .status(StatusCodes.OK)
                    .json(customResponse);
            } else {
                return response
                    .status(StatusCodes.NOT_FOUND)
                    .json({
                        message: "No documents for orders were found in the database.",
                    });
            }
        })
        .catch((error) => {
            return generalErrorFunction(error, response);
        });
};

export const getOrderById = async (request: express.Request, response: express.Response) => {
    const orderId = request.params.orderId;

    OrderModel.findById<IOrder>(orderId)
        .select(" _id confirmationDate orderState user products ")
        .populate("orderState", " _id state ")
        .populate("user", " _id username email phoneNumber ")
        .populate({
            path: "products",
            select: " productId productCount ",
            populate: {
                path: "productId",
                select:
                    " _id productName productDescription productPrice productWeight arrayOfCategories productCount ",
                populate: {
                    path: "arrayOfCategories",
                    select: " _id categoryName ",
                },
            },
        })
        .exec()
        .then((document) => {
            if (document) {
                const customResponse = {
                    _id: document._id,
                    confirmationDate: document.confirmationDate,
                    orderState: document.orderState,
                    user: document.user,
                    products: document.products.map((product) => {
                        return {
                            productId: product.productId,
                            productCount: product.productCount,
                        };
                    }),
                };
                return response
                    .status(StatusCodes.OK)
                    .json(customResponse);
            } else {
                return response
                    .status(StatusCodes.NOT_FOUND)
                    .json({
                        message: `There is no order object with id equal to ${orderId} in the database.`,
                    });
            }
        })
        .catch((error) => {
            return generalErrorFunction(error, response);
        });
};

export const getOrdersByStatusId = async (request: express.Request, response: express.Response) => {
    const statusId = request.params.statusId;

    OrderModel.find<IOrder>({ orderState: statusId })
        .select(" _id confirmationDate orderState user products ")
        .exec()
        .then((documents) => {
            if (documents.length > 0) {
                const customResponse = {
                    count: documents.length,
                    orders: documents.map((document) => {
                        return {
                            order: {
                                _id: document._id,
                                confirmationDate: document.confirmationDate,
                                orderState: document.orderState,
                                user: document.user,
                                products: document.products.map((product) => {
                                    return {
                                        productId: product.productId,
                                        productCount: product.productCount,
                                    };
                                }),
                            },
                            request: {
                                description: "HTTP request for getting certain order details.",
                                method: "GET",
                                url: "http://localhost:8080/orders/" + document._id,
                            },
                        };
                    }),
                };
                return response
                    .status(StatusCodes.OK)
                    .json(customResponse);
            } else {
                return response
                    .status(StatusCodes.NOT_FOUND)
                    .json({
                        message: `No documents for orders with order status id which equals ${statusId} were found in the database.`,
                    });
            }
        })
        .catch((error) => {
            return generalErrorFunction(error, response);
        });
};

export const getOrdersByProductId = async (request: express.Request, response: express.Response) => {
    const productId = request.params.productId;

    OrderModel.find<IOrder>({ "products.productId": productId })
        .select(" _id confirmationDate orderState user products ")
        .exec()
        .then((documents) => {
            if (documents.length > 0) {
                const customResponse = {
                    count: documents.length,
                    orders: documents.map((document) => {
                        return {
                            order: {
                                _id: document._id,
                                confirmationDate: document.confirmationDate,
                                orderState: document.orderState,
                                user: document.user,
                                products: document.products.map((product) => {
                                    return {
                                        productId: product.productId,
                                        productCount: product.productCount,
                                    };
                                }),
                            },
                            request: {
                                description: "HTTP request for getting certain order details.",
                                method: "GET",
                                url: "http://localhost:8080/orders/" + document._id,
                            },
                        };
                    }),
                };
                return response
                    .status(StatusCodes.OK)
                    .json(customResponse);
            } else {
                return response
                    .status(StatusCodes.NOT_FOUND)
                    .json({
                        message: `No documents for orders with product id which equals ${productId} were found in the database.`,
                    });
            }
        })
        .catch((error) => {
            return generalErrorFunction(error, response);
        });
};

export const getOrdersByUserId = (request: express.Request, response: express.Response) => {
    const userId = request.params.userId;

    OrderModel.find<IOrder>({ user: userId })
        .select(" _id confirmationDate orderState user products ")
        .exec()
        .then((documents) => {
            if (documents.length > 0) {
                const customResponse = {
                    count: documents.length,
                    orders: documents.map((document) => {
                        return {
                            order: {
                                _id: document._id,
                                confirmationDate: document.confirmationDate,
                                orderState: document.orderState,
                                user: document.user,
                                products: document.products.map((product) => {
                                    return {
                                        productId: product.productId,
                                        productCount: product.productCount,
                                    };
                                }),
                            },
                            request: {
                                description: "HTTP request for getting certain order details.",
                                method: "GET",
                                url: "http://localhost:8080/orders/" + document._id,
                            },
                        };
                    }),
                };
                return response
                    .status(StatusCodes.OK)
                    .json(customResponse);
            } else {
                return response
                    .status(StatusCodes.NOT_FOUND)
                    .json({
                        message: `No documents for orders with user id which equals ${userId} were found in the database.`,
                    });
            }
        })
        .catch((error) => {
            return generalErrorFunction(error, response);
        });
};

// Update methods

export const updateOrderStateById = async (request: express.Request, response: express.Response) => {
    const orderId = request.params.orderId;
    const newStatus = request.body.orderState;

    const session = await mongoose.startSession();

    await session.withTransaction(async () => {
        await OrderStateModel.findOne<IOrderState>({ state: newStatus.toUpperCase() })
            .session(session)
            .exec()
            .then(async existingStatus => {
                if (!existingStatus) {
                    return response
                        .status(StatusCodes.NOT_FOUND)
                        .json({
                            message: `Status with name ${newStatus.toUpperCase()} could not be found in the database.`,
                        })
                } else {
                    const statusValue = newStatus.toUpperCase();
                    const statusId = existingStatus._id;
                    await OrderModel.findById<IOrder>(orderId)
                        .session(session)
                        .exec()
                        .then(async existingOrder => {
                            if (existingOrder) {
                                const orderStatus = await OrderStateModel.findById<IOrderState>(existingOrder.orderState);
                                console.log(existingOrder);
                                switch (orderStatus.state) {
                                    case OrderStatusEnum.UNCONFIRMED: {
                                        if (statusValue == OrderStatusEnum.CONFIRMED || statusValue == OrderStatusEnum.CANCELLED) {
                                            await OrderModel.updateOne({ _id: existingOrder._id }, { $set: { orderState: statusId } })
                                                .session(session);

                                            return response
                                                .status(StatusCodes.OK)
                                                .json({
                                                    message: `Order status for order with id ${existingOrder._id} was updated successfully.`,
                                                })
                                        } else {
                                            return response
                                                .status(StatusCodes.BAD_REQUEST)
                                                .json({
                                                    message: `Status of order with status ${orderStatus.state} could not be changed to ${statusValue}.`
                                                });
                                        }
                                    }
                                    case OrderStatusEnum.CONFIRMED: {
                                        if (statusValue == OrderStatusEnum.DONE) {
                                            await OrderModel.updateOne({ _id: existingOrder._id }, { $set: { orderState: statusId } })
                                                .session(session);

                                            return response
                                                .status(StatusCodes.OK)
                                                .json({
                                                    message: `Order status for order with id ${existingOrder._id} was updated successfully.`,
                                                })
                                        } else {
                                            return response
                                                .status(StatusCodes.BAD_REQUEST)
                                                .json({
                                                    message: `Status of order with status ${orderStatus.state} could not be changed to ${statusValue}.`
                                                });
                                        }
                                    }
                                    default: {
                                        return response
                                            .status(StatusCodes.BAD_REQUEST)
                                            .json({
                                                message: `Status of order with status ${orderStatus.state} could not be changed.`,
                                            });
                                    }
                                }
                            } else {
                                return response
                                    .status(StatusCodes.NOT_FOUND)
                                    .json(`Order with id equal to ${orderId} could not be found in the database.`);
                            }
                        })
                        .catch(error => {
                            if (error instanceof mongoose.Error.ValidationError) {
                                return validationErrorFunction(error, response);
                            } else {
                                return generalErrorFunction(error, response);
                            }
                        })
                }
            })
    });

    await session.endSession();
};

export const updateOrderById = async (request: express.Request, response: express.Response) => {
    try {
        await checkIfDataExist(request);
    } catch (error) {
        return response
            .status(StatusCodes.BAD_REQUEST)
            .json({
                message: error.message,
                reasons: error.reasons,
            });
    }

    const orderId = request.params.orderId;

    const nonExistenKeys: Array<Object> = [];
    const updateOpts: any = {};

    Object.keys(request.body).forEach((key) => {
        if (!(key in OrderSchema.obj) && key == 'orderState') {
            nonExistenKeys.push({
                message: `Order could not be updated with property: ${key}.`,
                cause: `Key ${key} could not be found in order document schema.`,
            });
        } else {
            updateOpts[key] = request.body[key];
        }
    });

    if (nonExistenKeys.length != 0) {
        return response
            .status(StatusCodes.BAD_REQUEST)
            .json({
                message: 'Order object could not updated.',
                reasons: nonExistenKeys,
            })
    }

    const session = await mongoose.startSession();

    await session.withTransaction(async () => {
        await OrderModel.findById<IOrder>(orderId)
            .session(session)
            .exec()
            .then(async existingOrder => {
                if (existingOrder) {
                    const orderStatus = await OrderStateModel.findById<IOrderState>(existingOrder.orderState);
                    if (orderStatus.state != OrderStatusEnum.UNCONFIRMED) {
                        return response
                            .status(StatusCodes.BAD_REQUEST)
                            .json({
                                message: `Only order with ${OrderStatusEnum.UNCONFIRMED} status could be updated.`,
                            });
                    }
                } else {
                    return response
                        .status(StatusCodes.BAD_REQUEST)
                        .json({
                            message: `Order with id equal to ${orderId} could not be found in the database.`,
                        });
                }
            })
            .catch(error => {
                if (error instanceof mongoose.Error.CastError) {
                    return invalidObjectIdentifier(error, response);
                } else {
                    return generalErrorFunction(error, response);
                }
            });

        if (request.body.products) {
            const existingOrder = await OrderModel.findById<IOrder>(orderId).session(session);
            if (existingOrder) {
                for (let i = 0; i < existingOrder.products.length; i++) {
                    const productId = existingOrder.products[i].productId;
                    await ProductModel.findById<IProduct>(productId)
                        .session(session)
                        .exec()
                        .then(async (existingProduct) => {
                            existingProduct.productCount += existingOrder.products[i].productCount;
                            await ProductModel.updateOne({ _id: productId }, { $set: existingProduct }, { runValidators: true }).session(session);
                        })
                        .catch(error => {
                            throw error;
                        });
                }

                for (let i = 0; i < request.body.products.length; i++) {
                    const productId = request.body.products[i].productId;
                    await ProductModel.findById<IProduct>(productId)
                        .session(session)
                        .exec()
                        .then(async (existingProduct) => {
                            existingProduct.productCount -= request.body.products[i].productCount;
                            await ProductModel.updateOne({ _id: productId }, { $set: existingProduct }, { runValidators: true }).session(session);
                        })
                        .catch(error => {
                            throw error;
                        });
                }
            }
        }

        await OrderModel.findOneAndUpdate<IOrder>({ _id: orderId }, { $set: updateOpts }, { runValidators: true })
            .session(session)
            .select(" _id confirmationDate orderState user products ")
            .exec()
            .then((document) => {
                if (document) {
                    const customResponse = {
                        message: `Order object with id equal to ${orderId} was updated successfully in the database.`,
                        oldOrder: {
                            _id: document._id,
                            confirmationDate: document.confirmationDate,
                            orderState: document.orderState,
                            user: document.user,
                            products: document.products.map((product) => {
                                return {
                                    productId: product.productId,
                                    productCount: product.productCount,
                                };
                            }),
                        },
                        request: {
                            description: "HTTP request for getting the updated version of the order.",
                            method: "GET",
                            url: "http://localhost:8080/orders/" + document._id,
                        },
                    };
                    return response
                        .status(StatusCodes.OK)
                        .json(customResponse);
                } else {
                    return response
                        .status(StatusCodes.BAD_REQUEST)
                        .json({
                            message: `There is no order object with id equal to ${orderId} in the database.`,
                        });
                }
            })
            .catch((error) => {
                throw error;
            });
    })
        .catch(error => {
            if (error instanceof mongoose.Error.ValidationError) {
                return validationErrorFunction(error, response);
            } else {
                return generalErrorFunction(error, response);
            }
        });


    await session.endSession();
};

// Delete methods

export const deleteOrderById = async (request: express.Request, response: express.Response) => {
    const orderId = request.params.orderId;

    const session = await mongoose.startSession();

    await session.withTransaction(async () => {

        const existingOrder = await OrderModel.findById<IOrder>(orderId).session(session);
        if (existingOrder) {
            for (let i = 0; i < existingOrder.products.length; i++) {
                const productId = existingOrder.products[i].productId;
                await ProductModel.findById<IProduct>(productId)
                    .session(session)
                    .exec()
                    .then(async (existingProduct) => {
                        existingProduct.productCount += existingOrder.products[i].productCount;
                        await ProductModel.updateOne({ _id: productId }, { $set: existingProduct }, { runValidators: true }).session(session);
                    })
                    .catch(error => {
                        if (error instanceof mongoose.Error.ValidationError) {
                            return validationErrorFunction(error, response);
                        } else {
                            return generalErrorFunction(error, response);
                        }
                    });
            }
        }

        await OrderModel.findOneAndDelete<IOrder>({ _id: orderId })
            .select(" _id confirmationDate orderState user products ")
            .exec()
            .then((document) => {
                if (document) {
                    const customResponse = {
                        message: `Order with id equal to ${orderId} was deleted successfully from the database.`,
                        removedOrder: {
                            _id: document._id,
                            confirmationDate: document.confirmationDate,
                            orderState: document.orderState,
                            user: document.user,
                            products: document.products.map((product) => {
                                return {
                                    productId: product.productId,
                                    productCount: product.productCount,
                                };
                            }),
                        },
                    };
                    return response
                        .status(StatusCodes.OK)
                        .json(customResponse);
                } else {
                    return response
                        .status(StatusCodes.BAD_REQUEST)
                        .json({
                            message: `There is no order object with id equal to ${orderId} in the database.`,
                        });
                }
            })
            .catch((error) => {
                return generalErrorFunction(error, response);
            });
    })
        .catch((error) => {
            return generalErrorFunction(error, response);
        });

    await session.endSession();
};

async function checkIfDataExist(request: express.Request) {
    const errors: Array<Object> = [];
    const reasons: any = {};

    const requestBodyObject: ProductInputDTO = request.body;

    if (requestBodyObject.user) {
        await UserModel.findById<IUser>(request.body.user)
            .exec()
            .then(existingUser => {
                if (!existingUser) {
                    reasons.user = {
                        message: 'Given user id is incorrect.',
                        cause: `User with id equal to ${request.body.user} could not be found in the database.`,
                    };
                }
            })
            .catch(error => {
                reasons.user = {
                    message: 'Given user id is incorrect.',
                    cause: `Id ${request.body.user} cannot be user id.`,
                };
            });
    }

    if (requestBodyObject.products) {
        for (let i = 0; i < requestBodyObject.products.length; i++) {
            await ProductModel.findById<IProduct>(requestBodyObject.products[i].productId)
                .exec()
                .then(existingProduct => {
                    if (!existingProduct) {
                        errors.push({
                            message: 'Given product id is incorrect.',
                            cause: `Product with id equal to ${requestBodyObject.products[i].productId} could not be found in the database.`,
                        });
                    }
                })
                .catch(error => {
                    if (error instanceof mongoose.Error.CastError) {
                        errors.push({
                            message: 'Given product id is incorrect.',
                            cause: `id ${requestBodyObject.products[i].productId} cannot be product id.`,
                        });
                    }
                });
        }

        if (errors.length != 0) {
            reasons.products = errors;
        }
    }

    if (Object.keys(reasons).length != 0) {
        throw new DataIncorrectError(reasons);
    }
}