export type ToolPermission = "read" | "dangerous";

export interface PermissionExplanation {
  readonly permission: ToolPermission;
  readonly description: string;
  readonly requiresDangerousToolsEnabled: boolean;
}

export const PERMISSION_EXPLANATIONS: Record<ToolPermission, PermissionExplanation> = {
  read: {
    permission: "read",
    description: "Reads WhatsApp Business Platform state and does not mutate Meta resources.",
    requiresDangerousToolsEnabled: false
  },
  dangerous: {
    permission: "dangerous",
    description: "Can send messages, delete data, or change externally visible business state.",
    requiresDangerousToolsEnabled: true
  }
};

export function requiresDangerousTools(permission: ToolPermission): boolean {
  return permission === "dangerous";
}
