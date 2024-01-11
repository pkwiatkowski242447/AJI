import express from 'express';
import { createClient, createStaff, createAdmin , deleteRefreshToken, loginUser, useRefreshToken } from '../controllers/Authentication';
import { authenticate } from '../middlewares/Authentication';
import { checkRolesPermission } from '../middlewares/VerifyRole';
import { UserRole } from '../models/User';
import { userImageMiddleware } from '../middlewares/ImageUpload';

export default(router : express.Router) => {
    router.post('/users/signup', userImageMiddleware, createClient);
    // router.post('/users/staff', userImageMiddleware, checkRolesPermission(new Array(UserRole.ADMIN)), createStaff);
    router.post('/users/staff', userImageMiddleware, createStaff);
    // router.post('/users/admins', userImageMiddleware, checkRolesPermission(new Array(UserRole.ADMIN)), createAdmin);
    router.post('/users/admins', userImageMiddleware, createAdmin);
    router.post('/users/login', loginUser);
    router.post('/users/token', useRefreshToken);
    router.delete('/users/token/delete', authenticate, deleteRefreshToken);
};