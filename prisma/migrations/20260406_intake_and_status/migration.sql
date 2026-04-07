-- AlterTable
ALTER TABLE "Lead" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'lead',
                  ADD COLUMN "statusReason" TEXT,
                  ADD COLUMN "notes" TEXT;

-- CreateIndex
CREATE INDEX "Lead_status_idx" ON "Lead"("status");

-- CreateTable
CREATE TABLE "Intake" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "dob" TEXT,
    "emergencyName" TEXT,
    "emergencyPhone" TEXT,
    "goals" TEXT,
    "experience" TEXT,
    "injuries" TEXT,
    "howHeard" TEXT,
    "programInterest" TEXT,
    "availableClasses" TEXT,
    "waiverAccepted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Intake_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Intake_leadId_idx" ON "Intake"("leadId");

-- AddForeignKey
ALTER TABLE "Intake" ADD CONSTRAINT "Intake_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;
