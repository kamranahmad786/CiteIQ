ROLE_PERMISSIONS: dict[str, set[str]] = {
    "platform_admin": {"*"},
    "organisation_admin": {
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
    },
    "knowledge_editor": {
        "dashboard:view",
        "documents:view",
        "documents:upload",
        "documents:archive",
        "chat:ask",
        "support:view",
        "search:view",
    },
    "auditor": {
        "dashboard:view",
        "documents:view",
        "chat:ask",
        "analytics:view",
        "support:view",
        "search:view",
    },
    "finance_reviewer": {
        "dashboard:view",
        "documents:view",
        "chat:ask",
        "analytics:view",
        "support:view",
    },
    "standard_user": {
        "dashboard:view",
        "documents:view",
        "chat:ask",
        "support:view",
    },
}


def permissions_for_roles(roles: list[str]) -> set[str]:
    permissions: set[str] = set()
    for role in roles:
        role_permissions = ROLE_PERMISSIONS.get(role, set())
        if "*" in role_permissions:
            return {"*"}
        permissions.update(role_permissions)
    return permissions


def has_permission(roles: list[str], permission: str) -> bool:
    permissions = permissions_for_roles(roles)
    return "*" in permissions or permission in permissions
