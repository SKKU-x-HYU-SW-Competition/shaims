-- CreateTable
CREATE TABLE "KnockoutMatch" (
    "id" TEXT NOT NULL,
    "round" INTEGER NOT NULL,
    "slot" INTEGER NOT NULL,
    "isThirdPlace" BOOLEAN NOT NULL DEFAULT false,
    "homeUserId" TEXT,
    "awayUserId" TEXT,
    "homeScore" INTEGER,
    "awayScore" INTEGER,
    "playedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KnockoutMatch_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "KnockoutMatch_homeUserId_idx" ON "KnockoutMatch"("homeUserId");

-- CreateIndex
CREATE INDEX "KnockoutMatch_awayUserId_idx" ON "KnockoutMatch"("awayUserId");

-- CreateIndex
CREATE UNIQUE INDEX "KnockoutMatch_round_slot_isThirdPlace_key" ON "KnockoutMatch"("round", "slot", "isThirdPlace");

-- AddForeignKey
ALTER TABLE "KnockoutMatch" ADD CONSTRAINT "KnockoutMatch_homeUserId_fkey" FOREIGN KEY ("homeUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnockoutMatch" ADD CONSTRAINT "KnockoutMatch_awayUserId_fkey" FOREIGN KEY ("awayUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
