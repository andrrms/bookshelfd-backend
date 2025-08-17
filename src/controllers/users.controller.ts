import { findUserByUsernameSchema } from '@/schemas/book.schemas';
import { createUserSchema, updateUserSchema } from '@/schemas/user.schemas';
import userService from '@/services/users.service';
import { Request, Response } from 'express';

class UserController {
  async findMe(req: Request, res: Response) {
    const { user } = req;
    return res.json(user);
  }

  async findByUsername(req: Request, res: Response) {
    const params = findUserByUsernameSchema.safeParse(req.params);

    if (params.error) throw params.error;

    const user = await userService.getUserByUsername(params.data.username);
    return res.json(user);
  }

  async getUserBookshelf(req: Request, res: Response) {
    const params = findUserByUsernameSchema.safeParse(req.params);

    if (params.error) throw params.error;

    const bookshelf = await userService.getUserBookshelf(params.data.username);
    return res.json(bookshelf);
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
