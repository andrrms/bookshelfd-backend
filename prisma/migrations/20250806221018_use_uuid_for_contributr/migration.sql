/*
  Warnings:

  - You are about to drop the column `contributorId` on the `Book` table. All the data in the column will be lost.
  - The primary key for the `BookValidation` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `validatorId` on the `BookValidation` table. All the data in the column will be lost.
  - Added the required column `contributorUuid` to the `Book` table without a default value. This is not possible if the table is not empty.
  - Added the required column `validatorUuid` to the `BookValidation` table without a default value. This is not possible if the table is not empty.

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
    "contributorUuid" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deletedAt" DATETIME,
    CONSTRAINT "Book_contributorUuid_fkey" FOREIGN KEY ("contributorUuid") REFERENCES "User" ("uuid") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Book" ("author", "createdAt", "deletedAt", "description", "id", "isbn", "status", "title", "updatedAt") SELECT "author", "createdAt", "deletedAt", "description", "id", "isbn", "status", "title", "updatedAt" FROM "Book";
DROP TABLE "Book";
ALTER TABLE "new_Book" RENAME TO "Book";
CREATE UNIQUE INDEX "Book_isbn_key" ON "Book"("isbn");
CREATE TABLE "new_BookValidation" (
    "bookId" TEXT NOT NULL,
    "validatorUuid" TEXT NOT NULL,
    "isValid" BOOLEAN NOT NULL,
    "reason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" DATETIME,

    PRIMARY KEY ("bookId", "validatorUuid"),
    CONSTRAINT "BookValidation_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "BookValidation_validatorUuid_fkey" FOREIGN KEY ("validatorUuid") REFERENCES "User" ("uuid") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_BookValidation" ("bookId", "createdAt", "deletedAt", "isValid", "reason") SELECT "bookId", "createdAt", "deletedAt", "isValid", "reason" FROM "BookValidation";
DROP TABLE "BookValidation";
ALTER TABLE "new_BookValidation" RENAME TO "BookValidation";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
