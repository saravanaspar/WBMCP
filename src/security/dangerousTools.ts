export class DangerousToolDisabledError extends Error {
  public constructor(toolName: string) {
    super(
      `${toolName} is disabled because MCP_ENABLE_DANGEROUS_TOOLS is not true. Re-run only after an explicit operator decision.`
    );
    this.name = "DangerousToolDisabledError";
  }
}
