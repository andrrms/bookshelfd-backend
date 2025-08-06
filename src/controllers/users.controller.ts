import { findUserByIdSchema } from '@/schemas/book.schemas';
import { createUserSchema, updateUserSchema } from '@/schemas/user.schemas';
import userService from '@/services/users.service';
import { Request, Response } from 'express';

class UserController {
  async register(req: Request, res: Response) {
    const validatedData = createUserSchema.parse(req.body);
    const newUser = await userService.createUser(validatedData);
    return res.status(201).json(newUser);
  }

  async findMe(req: Request, res: Response) {
    const { user } = req;
    return res.json(user);
  }

  async findById(req: Request, res: Response) {
    const params = findUserByIdSchema.safeParse(req.params);

    if (params.error) throw params.error;

    const user = await userService.getUserByUuid(params.data.id);
    return res.json(user);
  }

  async updateMe(req: Request, res: Response) {
    const { user } = req;

    const validatedData = updateUserSchema.parse(req.body);
    const updatedUser = await userService.updateUser(user.id, validatedData);
    return res.json(updatedUser);
  }

  async softDeleteMe(req: Request, res: Response) {
    const { user } = req;

    const deletedUser = await userService.deleteUser(user.id);
    return res.json(deletedUser);
  }
}

export default new UserController();
