import type { AppConfig } from "../../config/env.js";
import type { GraphClient } from "../graphClient.js";
import type { JsonObject } from "../types.js";

export class AccountService {
  public constructor(
    private readonly client: GraphClient,
    private readonly config: AppConfig
  ) {}

  public async healthCheck(): Promise<JsonObject> {
    const phoneNumber = await this.getPhoneNumber();
    return {
      ok: true,
      graph_api_version: this.config.graphApiVersion,
      phone_number_id: this.config.phoneNumberId,
      phone_number: phoneNumber
    };
  }

  public async getBusinessAccount(): Promise<JsonObject> {
    return this.client.get(`/${this.config.businessAccountId}`, {
      fields: "id,name,currency,timezone_id,message_template_namespace"
    });
  }

  public async getPhoneNumber(): Promise<JsonObject> {
    return this.client.get(`/${this.config.phoneNumberId}`, {
      fields: "id,display_phone_number,verified_name,quality_rating,platform_type,code_verification_status"
    });
  }

  public async listPhoneNumbers(limit: number, after?: string): Promise<JsonObject> {
    return this.client.get(`/${this.config.businessAccountId}/phone_numbers`, {
      fields: "id,display_phone_number,verified_name,quality_rating,platform_type,code_verification_status",
      limit,
      after
    });
  }
}
