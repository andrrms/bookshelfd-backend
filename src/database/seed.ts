import { PrismaClient, ReadStatus, UserRole } from './generated/prisma';
import bcrypt from 'bcrypt';
const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando o seeding do banco de dados...');
  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash('securePassword123!', salt);

  // 1. Criando múltiplos usuários
  const usersToCreate = [
    {
      username: 'gamemaster',
      email: 'admin@example.com',
      role: UserRole.ADMIN,
    },
    { username: 'alice', email: 'alice@example.com' },
    { username: 'bob', email: 'bob@example.com' },
    { username: 'charlie', email: 'charlie@example.com' },
  ];

  const createdUsers = [];
  for (const userData of usersToCreate) {
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        ...userData,
        passwordHash,
        salt,
        emailVerified: true,
      },
    });
    createdUsers.push(user);
  }

  const [adminUser, alice, bob, charlie] = createdUsers;

  // 2. Criando mais livros
  const booksToCreate = [
    {
      title: 'Clean Code',
      author: 'Robert C. Martin',
      isbn: '9780132350884',
      description: 'A Handbook of Agile Software Craftsmanship',
      creatorId: adminUser.id,
    },
    {
      title: 'The Pragmatic Programmer',
      author: 'Andrew Hunt, David Thomas',
      isbn: '9780201616224',
      description: 'Your Journey to Mastery',
      creatorId: adminUser.id,
    },
    {
      title: 'Refactoring',
      author: 'Martin Fowler',
      isbn: '9780201485677',
      description: 'Improving the Design of Existing Code',
      creatorId: adminUser.id,
    },
    {
      title: 'Design Patterns',
      author: 'Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides',
      isbn: '9780201633610',
      description: 'Elements of Reusable Object-Oriented Software',
      creatorId: adminUser.id,
    },
    {
      title: "You Don't Know JS Yet",
      author: 'Kyle Simpson',
      isbn: '9781091210099',
      description: 'Get Started',
      creatorId: adminUser.id,
    },
    {
      title: 'JavaScript: The Definitive Guide',
      author: 'David Flanagan',
      isbn: '9781491952023',
      description: "Master the World's Most-Used Programming Language",
      creatorId: alice.id,
    },
    {
      title: 'Cracking the Coding Interview',
      author: 'Gayle Laakmann McDowell',
      isbn: '9780984782857',
      description: '189 Programming Questions and Solutions',
      creatorId: alice.id,
    },
  ];

  const createdBooks = [];
  for (const bookData of booksToCreate) {
    const book = await prisma.book.upsert({
      where: { isbn: bookData.isbn },
      update: {},
      create: bookData,
    });
    createdBooks.push(book);
  }

  const [
    cleanCode,
    pragmatic,
    refactoring,
    designPatterns,
    youDontKnowJS,
    jsDefinitive,
    cracking,
  ] = createdBooks;

  // 3. Criando entradas de estante de livros (BookshelfEntry)
  await prisma.bookshelfEntry.createMany({
    data: [
      {
        userId: alice.id,
        bookId: cleanCode.id,
        status: ReadStatus.READ,
        favorite: true,
      },
      {
        userId: alice.id,
        bookId: pragmatic.id,
        status: ReadStatus.WANT_TO_READ,
      },
      { userId: alice.id, bookId: jsDefinitive.id, status: ReadStatus.READING },
      { userId: bob.id, bookId: cleanCode.id, status: ReadStatus.WANT_TO_READ },
      { userId: bob.id, bookId: cracking.id, status: ReadStatus.READ },
      {
        userId: charlie.id,
        bookId: designPatterns.id,
        status: ReadStatus.READ,
      },
    ],
  });

  // 4. Criando reviews
  await prisma.review.createMany({
    data: [
      {
        userId: alice.id,
        bookId: cleanCode.id,
        rating: 5,
        title: 'Um clássico obrigatório!',
        content: 'Este livro mudou minha forma de pensar sobre código.',
      },
      {
        userId: bob.id,
        bookId: cracking.id,
        rating: 4,
        title: 'Ótimo para entrevistas de emprego',
        content:
          'Excelente para praticar, mas as soluções podem ser um pouco difíceis.',
      },
    ],
  });

  // 5. Criando listas de livros
  const techBooksList = await prisma.list.create({
    data: {
      name: 'Livros de Tecnologia Essenciais',
      userId: adminUser.id,
      isPublic: true,
      coverBookId: cleanCode.id,
      books: {
        create: [
          { bookId: cleanCode.id, order: 1 },
          { bookId: pragmatic.id, order: 2 },
          { bookId: cracking.id, order: 3 },
        ],
      },
    },
  });

  const jsList = await prisma.list.create({
    data: {
      name: 'JavaScript Mastery',
      userId: alice.id,
      isPublic: true,
      coverBookId: jsDefinitive.id,
      books: {
        create: [
          { bookId: jsDefinitive.id, order: 1 },
          { bookId: youDontKnowJS.id, order: 2 },
        ],
      },
    },
  });

  // 6. Criando seguidores
  await prisma.follow.createMany({
    data: [
      { followerId: bob.id, followingId: alice.id },
      { followerId: charlie.id, followingId: alice.id },
      { followerId: alice.id, followingId: bob.id },
    ],
  });

  console.log('Seeding concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
