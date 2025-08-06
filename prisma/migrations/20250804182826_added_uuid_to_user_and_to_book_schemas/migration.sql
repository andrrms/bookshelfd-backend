/*
  Warnings:

  - The primary key for the `Book` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `BookValidation` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The required column `uuid` was added to the `User` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Book" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "isbn" TEXT,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "contributorId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deletedAt" DATETIME,
    CONSTRAINT "Book_contributorId_fkey" FOREIGN KEY ("contributorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Book" ("author", "contributorId", "createdAt", "deletedAt", "description", "id", "isbn", "status", "title", "updatedAt") SELECT "author", "contributorId", "createdAt", "deletedAt", "description", "id", "isbn", "status", "title", "updatedAt" FROM "Book";
DROP TABLE "Book";
ALTER TABLE "new_Book" RENAME TO "Book";
CREATE UNIQUE INDEX "Book_isbn_key" ON "Book"("isbn");
CREATE TABLE "new_BookValidation" (
    "bookId" TEXT NOT NULL,
    "validatorId" INTEGER NOT NULL,
    "isValid" BOOLEAN NOT NULL,
    "reason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" DATETIME,

    PRIMARY KEY ("bookId", "validatorId"),
    CONSTRAINT "BookValidation_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "BookValidation_validatorId_fkey" FOREIGN KEY ("validatorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_BookValidation" ("bookId", "createdAt", "deletedAt", "isValid", "reason", "validatorId") SELECT "bookId", "createdAt", "deletedAt", "isValid", "reason", "validatorId" FROM "BookValidation";
DROP TABLE "BookValidation";
ALTER TABLE "new_BookValidation" RENAME TO "BookValidation";
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "uuid" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "reputation" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deletedAt" DATETIME
);
INSERT INTO "new_User" ("createdAt", "deletedAt", "email", "id", "password", "reputation", "updatedAt", "username") SELECT "createdAt", "deletedAt", "email", "id", "password", "reputation", "updatedAt", "username" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_uuid_key" ON "User"("uuid");
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
