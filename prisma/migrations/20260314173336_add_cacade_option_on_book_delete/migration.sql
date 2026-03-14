-- DropForeignKey
ALTER TABLE "books" DROP CONSTRAINT "books_user_id_fkey";

-- AddForeignKey
ALTER TABLE "books" ADD CONSTRAINT "books_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
