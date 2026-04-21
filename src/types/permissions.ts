export type Permission =
  | "home:access"
  | "pdv:access"
  | "sales:view"
  | "products:view"
  | "products:manage"
  | "discounts:apply"
  | "cash:withdraw"
  | "config:access"
  | "users:manage"
  | "printers:manage"
  | "integrations:manage"
  | "fiscal:manage";

export type NormalizedRole = "admin" | "manager" | "cashier" | "stock" | "unknown";

export type RoleOption = {
  value: string;
  label: string;
  description: string;
};

export type PermissionDescription = {
  key: Permission;
  label: string;
  group: string;
};

export const PERMISSION_DESCRIPTIONS: PermissionDescription[] = [
  { key: "home:access", label: "Acessar Home", group: "Geral" },
  { key: "pdv:access", label: "Acessar PDV", group: "Caixa" },
  { key: "sales:view", label: "Consultar vendas", group: "Caixa" },
  { key: "discounts:apply", label: "Conceder descontos", group: "Caixa" },
  { key: "cash:withdraw", label: "Registrar sangria", group: "Caixa" },
  { key: "products:view", label: "Buscar produtos", group: "Produtos" },
  { key: "products:manage", label: "Gerenciar produtos", group: "Produtos" },
  { key: "config:access", label: "Acessar configurações", group: "Administração" },
  { key: "users:manage", label: "Gerenciar usuários", group: "Administração" },
  { key: "printers:manage", label: "Gerenciar impressoras", group: "Administração" },
  { key: "integrations:manage", label: "Gerenciar integrações", group: "Administração" },
  { key: "fiscal:manage", label: "Gerenciar fiscal", group: "Administração" },
];

export const ROLE_OPTIONS: RoleOption[] = [
  {
    value: "Caixa",
    label: "Caixa",
    description: "Acessa o PDV, consulta vendas e busca produtos. Não acessa configurações nem usuários.",
  },
  {
    value: "Gerente",
    label: "Gerente",
    description: "Acesso completo à operação, configurações, usuários e perfis. Não acessa impressoras, integrações nem fiscal.",
  },
  {
    value: "Admin",
    label: "Administrador",
    description: "Acesso total ao sistema. Use para dono, suporte ou administração principal.",
  },
  {
    value: "Estoque",
    label: "Estoque",
    description: "Acessa produtos e rotinas de estoque. Não acessa caixa nem configurações administrativas.",
  },
];

const ROLE_ALIASES: Record<NormalizedRole, string[]> = {
  admin: ["admin", "administrador", "administrator", "dono", "owner"],
  manager: ["gerente", "gestor", "manager", "supervisor"],
  cashier: ["caixa", "operador", "operador de caixa", "atendente", "vendedor"],
  stock: ["estoque", "almoxarife"],
  unknown: [],
};

const ROLE_PERMISSIONS: Record<NormalizedRole, Permission[]> = {
  admin: [
    "pdv:access",
    "home:access",
    "sales:view",
    "products:view",
    "products:manage",
    "discounts:apply",
    "cash:withdraw",
    "config:access",
    "users:manage",
    "printers:manage",
    "integrations:manage",
    "fiscal:manage",
  ],
  manager: [
    "pdv:access",
    "home:access",
    "sales:view",
    "products:view",
    "products:manage",
    "discounts:apply",
    "cash:withdraw",
    "config:access",
    "users:manage",
  ],
  cashier: ["pdv:access", "sales:view", "products:view"],
  stock: ["home:access", "products:view", "products:manage"],
  unknown: [],
};

export function normalizeRole(role?: string | null): NormalizedRole {
  const normalized = String(role ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  for (const [roleKey, aliases] of Object.entries(ROLE_ALIASES) as Array<[NormalizedRole, string[]]>) {
    if (aliases.includes(normalized)) return roleKey;
  }

  return "unknown";
}

export function getPermissionsForRole(role?: string | null): Permission[] {
  return ROLE_PERMISSIONS[normalizeRole(role)];
}

export function hasPermission(role: string | null | undefined, permission: Permission): boolean {
  return getPermissionsForRole(role).includes(permission);
}

export function hasAnyPermission(role: string | null | undefined, permissions: Permission[]): boolean {
  return permissions.some((permission) => hasPermission(role, permission));
}

export function getPermissionDeniedMessage(permission: Permission): string {
  const messages: Record<Permission, string> = {
    "home:access": "Seu perfil não pode acessar a tela inicial.",
    "pdv:access": "Seu perfil não pode acessar o caixa.",
    "sales:view": "Seu perfil não pode consultar vendas.",
    "products:view": "Seu perfil não pode consultar produtos.",
    "products:manage": "Seu perfil não pode gerenciar produtos.",
    "discounts:apply": "Somente gerente ou administrador pode conceder descontos.",
    "cash:withdraw": "Somente gerente ou administrador pode registrar sangria.",
    "config:access": "Seu perfil não pode acessar as configurações.",
    "users:manage": "Somente gerente ou administrador pode gerenciar usuários.",
    "printers:manage": "Somente gerente ou administrador pode gerenciar impressoras.",
    "integrations:manage": "Somente gerente ou administrador pode gerenciar integrações.",
    "fiscal:manage": "Somente gerente ou administrador pode gerenciar configurações fiscais.",
  };

  return messages[permission];
}
