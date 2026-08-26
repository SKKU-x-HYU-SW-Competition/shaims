-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'PARTICIPANT');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "teamName" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'PARTICIPANT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_teamName_key" ON "User"("teamName");
