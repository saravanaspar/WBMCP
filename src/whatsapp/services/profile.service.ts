import type { AppConfig } from "../../config/env.js";
import type { GraphClient } from "../graphClient.js";
import type { JsonObject } from "../types.js";
import { toJsonObject } from "../types.js";

export interface UpdateBusinessProfileInput {
  readonly about?: string | undefined;
  readonly address?: string | undefined;
  readonly description?: string | undefined;
  readonly email?: string | undefined;
  readonly websites?: readonly string[] | undefined;
  readonly vertical?: string | undefined;
}

export class ProfileService {
  public constructor(
    private readonly client: GraphClient,
    private readonly config: AppConfig
  ) {}

  public async getBusinessProfile(): Promise<JsonObject> {
    return this.client.get(`/${this.config.phoneNumberId}/whatsapp_business_profile`, {
      fields: "about,address,description,email,profile_picture_url,websites,vertical"
    });
  }

  public async updateBusinessProfile(input: UpdateBusinessProfileInput): Promise<JsonObject> {
    return this.client.postJson(`/${this.config.phoneNumberId}/whatsapp_business_profile`, {
      messaging_product: "whatsapp",
      ...toJsonObject(input)
    });
  }
}
