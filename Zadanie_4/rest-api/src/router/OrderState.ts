import express from 'express';
import { createOrderState, deleteOrderStateById, getAllOrderStates, getOrderStateById } from '../controllers/OrderState';
import { authenticate } from '../middlewares/Authentication';
import { checkRolesPermission } from '../middlewares/VerifyRole';
import { UserRole } from '../models/User';

export default (router : express.Router) => {
    router.get('/status', getAllOrderStates);
    router.get('/status/:statusId', getOrderStateById);
    router.post('/status', authenticate, checkRolesPermission(new Array(UserRole.STAFF)), createOrderState);
    router.delete('/status/:statusId', authenticate, checkRolesPermission(new Array(UserRole.STAFF)), deleteOrderStateById);
} 