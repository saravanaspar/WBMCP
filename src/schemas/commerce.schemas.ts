import { z } from "zod";
import { confirmationControlShape, graphIdSchema, httpsUrlSchema, paginationInputSchema, safeTextSchema } from "./common.schemas.js";

export const catalogIdInputSchema = z
  .object({
    catalog_id: graphIdSchema
  })
  .strict();

export const productIdInputSchema = z
  .object({
    product_id: graphIdSchema,
    ...confirmationControlShape
  })
  .strict();

export const listCatalogProductsInputSchema = paginationInputSchema
  .extend({
    catalog_id: graphIdSchema
  })
  .strict();

export const createCatalogProductInputSchema = z
  .object({
    catalog_id: graphIdSchema,
    retailer_id: z.string().trim().min(1).max(128),
    name: z.string().trim().min(1).max(256),
    description: safeTextSchema.optional(),
    price: z.number().int().nonnegative(),
    currency: z.string().trim().regex(/^[A-Z]{3}$/),
    availability: z.enum(["in stock", "out of stock", "preorder", "available for order", "discontinued"]).default("in stock"),
    condition: z.enum(["new", "refurbished", "used"]).default("new"),
    image_url: httpsUrlSchema,
    url: httpsUrlSchema.optional(),
    brand: z.string().trim().min(1).max(128).optional(),
    ...confirmationControlShape
  })
  .strict();

const updateCatalogProductShape = {
  retailer_id: z.string().trim().min(1).max(128).optional(),
  name: z.string().trim().min(1).max(256).optional(),
  description: safeTextSchema.optional(),
  price: z.number().int().nonnegative().optional(),
  currency: z.string().trim().regex(/^[A-Z]{3}$/).optional(),
  availability: z.enum(["in stock", "out of stock", "preorder", "available for order", "discontinued"]).optional(),
  condition: z.enum(["new", "refurbished", "used"]).optional(),
  image_url: httpsUrlSchema.optional(),
  url: httpsUrlSchema.optional(),
  brand: z.string().trim().min(1).max(128).optional()
};

export const updateCatalogProductInputSchema = z
  .object({
    product_id: graphIdSchema,
    ...updateCatalogProductShape,
    ...confirmationControlShape
  })
  .strict()
  .refine((value) => Object.keys(value).some((key) => key !== "product_id" && key !== "confirm"), {
    message: "provide at least one product field"
  });

export const listCommerceCatalogsInputSchema = paginationInputSchema
  .extend({
    business_id: graphIdSchema.optional()
  })
  .strict();

export type CatalogIdInput = z.infer<typeof catalogIdInputSchema>;
export type ProductIdInput = z.infer<typeof productIdInputSchema>;
export type ListCatalogProductsInput = z.infer<typeof listCatalogProductsInputSchema>;
export type CreateCatalogProductInput = z.infer<typeof createCatalogProductInputSchema>;
export type UpdateCatalogProductInput = z.infer<typeof updateCatalogProductInputSchema>;
export type ListCommerceCatalogsInput = z.infer<typeof listCommerceCatalogsInputSchema>;
