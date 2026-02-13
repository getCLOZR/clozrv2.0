/**
 * Ingest service. Load store, call connector ingest, upsert products + variants, return counts.
 */
import { db } from "@/src/db";
import { ingestProducts } from "@/src/connectors/shopify/ingest";

export interface IngestResult {
  productsCreated: number;
  productsUpdated: number;
  variantsCreated: number;
  variantsUpdated: number;
}

export async function runIngest(storeId: string): Promise<IngestResult> {
  const store = await db.store.findUnique({
    where: { id: storeId },
  });
  if (!store?.accessToken || !store.shop) {
    throw new Error("Store not found or missing credentials");
  }

  const results = await ingestProducts(store.shop, store.accessToken);
  let productsCreated = 0;
  let productsUpdated = 0;
  let variantsCreated = 0;
  let variantsUpdated = 0;

  for (const { cps, raw } of results) {
    const platformProductId = String(raw.id);
    // Build minimal CPS object here so DB never gets raw in normalizedJson (connector may return refs).
    const normalizedJson = JSON.parse(
      JSON.stringify({
        id: cps.id,
        title: cps.title,
        descriptionText: cps.descriptionText,
        imageUrls: cps.imageUrls,
        variants: cps.variants.map((v) => ({
          id: v.id,
          sku: v.sku,
          price: v.price,
          inventory_quantity: v.inventory_quantity,
          options: v.options,
        })),
      })
    ) as Record<string, unknown>;
    const productData = {
      title: raw.title ?? null,
      bodyHtml: raw.body_html ?? null,
      handle: raw.handle ?? null,
      vendor: raw.vendor ?? null,
      status: raw.status ?? null,
      descriptionText: cps.descriptionText,
      imageUrls: cps.imageUrls.length ? cps.imageUrls : undefined,
      rawJson: JSON.parse(JSON.stringify(raw)) as Record<string, unknown>,
      normalizedJson,
    };

    const existingProduct = await db.product.findFirst({
      where: { storeId, externalId: platformProductId },
    });
    const product = existingProduct
      ? await db.product.update({
          where: { id: existingProduct.id },
          data: productData,
        })
      : await db.product.create({
          data: { storeId, externalId: platformProductId, ...productData },
        });
    if (existingProduct) productsUpdated++;
    else productsCreated++;

    for (const v of cps.variants) {
      const platformVariantId = v.id;
      const variantData = {
        sku: v.sku ?? null,
        price: v.price,
        inventoryQty: v.inventory_quantity,
        optionsJson: v.options.length ? v.options : undefined,
      };
      const existingVariant = await db.variant.findFirst({
        where: { productId: product.id, externalId: platformVariantId },
      });
      if (existingVariant) {
        await db.variant.update({
          where: { id: existingVariant.id },
          data: variantData,
        });
        variantsUpdated++;
      } else {
        await db.variant.create({
          data: { productId: product.id, externalId: platformVariantId, ...variantData },
        });
        variantsCreated++;
      }
    }
  }

  return {
    productsCreated,
    productsUpdated,
    variantsCreated,
    variantsUpdated,
  };
}
