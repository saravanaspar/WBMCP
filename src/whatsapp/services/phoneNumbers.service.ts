import type { AccountService } from "./account.service.js";
import type { JsonObject } from "../types.js";

export class PhoneNumbersService {
  public constructor(private readonly accountService: AccountService) {}

  public async getPhoneNumber(): Promise<JsonObject> {
    return this.accountService.getPhoneNumber();
  }

  public async listPhoneNumbers(limit: number, after?: string): Promise<JsonObject> {
    return this.accountService.listPhoneNumbers(limit, after);
  }
}
