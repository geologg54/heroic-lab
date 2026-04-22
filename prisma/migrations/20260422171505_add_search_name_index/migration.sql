/*
  Warnings:

  - You are about to drop the column `faction` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `featured` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `fileFormat` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `gameSystem` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `popularity` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Product` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CartItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "productArticle" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CartItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CartItem_productArticle_fkey" FOREIGN KEY ("productArticle") REFERENCES "Product" ("article") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_CartItem" ("createdAt", "id", "productArticle", "quantity", "updatedAt", "userId") SELECT "createdAt", "id", "productArticle", "quantity", "updatedAt", "userId" FROM "CartItem";
DROP TABLE "CartItem";
ALTER TABLE "new_CartItem" RENAME TO "CartItem";
CREATE TABLE "new_Category" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "image" TEXT,
    "parentId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "filter1Name" TEXT,
    "filter2Name" TEXT,
    "filter3Name" TEXT,
    "filter4Name" TEXT,
    "filter5Name" TEXT,
    CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Category" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Category" ("id", "image", "name", "parentId", "slug") SELECT "id", "image", "name", "parentId", "slug" FROM "Category";
DROP TABLE "Category";
ALTER TABLE "new_Category" RENAME TO "Category";
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");
CREATE TABLE "new_Product" (
    "article" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "searchName" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "oldPrice" INTEGER,
    "description" TEXT NOT NULL DEFAULT '',
    "images" TEXT NOT NULL DEFAULT '',
    "categoryId" TEXT NOT NULL,
    "filter1" TEXT,
    "filter2" TEXT,
    "filter3" TEXT,
    "filter4" TEXT,
    "filter5" TEXT,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "heightMax" REAL,
    "baseMax" REAL,
    "heightMin" REAL,
    "baseMin" REAL,
    "assembly" TEXT,
    "contents" TEXT,
    "artist" TEXT,
    "scale" TEXT NOT NULL DEFAULT '32mm',
    "tags" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Product" ("article", "categoryId", "createdAt", "description", "images", "name", "oldPrice", "price", "scale", "searchName", "tags") SELECT "article", "categoryId", "createdAt", "description", "images", "name", "oldPrice", "price", "scale", "searchName", "tags" FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
CREATE INDEX "Product_searchName_idx" ON "Product"("searchName");
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'user',
    "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
    "twoFactorSecret" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_User" ("createdAt", "email", "id", "name", "password", "role", "twoFactorEnabled", "twoFactorSecret") SELECT "createdAt", "email", "id", "name", "password", "role", "twoFactorEnabled", "twoFactorSecret" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
