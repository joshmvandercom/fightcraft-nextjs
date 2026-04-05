-- DropIndex
DROP INDEX IF EXISTS "Lead_email_idx";

-- CreateIndex
CREATE UNIQUE INDEX "Lead_email_key" ON "Lead"("email");
