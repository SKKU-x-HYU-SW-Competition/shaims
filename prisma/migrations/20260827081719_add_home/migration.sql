-- CreateTable
CREATE TABLE "HomeContent" (
    "id" TEXT NOT NULL DEFAULT 'main',
    "title" TEXT NOT NULL,
    "subtitle" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomeContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HomeLink" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HomeLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HomeLink_order_idx" ON "HomeLink"("order");
