import booksController from '@/controllers/books.controller';
import { Router } from 'express';

const booksRouter: Router = Router();

booksRouter.get('/', booksController.getBooks);
// GET /:id
// POST /
// PUT /:id
// DELETE /:id
// GET  /:id/reviews

export default booksRouter;
