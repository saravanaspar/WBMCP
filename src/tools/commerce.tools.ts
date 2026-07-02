import {
  catalogIdInputSchema,
  createCatalogProductInputSchema,
  listCatalogProductsInputSchema,
  listCommerceCatalogsInputSchema,
  productIdInputSchema,
  updateCatalogProductInputSchema
} from "../schemas/commerce.schemas.js";
import { defineTool, type ToolDefinition } from "./types.js";
import { successResult } from "./toolResult.js";

export function createCommerceTools(): ToolDefinition[] {
  return [
    defineTool({
      name: "whatsapp_list_catalogs",
      title: "List WhatsApp Commerce Catalogs",
      description: "Lists commerce catalogs owned by the configured business or supplied business ID.",
      inputSchema: listCommerceCatalogsInputSchema,
      group: "commerce",
      inputShape: listCommerceCatalogsInputSchema.shape,
      permission: "read",
      idempotent: true,
      execute: async (input, context) => successResult(await context.services.commerce.listCatalogs(input))
    }),
    defineTool({
      name: "whatsapp_get_catalog",
      title: "Get WhatsApp Commerce Catalog",
      description: "Reads metadata for one commerce catalog.",
      inputSchema: catalogIdInputSchema,
      group: "commerce",
      inputShape: catalogIdInputSchema.shape,
      permission: "read",
      idempotent: true,
      execute: async (input, context) => successResult(await context.services.commerce.getCatalog(input.catalog_id))
    }),
    defineTool({
      name: "whatsapp_list_catalog_products",
      title: "List WhatsApp Catalog Products",
      description: "Lists products in a commerce catalog.",
      inputSchema: listCatalogProductsInputSchema,
      group: "commerce",
      inputShape: listCatalogProductsInputSchema.shape,
      permission: "read",
      idempotent: true,
      execute: async (input, context) => successResult(await context.services.commerce.listProducts(input))
    }),
    defineTool({
      name: "whatsapp_get_catalog_product",
      title: "Get WhatsApp Catalog Product",
      description: "Reads one commerce catalog product.",
      inputSchema: productIdInputSchema,
      group: "commerce",
      inputShape: productIdInputSchema.shape,
      permission: "read",
      idempotent: true,
      execute: async (input, context) => successResult(await context.services.commerce.getProduct(input.product_id))
    }),
    defineTool({
      name: "whatsapp_create_catalog_product",
      title: "Create WhatsApp Catalog Product",
      description: "Creates one commerce catalog product. Requires dangerous tools to be enabled.",
      inputSchema: createCatalogProductInputSchema,
      group: "commerce",
      inputShape: createCatalogProductInputSchema.shape,
      permission: "dangerous",
      execute: async (input, context) => successResult(await context.services.commerce.createProduct(input))
    }),
    defineTool({
      name: "whatsapp_update_catalog_product",
      title: "Update WhatsApp Catalog Product",
      description: "Updates one commerce catalog product. Requires dangerous tools to be enabled.",
      inputSchema: updateCatalogProductInputSchema,
      group: "commerce",
      inputShape: updateCatalogProductInputSchema.shape,
      permission: "dangerous",
      execute: async (input, context) => successResult(await context.services.commerce.updateProduct(input))
    }),
    defineTool({
      name: "whatsapp_delete_catalog_product",
      title: "Delete WhatsApp Catalog Product",
      description: "Deletes one commerce catalog product. Requires dangerous tools to be enabled.",
      inputSchema: productIdInputSchema,
      group: "commerce",
      inputShape: productIdInputSchema.shape,
      permission: "dangerous",
      execute: async (input, context) => successResult(await context.services.commerce.deleteProduct(input.product_id))
    })
  ];
}
