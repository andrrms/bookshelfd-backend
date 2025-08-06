import { PrismaErrors } from '@/constants/prisma-errors';
import prisma, { Book, BookStatus, Prisma } from '@/database';
import { ConflictError, NotFoundError } from '@/errors/custom-errors';
import {
  BookCreateInput,
  bookResponseSchema,
  BookUpdateInput,
} from '@/schemas/book.schemas';

export class BookService {
  async getAllBooks() {
    return prisma.book.findMany();
  }

  async findValidatedBooks({
    page,
    limit,
    search,
  }: {
    page: number;
    limit: number;
    search: string;
  }) {
    const skip = (page - 1) * limit;

    const where = {
      status: BookStatus.VALIDATED,
      OR: search
        ? [
            { title: { contains: search, mode: 'insensitive' as const } },
            { author: { contains: search, mode: 'insensitive' as const } },
          ]
        : undefined,
    };

    const books = await prisma.book.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    const totalCount = await prisma.book.count({ where });

    return {
      books: books.map((book) => bookResponseSchema.parse(book)),
      totalCount,
      page,
      limit,
    };
  }

  async getBookById(id: string) {
    const book = prisma.book.findUnique({
      where: { id: id },
    });

    if (!book) throw new NotFoundError('Livro não encontrado');

    return book;
  }

  async createBook(data: BookCreateInput) {
    const existingBook = await prisma.book.findUnique({
      where: { isbn: data.isbn },
    });

    if (existingBook) {
      throw new ConflictError('E-mail já cadastrado.');
    }

    return prisma.book.create({
      data,
    });
  }

  async updateBook(id: string, data: BookUpdateInput) {
    try {
      const book = await prisma.book.update({
        where: { id },
        data,
      });

      return bookResponseSchema.parse(book);
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === PrismaErrors.RecordNotFound) {
          throw new NotFoundError('Livro não encontrado.');
        }
      }

      throw e;
    }
  }

  async deleteBook(id: string) {
    return prisma.book.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}

export default new BookService();
