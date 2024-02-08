import express from 'express';
import mongoose from 'mongoose';
import { OrderStateModel } from '../models/OrderState';
import { IOrderState } from '../interfaces/OrderState';
import { generalErrorFunction, invalidObjectIdentifier, validationErrorFunction } from '../errors/ErrorHandler';
import { StatusCodes } from 'http-status-codes';

// Create methods

export const createOrderState = async (request : express.Request, response : express.Response) => {
    const newOrderState = new OrderStateModel({
        _id: new mongoose.Types.ObjectId(),
        state: request.body.state,
    });
    
    try {
        newOrderState.save();
    } catch (error) {
        if (error instanceof mongoose.Error.ValidationError) {
            return validationErrorFunction(error, response);
        } else {
            return generalErrorFunction(error, response);
        }
    }

    const customResponse = {
        newOrderState: {
            _id: newOrderState._id,
            state: newOrderState.state,
        },
        request: {
            description: 'HTTP request for getting details of created order state.',
            method: 'GET',
            url: 'http://localhost:8080/status/' + newOrderState._id,
        },
    }

    return response
        .status(StatusCodes.CREATED)
        .json(customResponse);
};

// Read methods

export const getAllOrderStates = async (request : express.Request, response : express.Response) => {
    try {
        const orderStatesDocuments = await OrderStateModel.find<IOrderState>()
        .select('_id state')    
        .exec();

        if (orderStatesDocuments.length > 0) {
            const customResponse = {
                count: orderStatesDocuments.length,
                orderStates: orderStatesDocuments.map(orderStateDocument => {
                    return {
                        orderState: {
                            _id: orderStateDocument._id,
                            state: orderStateDocument.state,
                        },
                        request: {
                            description: 'HTTP request for getting certain order state details.',
                            method: 'GET',
                            url: 'http://localhost:8080/status/' + orderStateDocument._id,
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
                        message: 'No documents for order states were found in the database.',
                    });
        }
    } catch (error) {
        return generalErrorFunction(error, response);
    }
};

export const getOrderStateById = async (request : express.Request, response : express.Response) => {
    const statusId = request.params.statusId;

    try {
        const orderStateDocument = await OrderStateModel.findById<IOrderState>(statusId)
        .select('_id state')
        .exec();

        if (orderStateDocument) {
            return response
                    .status(StatusCodes.OK)
                    .json(orderStateDocument);
        } else {
            return response
                    .status(StatusCodes.NOT_FOUND)
                    .json({
                        message: `Order state object with id equal to ${statusId} could not be found in the database.`,
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

// Delete methods

export const deleteOrderStateById = async (request : express.Request, response : express.Response) => {
    const statusId = request.params.statusId;

    try {
        const orderStateDocument = await OrderStateModel.findOneAndDelete<IOrderState>({ _id: statusId })
        .select('_id state')
        .exec();

        if (orderStateDocument) {
            const customResponse = {
                message: `Order state object with id: ${statusId} was deleted successfully from the database.`,
                removedOrderState: {
                    _id: orderStateDocument._id,
                    state: orderStateDocument.state,
                }
            }

            return response
                    .status(StatusCodes.OK)
                    .json(customResponse);
        } else {
            return response
                    .status(StatusCodes.NOT_FOUND)
                    .json({
                        message: `There is no order state object with id equal to ${statusId} in the database.`,
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

export const initializeOrderStates = () => {
    const CONFIRMED = new OrderStateModel({
        _id: new mongoose.Types.ObjectId(),
        state: 'CONFIRMED',
    });

    const UNCONFIRMED = new OrderStateModel({
        _id: new mongoose.Types.ObjectId(),
        state: 'UNCONFIRMED',
    });

    const CANCELLED = new OrderStateModel({
        _id: new mongoose.Types.ObjectId(),
        state: 'CANCELLED',
    });

    const DONE = new OrderStateModel({
        _id: new mongoose.Types.ObjectId(),
        state: 'DONE',
    });

    OrderStateModel.findOne<IOrderState>({ state: CONFIRMED.state })
        .exec()
        .then(orderState => {
            if(!orderState) {
                CONFIRMED.save();
            }
        });

    OrderStateModel.findOne<IOrderState>({ state: UNCONFIRMED.state })
        .exec()
        .then(orderState => {
            if(!orderState) {
                UNCONFIRMED.save();
            }
        });

    OrderStateModel.findOne<IOrderState>({ state: CANCELLED.state })
        .exec()
        .then(orderState => {
            if(!orderState) {
                CANCELLED.save();
            }
        });

    OrderStateModel.findOne<IOrderState>({ state: DONE.state })
        .exec()
        .then(orderState => {
            if(!orderState) {
                DONE.save();
            }
        })
        .catch();
} 