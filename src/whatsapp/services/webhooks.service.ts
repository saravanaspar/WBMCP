import type { AppConfig } from "../../config/env.js";
import type { GraphClient } from "../graphClient.js";
import type { JsonObject } from "../types.js";

export class WebhooksService {
  public constructor(
    private readonly client: GraphClient,
    private readonly config: AppConfig
  ) {}

  public async listSubscribedApps(): Promise<JsonObject> {
    return this.client.get(`/${this.config.businessAccountId}/subscribed_apps`);
  }

  public async subscribeApp(): Promise<JsonObject> {
    return this.client.postJson(`/${this.config.businessAccountId}/subscribed_apps`, {});
  }

  public async unsubscribeApp(): Promise<JsonObject> {
    return this.client.delete(`/${this.config.businessAccountId}/subscribed_apps`);
  }
}
