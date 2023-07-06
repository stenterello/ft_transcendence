/*
  Warnings:

  - A unique constraint covering the columns `[room]` on the table `Chat` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Chat_room_key" ON "chat"."Chat"("room");
