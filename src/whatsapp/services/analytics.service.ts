import type { AppConfig } from "../../config/env.js";
import type { AnalyticsInput } from "../../schemas/analytics.schemas.js";
import type { GraphClient } from "../graphClient.js";
import type { JsonObject } from "../types.js";

export class AnalyticsService {
  public constructor(
    private readonly client: GraphClient,
    private readonly config: AppConfig
  ) {}

  public async getConversationAnalytics(input: AnalyticsInput): Promise<JsonObject> {
    return this.client.get(`/${this.config.businessAccountId}`, {
      fields: `conversation_analytics.start(${input.start_date}).end(${input.end_date}).granularity(${input.granularity})`
    });
  }

  public async getTemplateAnalytics(input: AnalyticsInput): Promise<JsonObject> {
    return this.client.get(`/${this.config.businessAccountId}`, {
      fields: `template_analytics.start(${input.start_date}).end(${input.end_date}).granularity(${input.granularity})`
    });
  }
}
