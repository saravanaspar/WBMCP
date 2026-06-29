export function createDangerousToolDisabledError(toolName: string): Error {
  const error = new Error(
    `${toolName} is disabled because MCP_ENABLE_DANGEROUS_TOOLS is not true. Re-run only after an explicit operator decision.`
  );
  error.name = "DangerousToolDisabledError";
  return error;
}
