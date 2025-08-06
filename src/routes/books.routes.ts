import booksController from '@/controllers/books.controller';
import { Router } from 'express';

const booksRouter: Router = Router();

booksRouter.get('/', booksController.getBooks);

export default booksRouter;
