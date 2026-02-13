-- Score: add scoring fields and unique on productId
ALTER TABLE "Score" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Score" ADD COLUMN "overall" DOUBLE PRECISION;
ALTER TABLE "Score" ADD COLUMN "coverage" DOUBLE PRECISION;
ALTER TABLE "Score" ADD COLUMN "consistency" DOUBLE PRECISION;
ALTER TABLE "Score" ADD COLUMN "structure" DOUBLE PRECISION;
ALTER TABLE "Score" ADD COLUMN "eligibleSearch" BOOLEAN;
ALTER TABLE "Score" ADD COLUMN "eligibleCheckout" BOOLEAN;
ALTER TABLE "Score" ADD COLUMN "blockersJson" JSONB;
ALTER TABLE "Score" ADD COLUMN "warningsJson" JSONB;
ALTER TABLE "Score" ADD COLUMN "reasonsJson" JSONB;
ALTER TABLE "Score" ADD COLUMN "signalsJson" JSONB;
ALTER TABLE "Score" ALTER COLUMN "value" DROP NOT NULL;
-- Backfill: set default for new required columns so existing rows are valid
UPDATE "Score" SET "overall" = 0, "coverage" = 0, "consistency" = 0, "structure" = 0, "eligibleSearch" = false, "eligibleCheckout" = false WHERE "overall" IS NULL;
ALTER TABLE "Score" ALTER COLUMN "overall" SET NOT NULL;
ALTER TABLE "Score" ALTER COLUMN "coverage" SET NOT NULL;
ALTER TABLE "Score" ALTER COLUMN "consistency" SET NOT NULL;
ALTER TABLE "Score" ALTER COLUMN "structure" SET NOT NULL;
ALTER TABLE "Score" ALTER COLUMN "eligibleSearch" SET NOT NULL;
ALTER TABLE "Score" ALTER COLUMN "eligibleCheckout" SET NOT NULL;
-- One score per product (upsert key)
CREATE UNIQUE INDEX "Score_productId_key" ON "Score"("productId");
