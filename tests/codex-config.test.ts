import { describe, expect, it } from "vitest";
import { upsertWbmcpSection } from "../src/cli/codexConfig.js";

describe("Codex config", () => {
  it("adds WBMCP config to an empty config file", () => {
    expect(upsertWbmcpSection("")).toBe(
      '[mcp_servers.WBMCP]\ncommand = "npx"\nargs = ["-y", "wbmcp@latest"]\nstartup_timeout_sec = 20\n'
    );
  });

  it("replaces an existing WBMCP section without changing other servers", () => {
    const existing = [
      "model = \"gpt-5.5\"",
      "",
      "[mcp_servers.WBMCP]",
      "command = \"old\"",
      "[mcp_servers.WBMCP.env]",
      "TOKEN = \"old\"",
      "[mcp_servers.context7]",
      "command = \"npx\""
    ].join("\n");

    const updated = upsertWbmcpSection(existing);

    expect(updated).toContain("model = \"gpt-5.5\"");
    expect(updated).toContain("[mcp_servers.context7]\ncommand = \"npx\"");
    expect(updated).toContain('[mcp_servers.WBMCP]\ncommand = "npx"');
    expect(updated).not.toContain('TOKEN = "old"');
  });
});
