-- CreateTable
CREATE TABLE "settings" (
    "id" TEXT NOT NULL,
    "theme" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'english',
    "currency" TEXT NOT NULL DEFAULT 'BDT',
    "push_notification" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);
