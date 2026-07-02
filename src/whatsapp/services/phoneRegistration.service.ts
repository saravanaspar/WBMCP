import type { AppConfig } from "../../config/env.js";
import type {
  DeregisterPhoneNumberInput,
  RegisterPhoneNumberInput,
  RequestVerificationCodeInput,
  TwoStepPinInput,
  UpdatePhoneNumberSettingsInput,
  VerifyCodeInput
} from "../../schemas/phone.schemas.js";
import type { GraphClient } from "../graphClient.js";
import type { JsonObject } from "../types.js";
import { toJsonObject } from "../types.js";

export class PhoneRegistrationService {
  public constructor(
    private readonly client: GraphClient,
    private readonly config: AppConfig
  ) {}

  public async requestVerificationCode(input: RequestVerificationCodeInput): Promise<JsonObject> {
    return this.client.postJson(`/${this.phoneNumberId(input.phone_number_id)}/request_code`, {
      code_method: input.code_method,
      locale: input.locale
    });
  }

  public async verifyCode(input: VerifyCodeInput): Promise<JsonObject> {
    return this.client.postJson(`/${this.phoneNumberId(input.phone_number_id)}/verify_code`, {
      code: input.code
    });
  }

  public async register(input: RegisterPhoneNumberInput): Promise<JsonObject> {
    return this.client.postJson(`/${this.phoneNumberId(input.phone_number_id)}/register`, {
      messaging_product: "whatsapp",
      pin: input.pin
    });
  }

  public async deregister(input: DeregisterPhoneNumberInput): Promise<JsonObject> {
    return this.client.postJson(`/${this.phoneNumberId(input.phone_number_id)}/deregister`, {});
  }

  public async setTwoStepPin(input: TwoStepPinInput): Promise<JsonObject> {
    return this.client.postJson(`/${this.phoneNumberId(input.phone_number_id)}`, {
      pin: input.pin
    });
  }

  public async getSettings(phoneNumberId: string | undefined): Promise<JsonObject> {
    return this.client.get(`/${this.phoneNumberId(phoneNumberId)}`, {
      fields: "id,display_phone_number,verified_name,quality_rating,platform_type,code_verification_status,webhook_configuration"
    });
  }

  public async updateSettings(input: UpdatePhoneNumberSettingsInput): Promise<JsonObject> {
    const phoneNumberId = input.phone_number_id;
    const payload = toJsonObject(input);
    delete payload.phone_number_id;
    delete payload.confirm;
    return this.client.postJson(`/${this.phoneNumberId(phoneNumberId)}`, payload);
  }

  private phoneNumberId(inputPhoneNumberId: string | undefined): string {
    return inputPhoneNumberId ?? this.config.phoneNumberId;
  }
}
