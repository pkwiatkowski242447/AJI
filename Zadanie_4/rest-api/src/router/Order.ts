import express from 'express';
import { createOrder, getAllOrders, getOrderById, getOrdersByStatusId, getOrdersByProductId, getOrdersByUserId, updateOrderById, deleteOrderById } from '../controllers/Order';
import { authenticate } from '../middlewares/Authentication';
import { checkRolesPermission } from '../middlewares/VerifyRole';
import { UserRole } from '../models/User';
import { checkOrderOwnerShipPermissions } from '../middlewares/IsOwner';

export default(router : express.Router) => {
    router.get('/orders', authenticate, checkRolesPermission(new Array(UserRole.STAFF)), getAllOrders);
    router.get('/orders/:orderId', authenticate, checkOrderOwnerShipPermissions(new Array(UserRole.STAFF)), getOrderById);
    router.get('/orders/status/:statusId', authenticate, checkRolesPermission(new Array(UserRole.STAFF)), getOrdersByStatusId);
    router.get('/orders/user/:userId', authenticate, checkOrderOwnerShipPermissions(new Array(UserRole.STAFF)), getOrdersByUserId);
    router.get('/orders/product/:productId', authenticate, checkRolesPermission(new Array(UserRole.STAFF)), getOrdersByProductId);
    router.post('/orders', authenticate, checkRolesPermission(new Array(UserRole.CLIENT)), createOrder);
    router.put('/orders/:orderId', authenticate, checkOrderOwnerShipPermissions(new Array(UserRole.STAFF)), updateOrderById);
    router.delete('/orders/:orderId', authenticate, checkOrderOwnerShipPermissions(new Array(UserRole.STAFF)), deleteOrderById);
}