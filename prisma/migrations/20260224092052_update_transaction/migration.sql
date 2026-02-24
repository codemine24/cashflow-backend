-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "update_by_id" TEXT;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_update_by_id_fkey" FOREIGN KEY ("update_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
