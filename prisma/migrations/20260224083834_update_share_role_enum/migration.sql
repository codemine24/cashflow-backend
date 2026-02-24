/*
  Warnings:

  - The values [OWNER] on the enum `ShareRole` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ShareRole_new" AS ENUM ('EDITOR', 'VIEWER');
ALTER TABLE "public"."book_members" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "book_members" ALTER COLUMN "role" TYPE "ShareRole_new" USING ("role"::text::"ShareRole_new");
ALTER TYPE "ShareRole" RENAME TO "ShareRole_old";
ALTER TYPE "ShareRole_new" RENAME TO "ShareRole";
DROP TYPE "public"."ShareRole_old";
ALTER TABLE "book_members" ALTER COLUMN "role" SET DEFAULT 'VIEWER';
COMMIT;
