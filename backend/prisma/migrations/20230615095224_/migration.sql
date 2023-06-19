-- DropForeignKey
ALTER TABLE "user"."Events" DROP CONSTRAINT "Events_receiverId_fkey";

-- AddForeignKey
ALTER TABLE "user"."Events" ADD CONSTRAINT "Events_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "user"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
