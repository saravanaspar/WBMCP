import type { AppConfig } from "../../config/env.js";
import type { CreateFlowInput, FlowJsonInput, ListFlowsInput, UpdateFlowInput } from "../../schemas/flow.schemas.js";
import type { GraphClient } from "../graphClient.js";
import type { JsonObject } from "../types.js";
import { toJsonObject } from "../types.js";

export class FlowsService {
  public constructor(
    private readonly client: GraphClient,
    private readonly config: AppConfig
  ) {}

  public async listFlows(input: ListFlowsInput): Promise<JsonObject> {
    return this.client.get(`/${this.config.businessAccountId}/flows`, {
      fields: "id,name,status,categories,validation_errors,json_version,data_api_version,endpoint_uri",
      limit: input.limit,
      after: input.after,
      status: input.status
    });
  }

  public async getFlow(flowId: string): Promise<JsonObject> {
    return this.client.get(`/${flowId}`, {
      fields: "id,name,status,categories,validation_errors,json_version,data_api_version,endpoint_uri"
    });
  }

  public async createFlow(input: CreateFlowInput): Promise<JsonObject> {
    const payload = toJsonObject(input);
    delete payload.confirm;
    return this.client.postJson(`/${this.config.businessAccountId}/flows`, payload);
  }

  public async updateFlow(input: UpdateFlowInput): Promise<JsonObject> {
    const flowId = input.flow_id;
    const payload = toJsonObject(input);
    delete payload.flow_id;
    delete payload.confirm;
    return this.client.postJson(`/${flowId}`, payload);
  }

  public async updateFlowJson(input: FlowJsonInput): Promise<JsonObject> {
    return this.client.postJson(`/${input.flow_id}/assets`, {
      name: "flow.json",
      asset_type: "FLOW_JSON",
      flow_json: toJsonObject(input.flow_json)
    });
  }

  public async publishFlow(flowId: string): Promise<JsonObject> {
    return this.client.postJson(`/${flowId}/publish`, {});
  }

  public async deprecateFlow(flowId: string): Promise<JsonObject> {
    return this.client.postJson(`/${flowId}/deprecate`, {});
  }

  public async deleteFlow(flowId: string): Promise<JsonObject> {
    return this.client.delete(`/${flowId}`);
  }
}
