/*
  Warnings:

  - A unique constraint covering the columns `[user_id,title]` on the table `categories` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "categories_user_id_title_key" ON "categories"("user_id", "title");
