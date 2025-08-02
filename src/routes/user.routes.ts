import { Router } from 'express';
import userController from '@/controllers/user.controller';

const userRouter: Router = Router();

userRouter.post('/user', userController.create);
userRouter.get('/user', userController.findAll);
userRouter.get('/user/:id', userController.findById);
userRouter.put('/user/:id', userController.update);
userRouter.delete('/user/:id', userController.softDelete);

export default userRouter;
