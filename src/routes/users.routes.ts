import userController from '@/controllers/users.controller';
import { Router } from 'express';

const userRouter: Router = Router();

userRouter.get('/me', userController.findMe);
userRouter.put('/me', userController.updateMe);
userRouter.delete('/me', userController.softDeleteMe);
userRouter.get('/:username', userController.findByUsername);
userRouter.get('/:username/bookshelf', userController.getUserBookshelf);
//GET :username/lists
//GET :username/reviews
//POST follow/:username
//DELETE follow/:username
//GET :username/followers
//GET :username/following

export default userRouter;
