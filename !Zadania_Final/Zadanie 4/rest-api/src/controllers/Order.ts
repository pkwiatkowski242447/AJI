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
        try {
            if (request.body.products) {
                for (let i = 0; i < request.body.products.length; i++) {
                    const productId = request.body.products[i].productId;
                    const existingProduct = await ProductModel.findById<IProduct>(productId)
                        .session(session)
                        .exec();

                    existingProduct.productCount -= request.body.products[i].productCount;
                    await ProductModel.updateOne({ _id: productId }, { $set: existingProduct }, { runValidators: true })
                                .session(session)
                }
            }
        } catch (error) {
            if (error instanceof mongoose.Error.ValidationError) {
                return validationErrorFunction(error, response);
            } else {
                return generalErrorFunction(error, response);
            }
        }

        const orderState = await OrderStateModel.findOne<IOrderState>({ state: OrderStatusEnum.UNCONFIRMED })
                                    .session(session);

        const newOrder = new OrderModel({
            _id: new mongoose.Types.ObjectId(),
            confirmationDate: request.body.confirmationDate,
            orderState: orderState._id,
            user: request.body.user,
            products: request.body.products,
        });
        
        try {
            await newOrder.save();
        } catch(error) {
            if (error instanceof mongoose.Error.ValidationError) {
                return validationErrorFunction(error, response);
            } else {
                return generalErrorFunction(error, response);
            };
        }

        const customResponse = {
            newOrder: {
                _id: newOrder._id,
                confirmationDate: newOrder.confirmationDate,
                orderState: newOrder.orderState,
                user: newOrder.user,
                products: newOrder.products.map((productDocument) => {
                    return {
                        productId: productDocument.productId,
                        productCount: productDocument.productCount,
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
        });

    await session.endSession();
};

// Read methods

export const getAllOrders = async (request: express.Request, response: express.Response) => {

    try {
        const orderDocuments = await OrderModel.find<IOrder>()
                                        .select(" _id confirmationDate orderState user products ")
                                        .exec()

        const orderDocumentsInfo = {
            count: orderDocuments.length,
            orders: orderDocuments.map((orderDocument) => {
                return {
                    order: {
                        _id: orderDocument._id,
                        confirmationDate: orderDocument.confirmationDate,
                        orderState: orderDocument.orderState,
                        user: orderDocument.user,
                        products: orderDocument.products.map((productDocument) => {
                            return {
                                productId: productDocument.productId,
                                productCount: productDocument.productCount,
                            };
                        }),
                        request: {
                            description: "HTTP request for getting certain order details.",
                            method: "GET",
                            url: "http://localhost:8080/orders/" + orderDocument._id,
                        },
                    }
                }
            })
        }

        if (orderDocuments.length > 0) {
            return response
                    .status(StatusCodes.OK)
                    .json(orderDocumentsInfo);
        } else {
            return response
                    .status(StatusCodes.NOT_FOUND)
                    .json({
                        message: "No documents for orders were found in the database.",
                    });
        }
    } catch (error) {
        generalErrorFunction(error, response);
    }
};

export const getOrderById = async (request: express.Request, response: express.Response) => {
    const orderId = request.params.orderId;

    try {

        const orderDocument = await OrderModel.findById<IOrder>(orderId)
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
        });

        if (orderDocument) {
            const customResponse = {
                _id: orderDocument._id,
                confirmationDate: orderDocument.confirmationDate,
                orderState: orderDocument.orderState,
                user: orderDocument.user,
                products: orderDocument.products.map((productDocument) => {
                    return {
                        productId: productDocument.productId,
                        productCount: productDocument.productCount,
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

    } catch (error) {
        if (error instanceof mongoose.Error.CastError) {
            return invalidObjectIdentifier(error, response);
        } else {
            return generalErrorFunction(error, response);
        }
    }
};

export const getOrdersByStatusId = async (request: express.Request, response: express.Response) => {
    const statusId = request.params.statusId;

    try {
        const ordersDocuments = await OrderModel.find<IOrder>({ orderState: statusId })
        .select(" _id confirmationDate orderState user products ")
        .populate("orderState", " _id state ")
        .exec();

        if (ordersDocuments.length > 0) {
            const customResponse = {
                count: ordersDocuments.length,
                orders: ordersDocuments.map((orderDocument) => {
                    return {
                        order: {
                            _id: orderDocument._id,
                            confirmationDate: orderDocument.confirmationDate,
                            orderState: orderDocument.orderState,
                            user: orderDocument.user,
                            products: orderDocument.products.map((productDocument) => {
                                return {
                                    productId: productDocument.productId,
                                    productCount: productDocument.productCount,
                                };
                            }),
                        },
                        request: {
                            description: "HTTP request for getting certain order details.",
                            method: "GET",
                            url: "http://localhost:8080/orders/" + orderDocument._id,
                        },
                    }
                }),
            }

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
    } catch (error) {
        if (error instanceof mongoose.Error.CastError) {
            return invalidObjectIdentifier(error, response);
        } else {
            return generalErrorFunction(error, response);
        }
    }
};

export const getOrdersByProductId = async (request: express.Request, response: express.Response) => {
    const productId = request.params.productId;

    try {
        const ordersDocuments = await OrderModel.find<IOrder>({ "products.productId": productId })
        .select(" _id confirmationDate orderState user products ")
        .exec();

        if (ordersDocuments.length > 0) {
            const customResponse = {
                count: ordersDocuments.length,
                orders: ordersDocuments.map((orderDocument) => {
                    return {
                        order: {
                            _id: orderDocument._id,
                            confirmationDate: orderDocument.confirmationDate,
                            orderState: orderDocument.orderState,
                            user: orderDocument.user,
                            products: orderDocument.products.map((productDocument) => {
                                return {
                                    productId: productDocument.productId,
                                    productCount: productDocument.productCount,
                                };
                            }),
                        },
                        request: {
                            description: "HTTP request for getting certain order details.",
                            method: "GET",
                            url: "http://localhost:8080/orders/" + orderDocument._id,
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
    } catch (error) {
        if (error instanceof mongoose.Error.CastError) {
            return invalidObjectIdentifier(error, response);
        } else {
            return generalErrorFunction(error, response);
        }
    }
};

export const getOrdersByUserId = async (request: express.Request, response: express.Response) => {
    const userId = request.params.userId;

    try {
        const ordersDocuments = await OrderModel.find<IOrder>({ user: userId })
        .select(" _id confirmationDate orderState user products ")
        .populate("user", " _id username email phoneNumber ")
        .exec();

        if (ordersDocuments.length > 0) {
            const customResponse = {
                count: ordersDocuments.length,
                orders: ordersDocuments.map((orderDocument) => {
                    return {
                        order: {
                            _id: orderDocument._id,
                            confirmationDate: orderDocument.confirmationDate,
                            orderState: orderDocument.orderState,
                            user: orderDocument.user,
                            products: orderDocument.products.map((productDocument) => {
                                return {
                                    productId: productDocument.productId,
                                    productCount: productDocument.productCount,
                                };
                            }),
                        },
                        request: {
                            description: "HTTP request for getting certain order details.",
                            method: "GET",
                            url: "http://localhost:8080/orders/" + orderDocument._id,
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
    } catch (error) {
        if (error instanceof mongoose.Error.CastError) {
            return invalidObjectIdentifier(error, response);
        } else {
            return generalErrorFunction(error, response);
        }
    }
};

// Update methods

export const confirmOrderByOrderId = async (request: express.Request, response: express.Response) => {
    const orderId = request.params.orderId;

    try {
        const confirmationDate : Date = new Date(request.body.confirmationDate);

        const session = await mongoose.startSession();

        const existingOrder = await OrderModel.findById<IOrder>(orderId).session(session);

        if (existingOrder) {
            existingOrder.confirmationDate = confirmationDate;

            const newOrder = await OrderModel.findOneAndUpdate({ _id: existingOrder._id }, existingOrder, { new: true });

            const customResponse = {
                message: `Order with id equal to ${orderId} was updated successfully in the database.`,
                order: {
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
                }
            }

            return response
                    .status(StatusCodes.OK)
                    .json(customResponse);
        } else {
            return response
                    .status(StatusCodes.NOT_FOUND)
                    .json({
                        message: `Order with id equal to ${orderId} could not be found in the database.`,
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

export const updateOrderStateById = async (request: express.Request, response: express.Response) => {
    const orderId = request.params.orderId;
    const newStatus = request.body.orderState;

    const session = await mongoose.startSession();

    try {
        const orderStatus = await OrderStateModel.findOne<IOrderState>({ state: newStatus.toUpperCase() })
        .session(session)
        .exec();

        if (orderStatus) {

            const statusValue = newStatus.toUpperCase();
            const statusId = orderStatus._id;

            const existingOrder = await OrderModel.findById<IOrder>(orderId)
            .session(session)
            .exec(); 

            if (existingOrder) {
                const orderStatus = await OrderStateModel.findById<IOrderState>(existingOrder.orderState);

                switch (orderStatus.state) {
                    case OrderStatusEnum.UNCONFIRMED: {
                        if (statusValue == OrderStatusEnum.CONFIRMED || statusValue == OrderStatusEnum.CANCELLED) {
                            await OrderModel.updateOne({ _id: existingOrder._id }, { $set: { orderState: statusId } })
                                .session(session);

                            await session.endSession();

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

                            await session.endSession();

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
        } else {
            return response
                    .status(StatusCodes.NOT_FOUND)
                    .json({
                        message: `Status with name ${newStatus.toUpperCase()} could not be found in the database.`,
                    })
        }
    } catch (error) {
        if (error instanceof mongoose.Error.CastError) {
            return invalidObjectIdentifier(error, response);
        } else {
            return generalErrorFunction(error, response);
        }
    }
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
        console.log(key);
        if (!(key in OrderSchema.obj) || key == 'orderState') {
            nonExistenKeys.push({
                message: `Order could not be updated with property: ${key}.`,
                cause: `Key ${key} could not be found in order document schema.`,
            });
        } else {
            updateOpts[key] = request.body[key];
        }
    });

    console.log(nonExistenKeys);

    if (nonExistenKeys.length != 0) {
        return response
            .status(StatusCodes.BAD_REQUEST)
            .json({
                message: 'Order object could not updated.',
                reasons: nonExistenKeys,
            })
    }

    const session = await mongoose.startSession();

    try {
        const orderDocument = await OrderModel.findById<IOrder>(orderId)
        .session(session)
        .exec();
        
        if (orderDocument) {
            const orderStatus = await OrderStateModel.findById<IOrderState>(orderDocument.orderState)
            .session(session)
            .exec();

            if (orderStatus.state != OrderStatusEnum.UNCONFIRMED) {
                return response
                    .status(StatusCodes.BAD_REQUEST)
                    .json({
                        message: `Only order with ${OrderStatusEnum.UNCONFIRMED} status could be updated.`,
                    });
            } else {
                if (request.body.products) {
                    const existingOrder = await OrderModel.findById<IOrder>(orderId).session(session);
                    if (existingOrder) {
                        for (let i = 0; i < existingOrder.products.length; i++) {
                            const productId = existingOrder.products[i].productId;
                            const productDocument = await ProductModel.findById<IProduct>(productId)
                                .session(session)
                                .exec();

                            productDocument.productCount += existingOrder.products[i].productCount;
                            await ProductModel.updateOne({ _id: productId }, { $set: productDocument }, { runValidators: true }).session(session);
                        }
        
                        for (let i = 0; i < request.body.products.length; i++) {
                            const productId = request.body.products[i].productId;
                            const productDocument = await ProductModel.findById<IProduct>(productId)
                                .session(session)
                                .exec();

                                productDocument.productCount -= request.body.products[i].productCount;
                                await ProductModel.updateOne({ _id: productId }, { $set: productDocument }, { runValidators: true }).session(session);
                        }
                    }
                }

                const newOrderDocument = await OrderModel.findOneAndUpdate<IOrder>({ _id: orderId }, { $set: updateOpts }, { runValidators: true })
                .session(session)
                .select(" _id confirmationDate orderState user products ")
                .exec()

                if (newOrderDocument) {
                    const customResponse = {
                        message: `Order object with id equal to ${orderId} was updated successfully in the database.`,
                        oldOrder: {
                            _id: newOrderDocument._id,
                            confirmationDate: newOrderDocument.confirmationDate,
                            orderState: newOrderDocument.orderState,
                            user: newOrderDocument.user,
                            products: newOrderDocument.products.map((productDocument) => {
                                return {
                                    productId: productDocument.productId,
                                    productCount: productDocument.productCount,
                                };
                            }),
                        },
                        request: {
                            description: "HTTP request for getting the updated version of the order.",
                            method: "GET",
                            url: "http://localhost:8080/orders/" + newOrderDocument._id,
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
            }
        } else {
            return response
                .status(StatusCodes.BAD_REQUEST)
                .json({
                    message: `Order with id equal to ${orderId} could not be found in the database.`,
                });
        }
    } catch (error) {
        if (error instanceof mongoose.Error.CastError) {
            return invalidObjectIdentifier(error, response);
        } else {
            return generalErrorFunction(error, response);
        }
    } finally {
        await session.endSession();
    }
};

// Delete methods

export const deleteOrderById = async (request: express.Request, response: express.Response) => {
    const orderId = request.params.orderId;

    const session = await mongoose.startSession();

    try {
        const existingOrder = await OrderModel.findById<IOrder>(orderId)
        .session(session);

        if (existingOrder) {
            for (let i = 0; i < existingOrder.products.length; i++) {
                const productId = existingOrder.products[i].productId;
                const productDocument = await ProductModel.findById<IProduct>(productId)
                    .session(session)
                    .exec();

                productDocument.productCount += existingOrder.products[i].productCount;
                    
                await ProductModel.updateOne({ _id: productId }, { $set: productDocument }, { runValidators: true }).session(session);

                const orderDocument = await OrderModel.findOneAndDelete<IOrder>({ _id: orderId })
                .select(" _id confirmationDate orderState user products ")
                .exec();

                if (orderDocument) {
                    const customResponse = {
                        message: `Order with id equal to ${orderId} was deleted successfully from the database.`,
                        removedOrder: {
                            _id: orderDocument._id,
                            confirmationDate: orderDocument.confirmationDate,
                            orderState: orderDocument.orderState,
                            user: orderDocument.user,
                            products: orderDocument.products.map((productDocument) => {
                                return {
                                    productId: productDocument.productId,
                                    productCount: productDocument.productCount,
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
            }
        } else {
            return response
                    .status(StatusCodes.NOT_FOUND)
                    .json({
                        message: `Order with id equal to ${orderId} could not be found in the database.`,
                    });
        }
    } catch (error) {
        if (error instanceof mongoose.Error.CastError) {
            return invalidObjectIdentifier(error, response);
        } else {
            return generalErrorFunction(error, response);
        }
    } finally {
        await session.endSession();
    }
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