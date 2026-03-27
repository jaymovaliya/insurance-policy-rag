-- CreateEnum
CREATE TYPE "PolicyStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "policies" (
    "id" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "status" "PolicyStatus" NOT NULL DEFAULT 'PENDING',
    "pageCount" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "policies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chunks" (
    "id" TEXT NOT NULL,
    "policyId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "section" TEXT,
    "page" INTEGER,
    "chunkIndex" INTEGER NOT NULL,
    "tokenCount" INTEGER NOT NULL,

    CONSTRAINT "chunks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "chunks_policyId_idx" ON "chunks"("policyId");

-- AddForeignKey
ALTER TABLE "chunks" ADD CONSTRAINT "chunks_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "policies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
