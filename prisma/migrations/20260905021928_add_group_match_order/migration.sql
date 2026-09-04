-- AlterTable
ALTER TABLE "GroupMatch" ADD COLUMN "order" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "GroupMatch_groupId_order_key" ON "GroupMatch"("groupId", "order");
