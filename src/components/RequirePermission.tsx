import { Navigate } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import { useSessionStore } from "../stores/session.store";
import { getPermissionDeniedMessage, hasAnyPermission, type Permission } from "../types/permissions";

type RequirePermissionProps = {
  anyOf: Permission[];
  children: React.ReactNode;
};

export function RequirePermission({ anyOf, children }: RequirePermissionProps) {
  const user = useSessionStore((state) => state.user);

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (!hasAnyPermission(user.role, anyOf)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-100 p-6">
        <div className="max-w-md rounded-3xl border border-amber-200 bg-white p-8 text-center shadow-xl">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
            <ShieldAlert className="h-7 w-7" />
          </div>
          <h1 className="text-xl font-bold text-zinc-900">Acesso não permitido</h1>
          <p className="mt-2 text-sm text-zinc-600">
            {getPermissionDeniedMessage(anyOf[0])}
          </p>
          <p className="mt-4 text-xs text-zinc-500">
            Usuário atual: {user.nome} ({user.role || "sem perfil"})
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
