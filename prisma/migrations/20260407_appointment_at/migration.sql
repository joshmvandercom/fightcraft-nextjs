-- AlterTable
ALTER TABLE "Lead" ADD COLUMN "appointmentAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Lead_appointmentAt_idx" ON "Lead"("appointmentAt");
