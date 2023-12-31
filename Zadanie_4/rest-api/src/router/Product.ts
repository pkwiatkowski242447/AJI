import express from 'express';
import { createProduct, getAllProducts, getProductById, getProductsByCategoryId, updateProductById, deleteProductById, getProductImageByProductId, updateProductImageByProductId, deleteProductImageByProductId } from '../controllers/Product';
import { authenticate } from '../middlewares/Authentication';
import { checkRolesPermission } from '../middlewares/VerifyRole';
import { UserRole } from '../models/User';
import { productImageMiddleware } from '../middlewares/ImageUpload';

export default(router : express.Router) => {
    router.get('/products', getAllProducts);
    router.get('/products/:productId', getProductById);
    router.get('/products/:productId/image', getProductImageByProductId);
    router.get('/products/:categoryId', authenticate, checkRolesPermission(new Array(UserRole.CLIENT, UserRole.STAFF)), getProductsByCategoryId);
    router.post('/products', authenticate, productImageMiddleware, checkRolesPermission(new Array(UserRole.STAFF)), createProduct);
    router.patch('/products/:productId', authenticate, checkRolesPermission(new Array(UserRole.STAFF)), updateProductById);
    router.patch('/products/:productId/image', authenticate, productImageMiddleware, checkRolesPermission(new Array(UserRole.STAFF)), updateProductImageByProductId);
    router.delete('/products/:productId', authenticate, checkRolesPermission(new Array(UserRole.STAFF)), deleteProductById);
    router.delete('/products/:productId/image', authenticate, checkRolesPermission(new Array(UserRole.STAFF)), deleteProductImageByProductId);
}