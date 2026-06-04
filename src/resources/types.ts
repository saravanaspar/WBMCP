import type { JsonValue } from "../whatsapp/types.js";
import type { ToolContext } from "../tools/types.js";

export interface ResourceDefinition {
  readonly name: string;
  readonly uri: string;
  readonly title: string;
  readonly description: string;
  readonly read: (context: ToolContext) => Promise<JsonValue>;
}
