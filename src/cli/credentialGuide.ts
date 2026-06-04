export const META_APP_DASHBOARD_URL = "https://developers.facebook.com/apps/";
export const META_WHATSAPP_GET_STARTED_URL = "https://developers.facebook.com/docs/whatsapp/cloud-api/get-started";
export const META_BUSINESS_SETTINGS_SYSTEM_USERS_URL = "https://business.facebook.com/settings/system-users";

export function formatCredentialGuide(): string {
  return `WBMCP requires three WhatsApp Business Platform values:

1. WhatsApp access token
   - Open Meta for Developers: ${META_APP_DASHBOARD_URL}
   - Select your app.
   - Open WhatsApp > API Setup.
   - For a quick test, copy the temporary access token.
   - For production, create a permanent System User token in Meta Business Settings:
     ${META_BUSINESS_SETTINGS_SYSTEM_USERS_URL}
   - Grant the token whatsapp_business_messaging and whatsapp_business_management permissions.

2. WhatsApp phone number ID
   - In the same WhatsApp > API Setup page, copy Phone number ID.
   - This is not the visible phone number; it is Meta's numeric ID for that number.

3. WhatsApp Business Account ID
   - In the same WhatsApp > API Setup page, copy WhatsApp Business Account ID.
   - You may also see this called WABA ID.

Official setup guide:
${META_WHATSAPP_GET_STARTED_URL}

Keep tokens private. Do not paste them into GitHub issues, chat logs, or committed files.`;
}

export function printCredentialGuide(): void {
  console.log(formatCredentialGuide());
}
