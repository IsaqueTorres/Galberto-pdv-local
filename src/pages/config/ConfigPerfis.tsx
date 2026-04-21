import { Fragment } from "react";
import { Check, ShieldCheck, X } from "lucide-react";
import {
  getPermissionsForRole,
  PERMISSION_DESCRIPTIONS,
  ROLE_OPTIONS,
  type PermissionDescription,
} from "../../types/permissions";

function groupPermissions() {
  return PERMISSION_DESCRIPTIONS.reduce<Record<string, PermissionDescription[]>>((acc, permission) => {
    acc[permission.group] = acc[permission.group] ?? [];
    acc[permission.group].push(permission);
    return acc;
  }, {});
}

export default function ConfigPerfis() {
  const groupedPermissions = groupPermissions();

  return (
    <section className="animate-in fade-in duration-500">
      <div className="mb-8 flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
              Perfis e permissões
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Consulte o que cada perfil pode executar no Galberto PDV.
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950/60">
                <th className="sticky left-0 z-10 min-w-64 bg-zinc-50 px-5 py-4 text-left font-bold text-zinc-800 dark:bg-zinc-950 dark:text-zinc-100">
                  Permissão
                </th>
                {ROLE_OPTIONS.map((role) => (
                  <th key={role.value} className="min-w-44 px-5 py-4 text-center">
                    <div className="font-bold text-zinc-900 dark:text-zinc-100">{role.label}</div>
                    <div className="mt-1 text-xs font-normal leading-4 text-zinc-500">{role.description}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(groupedPermissions).map(([group, permissions]) => (
                <Fragment key={group}>
                  <tr className="border-b border-zinc-200 bg-zinc-100/80 dark:border-zinc-800 dark:bg-zinc-800/60">
                    <td colSpan={ROLE_OPTIONS.length + 1} className="px-5 py-3 text-xs font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                      {group}
                    </td>
                  </tr>
                  {permissions.map((permission) => (
                    <tr key={permission.key} className="border-b border-zinc-100 last:border-0 dark:border-zinc-800">
                      <td className="sticky left-0 z-10 bg-white px-5 py-4 font-semibold text-zinc-800 dark:bg-zinc-900 dark:text-zinc-100">
                        {permission.label}
                      </td>
                      {ROLE_OPTIONS.map((role) => {
                        const allowed = getPermissionsForRole(role.value).includes(permission.key);
                        return (
                          <td key={`${role.value}-${permission.key}`} className="px-5 py-4 text-center">
                            <span
                              className={`inline-flex h-8 w-8 items-center justify-center rounded-xl border ${
                                allowed
                                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                  : "border-zinc-200 bg-zinc-50 text-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-600"
                              }`}
                              title={allowed ? "Permitido" : "Bloqueado"}
                            >
                              {allowed ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
        Esta tela é informativa. Para alterar o perfil de um colaborador, acesse a aba <strong>Usuários</strong> e edite o usuário.
      </div>
    </section>
  );
}
