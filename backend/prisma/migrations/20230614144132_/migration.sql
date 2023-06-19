/*
  Warnings:

  - You are about to drop the column `notifications` on the `User` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "user"."Type" AS ENUM ('FRIEND', 'MESSAGE', 'INVITEROOM', 'INVITEGAME');

-- AlterTable
ALTER TABLE "user"."User" DROP COLUMN "notifications";

-- CreateTable
CREATE TABLE "user"."Events" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" "user"."Type",
    "sender" TEXT NOT NULL,
    "receiverId" INTEGER NOT NULL,

    CONSTRAINT "Events_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "user"."Events" ADD CONSTRAINT "Events_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "user"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
