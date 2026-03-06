/*
  Warnings:

  - A unique constraint covering the columns `[purchase_token]` on the table `subscriptions` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "subscriptions" ADD COLUMN     "package_name" TEXT,
ADD COLUMN     "product_id" TEXT,
ADD COLUMN     "purchase_token" TEXT,
ADD COLUMN     "transaction_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_purchase_token_key" ON "subscriptions"("purchase_token");
