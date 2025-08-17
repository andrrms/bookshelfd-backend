import bookService from '@/services/book.service';
import { Request, Response } from 'express';

class BooksController {
  async getBooks(req: Request, res: Response) {
    const { page = 1, limit = 20, search = '' } = req.query;

    const books = await bookService.findValidatedBooks({
      page: Number(page),
      limit: Number(limit),
      search: String(search),
    });

    return res.json(books);
  }
}

export default new BooksController();
