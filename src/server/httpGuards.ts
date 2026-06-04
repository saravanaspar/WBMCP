import { timingSafeEqual } from "node:crypto";

export function parseRequestPath(url: string | undefined): string | undefined {
  try {
    return new URL(url ?? "/", "http://localhost").pathname;
  } catch {
    return undefined;
  }
}

export function isBearerTokenAuthorized(authorization: string | undefined, expectedToken: string): boolean {
  if (!authorization?.startsWith("Bearer ")) {
    return false;
  }

  const providedToken = authorization.slice("Bearer ".length);
  const expected = Buffer.from(expectedToken);
  const provided = Buffer.from(providedToken);
  return expected.length === provided.length && timingSafeEqual(expected, provided);
}

export function isInitializeRequest(body: unknown): boolean {
  if (Array.isArray(body)) {
    return body.some(isInitializeRequest);
  }

  return (
    typeof body === "object" &&
    body !== null &&
    "method" in body &&
    (body as { method?: unknown }).method === "initialize"
  );
}

export function isContentLengthTooLarge(contentLength: string | undefined, maxBodyBytes: number): boolean {
  if (!contentLength) {
    return false;
  }

  const parsed = Number(contentLength);
  return Number.isFinite(parsed) && parsed > maxBodyBytes;
}
