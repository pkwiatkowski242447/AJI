import express from 'express';
import mongoose from 'mongoose';
import { OrderStateModel } from '../models/OrderState';
import { IOrderState } from '../interfaces/OrderState';
import { generalErrorFunction, validationErrorFunction } from '../errors/ErrorHandler';

// Create methods

export const createOrderState = async (request : express.Request, response : express.Response) => {
    const newOrderState = new OrderStateModel({
        _id: new mongoose.Types.ObjectId(),
        state: request.body.state,
    });
    
    newOrderState.save()
        .then(newOrderState => {
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

export const getAllOrderStates = async (request : express.Request, response : express.Response) => {
    OrderStateModel.find<IOrderState>()
        .select('_id state')    
        .exec()
        .then(documents => {
            if (documents.length > 0) {
                const customResponse = {
                    count: documents.length,
                    orderStates: documents.map(document => {
                        return {
                            orderState: {
                                _id: document._id,
                                state: document.state,
                            },
                            request: {
                                description: 'HTTP request for getting certain order state details.',
                                method: 'GET',
                                url: 'http://localhost:8080/status/' + document._id,
                            },
                        }
                    }),
                }
                return response.status(200).json(customResponse);
            } else {
                return response.status(404).json({
                    message: 'No documents for order states were found in the database.',
                });
            }
        })
        .catch(error => {
            return generalErrorFunction(error, response);
        });
};

export const getOrderStateById = async (request : express.Request, response : express.Response) => {
    const statusId = request.params.statusId;
    OrderStateModel.findById<IOrderState>(statusId)
        .select('_id state')
        .exec()
        .then(document => {
            if (document) {
                return response.status(200).json(document);
            } else {
                return response.status(404).json({
                    message: `Order state object with id equal to ${statusId} could not be found in the database.`,
                });
            }
        })
        .catch(error => {
            return generalErrorFunction(error, response);
        });
};

// Delete methods

export const deleteOrderStateById = async (request : express.Request, response : express.Response) => {
    const statusId = request.params.statusId;
    OrderStateModel.findOneAndDelete<IOrderState>({ _id: statusId })
        .select('_id state')
        .then(document => {
            if (document) {
                const customResponse = {
                    message: `Order state object with id: ${statusId} was deleted successfully from the database.`,
                    removedOrderState: {
                        _id: document._id,
                        state: document.state,
                    }
                }
                return response.status(200).json(customResponse);
            } else {
                return response.status(400).json({
                    message: `There is no order state object with id equal to ${statusId} in the database.`,
                });
            }
        })
        .catch(error => {
            return generalErrorFunction(error, response);
        });
};