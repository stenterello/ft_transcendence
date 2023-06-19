/*
  Warnings:

  - The values [INVITEGAME] on the enum `Type` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "user"."Type_new" AS ENUM ('FRIEND', 'MESSAGE', 'INVITEROOM');
ALTER TABLE "user"."Events" ALTER COLUMN "type" TYPE "user"."Type_new" USING ("type"::text::"user"."Type_new");
ALTER TYPE "user"."Type" RENAME TO "Type_old";
ALTER TYPE "user"."Type_new" RENAME TO "Type";
DROP TYPE "user"."Type_old";
COMMIT;
