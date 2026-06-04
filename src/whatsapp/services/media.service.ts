import type { GraphClient } from "../graphClient.js";
import type { JsonObject } from "../types.js";

export class MediaService {
  public constructor(private readonly client: GraphClient) {}

  public async getMedia(mediaId: string): Promise<JsonObject> {
    return this.client.get(`/${mediaId}`);
  }

  public async deleteMedia(mediaId: string): Promise<JsonObject> {
    return this.client.delete(`/${mediaId}`);
  }
}
