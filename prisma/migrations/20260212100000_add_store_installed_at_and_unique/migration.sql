-- Add installedAt for OAuth completion time
ALTER TABLE "Store" ADD COLUMN "installedAt" TIMESTAMP(3);

-- Ensure shop is set for existing rows so we can add NOT NULL and unique
UPDATE "Store" SET "shop" = '' WHERE "shop" IS NULL;

-- Make shop required and add compound unique for upsert
ALTER TABLE "Store" ALTER COLUMN "shop" SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "Store_platform_shop_key" ON "Store"("platform", "shop");
