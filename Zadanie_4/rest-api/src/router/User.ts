import express from 'express';
import {getAllUsers, getUserById, getUsersByUsername, getUserByEmail, updateUserById, deleteUserById, getUserImageByUserId, updateUserImageByUserId, deleteUserImageByUserId } from '../controllers/User';
import { authenticate } from '../middlewares/Authentication';
import { checkAccountOwnerShipPermissions } from '../middlewares/IsOwner';
import { checkRolesPermission } from '../middlewares/VerifyRole';
import { UserRole } from '../models/User';
import { userImageMiddleware } from '../middlewares/ImageUpload';

export default(router : express.Router) => {
    router.get('/users', authenticate, getAllUsers);
    router.get('/users/:userId', authenticate, checkAccountOwnerShipPermissions(new Array(UserRole.STAFF, UserRole.ADMIN)), getUserById);
    router.get('/users/:userId/image', authenticate, checkAccountOwnerShipPermissions(new Array(UserRole.STAFF, UserRole.ADMIN)), getUserImageByUserId);
    router.get('/users/username/:username', authenticate, checkRolesPermission(new Array(UserRole.STAFF, UserRole.ADMIN)), getUsersByUsername);
    router.get('/users/email/:email', authenticate, checkRolesPermission(new Array(UserRole.STAFF, UserRole.ADMIN)), getUserByEmail);
    router.put('/users/:userId', authenticate, checkAccountOwnerShipPermissions(new Array()), updateUserById);
    router.put('/users/:userId/image', authenticate, userImageMiddleware, checkAccountOwnerShipPermissions(new Array()), updateUserImageByUserId);                  
    router.delete('/users/clients/:userId', authenticate, checkAccountOwnerShipPermissions(new Array(UserRole.STAFF)), deleteUserById);
    router.delete('/users/staff/:userId', authenticate, checkAccountOwnerShipPermissions(new Array(UserRole.ADMIN)), deleteUserById);
    router.delete('/users/admins/:userId', authenticate, checkAccountOwnerShipPermissions(new Array(UserRole.ADMIN)), deleteUserById);
    router.delete('/users/:userId/image', authenticate, checkAccountOwnerShipPermissions(new Array()), deleteUserImageByUserId);
}
