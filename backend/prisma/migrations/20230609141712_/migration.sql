-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "chat";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "matches";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "rooms";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "user";

-- CreateTable
CREATE TABLE "user"."User" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'offline',
    "score" INTEGER NOT NULL DEFAULT 0,
    "pictureLink" TEXT DEFAULT 'http://localhost:3000/uploads/default-avatar.png',
    "victories" INTEGER NOT NULL DEFAULT 0,
    "loses" INTEGER NOT NULL DEFAULT 0,
    "matches" INTEGER NOT NULL DEFAULT 0,
    "password" TEXT,
    "cookie" TEXT,
    "expires" TIMESTAMP(3),
    "twofaSecret" TEXT,
    "istwofaEnable" BOOLEAN DEFAULT false,
    "isOAuthLogged" BOOLEAN DEFAULT false,
    "socketId" TEXT,
    "notifications" TEXT[],
    "friends" TEXT[],
    "friendsReq" TEXT[],
    "blocklist" TEXT[],
    "privateConv" TEXT[],

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat"."Chat" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "author" TEXT NOT NULL,
    "room" TEXT NOT NULL,
    "message" TEXT NOT NULL,

    CONSTRAINT "Chat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rooms"."Rooms" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT,
    "admins" TEXT[],
    "banlist" TEXT[],
    "members" TEXT[],

    CONSTRAINT "Rooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "matches"."Matches" (
    "id" SERIAL NOT NULL,
    "player1" TEXT NOT NULL,
    "player2" TEXT NOT NULL,
    "score" TEXT NOT NULL,

    CONSTRAINT "Matches_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "user"."User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "user"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_password_key" ON "user"."User"("password");

-- CreateIndex
CREATE UNIQUE INDEX "User_cookie_key" ON "user"."User"("cookie");

-- CreateIndex
CREATE UNIQUE INDEX "User_twofaSecret_key" ON "user"."User"("twofaSecret");

-- CreateIndex
CREATE UNIQUE INDEX "User_socketId_key" ON "user"."User"("socketId");

-- CreateIndex
CREATE UNIQUE INDEX "Rooms_name_key" ON "rooms"."Rooms"("name");
