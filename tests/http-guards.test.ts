import { describe, expect, it } from "vitest";
import {
  isBearerTokenAuthorized,
  isContentLengthTooLarge,
  isInitializeRequest,
  parseRequestPath
} from "../src/server/httpGuards.js";

describe("HTTP transport guards", () => {
  it("parses paths without trusting Host headers", () => {
    expect(parseRequestPath("/mcp")).toBe("/mcp");
    expect(parseRequestPath("http://example.test/mcp?x=1")).toBe("/mcp");
    expect(parseRequestPath("http://[")).toBeUndefined();
  });

  it("requires a matching bearer token", () => {
    const token = "a".repeat(32);

    expect(isBearerTokenAuthorized(`Bearer ${token}`, token)).toBe(true);
    expect(isBearerTokenAuthorized(undefined, token)).toBe(false);
    expect(isBearerTokenAuthorized(`Bearer ${"b".repeat(32)}`, token)).toBe(false);
    expect(isBearerTokenAuthorized(`Basic ${token}`, token)).toBe(false);
  });

  it("detects initialize requests including batches", () => {
    expect(isInitializeRequest({ jsonrpc: "2.0", id: 1, method: "initialize" })).toBe(true);
    expect(isInitializeRequest([{ method: "tools/list" }, { method: "initialize" }])).toBe(true);
    expect(isInitializeRequest({ jsonrpc: "2.0", id: 2, method: "tools/list" })).toBe(false);
  });

  it("detects oversized content length", () => {
    expect(isContentLengthTooLarge("2048", 1024)).toBe(true);
    expect(isContentLengthTooLarge("1024", 1024)).toBe(false);
    expect(isContentLengthTooLarge(undefined, 1024)).toBe(false);
  });
});
