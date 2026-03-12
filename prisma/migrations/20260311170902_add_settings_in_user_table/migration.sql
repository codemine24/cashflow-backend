-- DropForeignKey
ALTER TABLE "settings" DROP CONSTRAINT "settings_user_id_fkey";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'BDT',
ADD COLUMN     "language" TEXT NOT NULL DEFAULT 'english',
ADD COLUMN     "push_notification" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "theme" "Theme" NOT NULL DEFAULT 'LIGHT';
