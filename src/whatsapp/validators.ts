const E164_PATTERN = /^\+[1-9]\d{7,14}$/;
const GRAPH_ID_PATTERN = /^[A-Za-z0-9_.:-]{1,128}$/;

export function isE164PhoneNumber(value: string): boolean {
  return E164_PATTERN.test(value);
}

export function normalizePhoneForWhatsApp(value: string): string {
  return value.replace(/^\+/, "");
}

export function maskPhoneNumber(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length <= 4) {
    return "[REDACTED_PHONE]";
  }
  return `[REDACTED_PHONE:${digits.slice(-4)}]`;
}

export function isSafeGraphId(value: string): boolean {
  return GRAPH_ID_PATTERN.test(value);
}

export function stripUrlQuery(value: string): string {
  try {
    const url = new URL(value);
    if (!url.search && !url.hash) {
      return value;
    }
    url.search = "";
    url.hash = "";
    return `${url.toString()}?[REDACTED_QUERY]`;
  } catch {
    return value;
  }
}

export function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}
