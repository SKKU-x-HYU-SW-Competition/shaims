-- AlterTable
ALTER TABLE "User" ADD COLUMN     "groupId" TEXT;

-- CreateTable
CREATE TABLE "Group" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroupMatch" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "homeUserId" TEXT NOT NULL,
    "awayUserId" TEXT NOT NULL,
    "homeScore" INTEGER,
    "awayScore" INTEGER,
    "playedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GroupMatch_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Group_name_key" ON "Group"("name");

-- CreateIndex
CREATE INDEX "GroupMatch_groupId_idx" ON "GroupMatch"("groupId");

-- CreateIndex
CREATE INDEX "GroupMatch_homeUserId_idx" ON "GroupMatch"("homeUserId");

-- CreateIndex
CREATE INDEX "GroupMatch_awayUserId_idx" ON "GroupMatch"("awayUserId");

-- CreateIndex
CREATE INDEX "User_groupId_idx" ON "User"("groupId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupMatch" ADD CONSTRAINT "GroupMatch_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupMatch" ADD CONSTRAINT "GroupMatch_homeUserId_fkey" FOREIGN KEY ("homeUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupMatch" ADD CONSTRAINT "GroupMatch_awayUserId_fkey" FOREIGN KEY ("awayUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
