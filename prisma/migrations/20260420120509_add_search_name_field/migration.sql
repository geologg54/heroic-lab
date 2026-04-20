-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Product" (
    "article" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "searchName" TEXT NOT NULL DEFAULT '',
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
CREATE INDEX "Product_name_idx" ON "Product"("name");
CREATE INDEX "Product_article_idx" ON "Product"("article");
CREATE INDEX "Product_searchName_idx" ON "Product"("searchName");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
