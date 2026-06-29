export class ReadOnlyToolBlockedError extends Error {
  public constructor(toolName: string) {
    super(`${toolName} is blocked because MCP_READ_ONLY is true. Disable read-only mode only after an explicit operator decision.`);
    this.name = "ReadOnlyToolBlockedError";
  }
}

export class ToolConfirmationRequiredError extends Error {
  public readonly toolName: string;
  public readonly confirmationMessage: string;

  public constructor(toolName: string, confirmationMessage: string) {
    super(confirmationMessage);
    this.name = "ToolConfirmationRequiredError";
    this.toolName = toolName;
    this.confirmationMessage = confirmationMessage;
  }
}

export function isToolControlInput(value: unknown): value is { readonly confirm?: boolean; readonly dryRun?: boolean } {
  return typeof value === "object" && value !== null;
}

export function getToolControls(value: unknown): { confirm: boolean; dryRun: boolean } {
  if (!isToolControlInput(value)) {
    return { confirm: false, dryRun: false };
  }

  return {
    confirm: value.confirm === true,
    dryRun: value.dryRun === true
  };
}
