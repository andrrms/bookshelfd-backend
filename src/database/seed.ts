import { PrismaClient } from './generated/prisma';
import bcrypt from 'bcrypt';
const prisma = new PrismaClient();

async function main() {
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      username: 'gamemaster',
      email: 'admin@example.com',
      password: await bcrypt.hash('securePassword123!', 10),
    },
  });

  const booksToCreate = [
    {
      title: 'Clean Code',
      author: 'Robert C. Martin',
      isbn: '9780132350884',
      description: 'A Handbook of Agile Software Craftsmanship',
    },
    {
      title: 'The Pragmatic Programmer',
      author: 'Andrew Hunt, David Thomas',
      isbn: '9780201616224',
      description: 'Your Journey to Mastery',
    },
    {
      title: 'Refactoring',
      author: 'Martin Fowler',
      isbn: '9780201485677',
      description: 'Improving the Design of Existing Code',
    },
    {
      title: 'Design Patterns',
      author: 'Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides',
      isbn: '9780201633610',
      description: 'Elements of Reusable Object-Oriented Software',
    },
    {
      title: "You Don't Know JS Yet",
      author: 'Kyle Simpson',
      isbn: '9781091210099',
      description: 'Get Started',
    },
  ];

  for (const bookData of booksToCreate) {
    await prisma.book.create({
      data: {
        ...bookData,
        contributorUuid: adminUser.uuid,
      },
    });
  }

  console.log('Seed do banco de dados concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
