/*
  Warnings:

  - You are about to drop the column `inStock` on the `Product` table. All the data in the column will be lost.
  - Added the required column `orderNumber` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderNumber" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "total" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'processing',
    "address" TEXT NOT NULL,
    "phone" TEXT,
    "comment" TEXT,
    "deliveryMethod" TEXT,
    "paymentMethod" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Order" ("address", "comment", "createdAt", "deliveryMethod", "id", "paymentMethod", "phone", "status", "total", "updatedAt", "userId") SELECT "address", "comment", "createdAt", "deliveryMethod", "id", "paymentMethod", "phone", "status", "total", "updatedAt", "userId" FROM "Order";
DROP TABLE "Order";
ALTER TABLE "new_Order" RENAME TO "Order";
CREATE UNIQUE INDEX "Order_orderNumber_key" ON "Order"("orderNumber");
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "popularity" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Product" ("article", "categoryId", "createdAt", "description", "faction", "featured", "fileFormat", "gameSystem", "images", "name", "oldPrice", "popularity", "price", "scale", "tags", "type") SELECT "article", "categoryId", "createdAt", "description", "faction", "featured", "fileFormat", "gameSystem", "images", "name", "oldPrice", "popularity", "price", "scale", "tags", "type" FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
