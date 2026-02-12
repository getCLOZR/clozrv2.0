-- Product: ingest fields and unique for upsert
ALTER TABLE "Product" ADD COLUMN "handle" TEXT;
ALTER TABLE "Product" ADD COLUMN "vendor" TEXT;
ALTER TABLE "Product" ADD COLUMN "status" TEXT;
ALTER TABLE "Product" ADD COLUMN "descriptionText" TEXT;
ALTER TABLE "Product" ADD COLUMN "imageUrls" JSONB;
ALTER TABLE "Product" ADD COLUMN "rawJson" JSONB;
ALTER TABLE "Product" ADD COLUMN "normalizedJson" JSONB;

CREATE UNIQUE INDEX "Product_storeId_externalId_key" ON "Product"("storeId", "externalId");

-- Variant: price, inventoryQty, optionsJson and unique for upsert
ALTER TABLE "Variant" ADD COLUMN "price" DOUBLE PRECISION;
ALTER TABLE "Variant" ADD COLUMN "inventoryQty" INTEGER;
ALTER TABLE "Variant" ADD COLUMN "optionsJson" JSONB;

CREATE UNIQUE INDEX "Variant_productId_externalId_key" ON "Variant"("productId", "externalId");
