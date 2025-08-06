import { Router } from 'express';
import userController from '@/controllers/users.controller';
import authenticateToken from '@/middlewares/authenticateToken';

const userRouter: Router = Router();

userRouter.post('/register', userController.register);

userRouter.use(authenticateToken);
userRouter.get('/me', userController.findMe);
userRouter.put('/me', userController.updateMe);
userRouter.delete('/me', userController.softDeleteMe);
userRouter.get('/:id', userController.findById);

export default userRouter;
