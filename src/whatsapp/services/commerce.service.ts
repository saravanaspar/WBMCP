import type { AppConfig } from "../../config/env.js";
import type {
  CreateCatalogProductInput,
  ListCatalogProductsInput,
  ListCommerceCatalogsInput,
  UpdateCatalogProductInput
} from "../../schemas/commerce.schemas.js";
import type { GraphClient } from "../graphClient.js";
import type { JsonObject } from "../types.js";
import { toJsonObject } from "../types.js";

export class CommerceService {
  public constructor(
    private readonly client: GraphClient,
    private readonly config: AppConfig
  ) {}

  public async listCatalogs(input: ListCommerceCatalogsInput): Promise<JsonObject> {
    const businessId = input.business_id ?? this.config.businessAccountId;
    return this.client.get(`/${businessId}/owned_product_catalogs`, {
      fields: "id,name,product_count,vertical",
      limit: input.limit,
      after: input.after
    });
  }

  public async getCatalog(catalogId: string): Promise<JsonObject> {
    return this.client.get(`/${catalogId}`, {
      fields: "id,name,product_count,vertical"
    });
  }

  public async listProducts(input: ListCatalogProductsInput): Promise<JsonObject> {
    return this.client.get(`/${input.catalog_id}/products`, {
      fields: "id,retailer_id,name,description,price,currency,availability,condition,url,image_url,brand",
      limit: input.limit,
      after: input.after
    });
  }

  public async getProduct(productId: string): Promise<JsonObject> {
    return this.client.get(`/${productId}`, {
      fields: "id,retailer_id,name,description,price,currency,availability,condition,url,image_url,brand"
    });
  }

  public async createProduct(input: CreateCatalogProductInput): Promise<JsonObject> {
    return this.client.postJson(`/${input.catalog_id}/products`, productPayload(input));
  }

  public async updateProduct(input: UpdateCatalogProductInput): Promise<JsonObject> {
    return this.client.postJson(`/${input.product_id}`, productPayload(input));
  }

  public async deleteProduct(productId: string): Promise<JsonObject> {
    return this.client.delete(`/${productId}`);
  }
}

function productPayload(input: CreateCatalogProductInput | UpdateCatalogProductInput): JsonObject {
  const payload = toJsonObject(input);
  delete payload.catalog_id;
  delete payload.product_id;
  delete payload.confirm;
  return payload;
}
