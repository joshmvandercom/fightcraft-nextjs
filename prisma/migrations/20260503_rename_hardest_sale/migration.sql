-- Generalize the question-2 field for non-sales roles.
ALTER TABLE "CareerApplication" RENAME COLUMN "hardestSale" TO "keyExperience";
