/*
  Warnings:

  - You are about to drop the column `productId` on the `DownloadToken` table. All the data in the column will be lost.
  - You are about to drop the column `productId` on the `OrderItem` table. All the data in the column will be lost.
  - The primary key for the `Product` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `slug` on the `Product` table. All the data in the column will be lost.
  - Added the required column `productArticle` to the `DownloadToken` table without a default value. This is not possible if the table is not empty.
  - Added the required column `productArticle` to the `OrderItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `article` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_DownloadToken" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "token" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "productArticle" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_DownloadToken" ("expiresAt", "id", "orderId", "token", "used") SELECT "expiresAt", "id", "orderId", "token", "used" FROM "DownloadToken";
DROP TABLE "DownloadToken";
ALTER TABLE "new_DownloadToken" RENAME TO "DownloadToken";
CREATE UNIQUE INDEX "DownloadToken_token_key" ON "DownloadToken"("token");
CREATE TABLE "new_OrderItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "productArticle" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "priceAtPurchase" INTEGER NOT NULL,
    CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "OrderItem_productArticle_fkey" FOREIGN KEY ("productArticle") REFERENCES "Product" ("article") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_OrderItem" ("id", "orderId", "priceAtPurchase", "quantity") SELECT "id", "orderId", "priceAtPurchase", "quantity" FROM "OrderItem";
DROP TABLE "OrderItem";
ALTER TABLE "new_OrderItem" RENAME TO "OrderItem";
CREATE TABLE "new_Product" (
    "article" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "oldPrice" INTEGER,
    "images" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "gameSystem" TEXT NOT NULL,
    "scale" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "faction" TEXT,
    "fileFormat" TEXT NOT NULL,
    "tags" TEXT NOT NULL,
    "inStock" BOOLEAN NOT NULL DEFAULT true,
    "downloadsCount" INTEGER NOT NULL DEFAULT 0,
    "fileUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "popularity" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Product" ("categoryId", "createdAt", "description", "downloadsCount", "faction", "featured", "fileFormat", "fileUrl", "gameSystem", "images", "inStock", "name", "oldPrice", "popularity", "price", "scale", "tags", "type") SELECT "categoryId", "createdAt", "description", "downloadsCount", "faction", "featured", "fileFormat", "fileUrl", "gameSystem", "images", "inStock", "name", "oldPrice", "popularity", "price", "scale", "tags", "type" FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
