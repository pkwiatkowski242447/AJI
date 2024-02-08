import express from 'express';
import { createCategory, getAllCategories, getCategoryById, updateCategoryById, deleteCategoryById } from '../controllers/Category';
import { authenticate } from '../middlewares/Authentication';
import { checkRolesPermission } from '../middlewares/VerifyRole';
import { UserRole } from '../models/User';

export default(router : express.Router) => {
    router.get('/categories', getAllCategories);
    router.get('/categories/:categoryId', getCategoryById);
    router.post('/categories', authenticate, checkRolesPermission(new Array(UserRole.STAFF)), createCategory);
    router.delete('/categories/:categoryId', authenticate, checkRolesPermission(new Array(UserRole.STAFF)), deleteCategoryById);
    router.put('/categories/:categoryId', authenticate, checkRolesPermission(new Array(UserRole.STAFF)), updateCategoryById);
}