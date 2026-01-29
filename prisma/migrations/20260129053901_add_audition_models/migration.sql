/*
  Warnings:

  - You are about to drop the column `createdAt` on the `CastMember` table. All the data in the column will be lost.
  - You are about to drop the column `photoUrl` on the `CastMember` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `CastMember` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Show` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Show` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `ShowPhoto` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "CastMember" DROP COLUMN "createdAt",
DROP COLUMN "photoUrl",
DROP COLUMN "updatedAt",
ADD COLUMN     "imageUrl" TEXT;

-- AlterTable
ALTER TABLE "Show" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "ShowPhoto" DROP COLUMN "createdAt";

-- CreateTable
CREATE TABLE "Audition" (
    "id" TEXT NOT NULL,
    "showId" TEXT NOT NULL,
    "description" TEXT,
    "location" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Audition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditionSlot" (
    "id" TEXT NOT NULL,
    "auditionId" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "capacity" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "AuditionSlot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditionAttendee" (
    "id" TEXT NOT NULL,
    "slotId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT,
    "phoneNumber" TEXT,
    "desiredRole" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditionAttendee_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Audition_showId_key" ON "Audition"("showId");

-- CreateIndex
CREATE INDEX "AuditionSlot_auditionId_idx" ON "AuditionSlot"("auditionId");

-- CreateIndex
CREATE INDEX "AuditionSlot_startTime_idx" ON "AuditionSlot"("startTime");

-- CreateIndex
CREATE INDEX "AuditionAttendee_slotId_idx" ON "AuditionAttendee"("slotId");

-- AddForeignKey
ALTER TABLE "Audition" ADD CONSTRAINT "Audition_showId_fkey" FOREIGN KEY ("showId") REFERENCES "Show"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditionSlot" ADD CONSTRAINT "AuditionSlot_auditionId_fkey" FOREIGN KEY ("auditionId") REFERENCES "Audition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditionAttendee" ADD CONSTRAINT "AuditionAttendee_slotId_fkey" FOREIGN KEY ("slotId") REFERENCES "AuditionSlot"("id") ON DELETE CASCADE ON UPDATE CASCADE;
