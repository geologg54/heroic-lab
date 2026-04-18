/*
  Warnings:

  - You are about to drop the `DownloadToken` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `downloadsCount` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `fileUrl` on the `Product` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "DownloadToken_token_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "DownloadToken";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "popularity" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Product" ("article", "categoryId", "createdAt", "description", "faction", "featured", "fileFormat", "gameSystem", "images", "inStock", "name", "oldPrice", "popularity", "price", "scale", "tags", "type") SELECT "article", "categoryId", "createdAt", "description", "faction", "featured", "fileFormat", "gameSystem", "images", "inStock", "name", "oldPrice", "popularity", "price", "scale", "tags", "type" FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
