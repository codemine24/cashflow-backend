-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "attachment" TEXT[] DEFAULT ARRAY[]::TEXT[];
