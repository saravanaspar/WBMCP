import type { AppConfig } from "../../config/env.js";
import type {
  CreateMessageTemplateInput,
  DeleteMessageTemplateInput,
  ListMessageTemplatesInput,
  SendTemplateMessageInput
} from "../../schemas/template.schemas.js";
import type { GraphClient } from "../graphClient.js";
import type { JsonObject } from "../types.js";
import { toJsonValue } from "../types.js";

export class TemplatesService {
  public constructor(
    private readonly client: GraphClient,
    private readonly config: AppConfig
  ) {}

  public async listTemplates(input: ListMessageTemplatesInput): Promise<JsonObject> {
    return this.client.get(`/${this.config.businessAccountId}/message_templates`, {
      fields: "id,name,status,language,category,components,quality_score,rejected_reason",
      limit: input.limit,
      after: input.after,
      status: input.status,
      category: input.category,
      name: input.name
    });
  }

  public async getTemplate(templateId: string): Promise<JsonObject> {
    return this.client.get(`/${templateId}`, {
      fields: "id,name,status,language,category,components,quality_score,rejected_reason"
    });
  }

  public async createTemplate(input: CreateMessageTemplateInput): Promise<JsonObject> {
    return this.client.postJson(`/${this.config.businessAccountId}/message_templates`, {
      name: input.name,
      category: input.category,
      language: input.language,
      components: toJsonValue(input.components)
    });
  }

  public async deleteTemplate(input: DeleteMessageTemplateInput): Promise<JsonObject> {
    return this.client.delete(`/${this.config.businessAccountId}/message_templates`, {
      name: input.name,
      hsm_id: input.template_id
    });
  }

  public validatePayload(input: SendTemplateMessageInput): JsonObject {
    return {
      valid: true,
      template_name: input.template_name,
      language_code: input.language_code,
      component_count: input.components.length,
      parameter_count: input.components.reduce((sum, component) => sum + component.parameters.length, 0)
    };
  }
}
