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
    const productData = {
      title: raw.title ?? null,
      bodyHtml: raw.body_html ?? null,
      handle: raw.handle ?? null,
      vendor: raw.vendor ?? null,
      status: raw.status ?? null,
      descriptionText: cps.descriptionText,
      imageUrls: cps.imageUrls.length ? cps.imageUrls : undefined,
      rawJson: raw as unknown as Record<string, unknown>,
      normalizedJson: cps as unknown as Record<string, unknown>,
    };

    const product = await db.product.upsert({
      where: {
        storeId_externalId: { storeId, externalId: platformProductId },
      },
      create: {
        storeId,
        externalId: platformProductId,
        ...productData,
      },
      update: productData,
    });

    if (product.createdAt.getTime() === product.updatedAt.getTime()) {
      productsCreated++;
    } else {
      productsUpdated++;
    }

    for (const v of cps.variants) {
      const platformVariantId = v.id;
      const priceNum = v.price != null ? parseFloat(v.price) : null;
      const variantData = {
        sku: v.sku ?? null,
        price: priceNum,
        inventoryQty: v.inventory_quantity,
        optionsJson: v.options.length ? v.options : undefined,
      };

      const variant = await db.variant.upsert({
        where: {
          productId_externalId: { productId: product.id, externalId: platformVariantId },
        },
        create: {
          productId: product.id,
          externalId: platformVariantId,
          ...variantData,
        },
        update: variantData,
      });

      if (variant.createdAt.getTime() === variant.updatedAt.getTime()) {
        variantsCreated++;
      } else {
        variantsUpdated++;
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
