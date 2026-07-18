import type { UserProfile } from "../api/types";

export const rolePermissions: Record<string, string[]> = {
  platform_admin: ["*"],
  organisation_admin: [
    "dashboard:view",
    "documents:view",
    "documents:upload",
    "documents:archive",
    "chat:ask",
    "analytics:view",
    "admin:view",
    "users:invite",
    "roles:sync",
    "support:view",
    "settings:manage",
    "search:view",
    "search:manage",
  ],
  knowledge_editor: [
    "dashboard:view",
    "documents:view",
    "documents:upload",
    "documents:archive",
    "chat:ask",
    "support:view",
    "search:view",
  ],
  auditor: [
    "dashboard:view",
    "documents:view",
    "chat:ask",
    "analytics:view",
    "support:view",
    "search:view",
  ],
  finance_reviewer: [
    "dashboard:view",
    "documents:view",
    "chat:ask",
    "analytics:view",
    "support:view",
  ],
  standard_user: [
    "dashboard:view",
    "documents:view",
    "chat:ask",
    "support:view",
  ],
};

export function hasPermission(user: UserProfile, permission: string) {
  const permissions = user.roles.flatMap((role) => rolePermissions[role] ?? []);
  return permissions.includes("*") || permissions.includes(permission);
}

export function firstAllowedView(user: UserProfile) {
  if (hasPermission(user, "dashboard:view")) return "dashboard";
  if (hasPermission(user, "documents:view")) return "documents";
  if (hasPermission(user, "chat:ask")) return "chat";
  if (hasPermission(user, "support:view")) return "support";
  return "support";
}
