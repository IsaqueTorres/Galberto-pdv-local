import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import ConfigUsuarios from './ConfigUsuarios'
import ConfigPrinters from './ConfigPrinters'
import ConfigFiscal from './ConfigFiscal'
import { Tab } from './components/Tab'
import { AbaConfig } from './types/config.types'
import { useSessionStore } from '../../stores/session.store'
import { hasPermission, type Permission } from '../../types/permissions'

type ConfigTabDefinition = {
  key: AbaConfig;
  label: string;
  permission: Permission;
  component: ReactNode;
};

export default function Config() {
  const user = useSessionStore((state) => state.user);
  const [abaAtiva, setAbaAtiva] = useState<AbaConfig>('Usuarios')
  const tabs = useMemo<ConfigTabDefinition[]>(() => [
    {
      key: 'Usuarios',
      label: 'Usuários',
      permission: 'users:manage',
      component: <ConfigUsuarios />,
    },
    {
      key: 'Impressoras',
      label: 'Impressoras',
      permission: 'printers:manage',
      component: <ConfigPrinters />,
    },
    {
      key: 'Fiscal',
      label: 'Fiscal',
      permission: 'fiscal:manage',
      component: <ConfigFiscal />,
    },
  ], []);
  const allowedTabs = tabs.filter((tab) => hasPermission(user?.role, tab.permission));
  const activeTab = allowedTabs.find((tab) => tab.key === abaAtiva) ?? allowedTabs[0];

  useEffect(() => {
    if (activeTab && activeTab.key !== abaAtiva) {
      setAbaAtiva(activeTab.key);
    }
  }, [abaAtiva, activeTab]);

  return (
    <div className="h-full w-full bg-blue-100 text-blue-950">
      <div className="flex h-full flex-col">
        {/* Cabeçalho */}
        <div className="rounded-3xl border border-blue-200 bg-white/90 shadow-sm backdrop-blur-sm">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-6 py-5">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-blue-950">Configurações do sistema</h1>
              <p className="text-sm text-blue-800">
                Gerencie usuários, impressoras e configurações fiscais do PDV Local.
              </p>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2">
              {allowedTabs.map((tab) => (
                <Tab
                  key={tab.key}
                  label={tab.label}
                  ativa={activeTab?.key === tab.key}
                  onClick={() => setAbaAtiva(tab.key)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="flex-1 overflow-auto">
          <div className="mx-auto w-full max-w-7xl px-6 py-6">
            <div className="min-h-[calc(100vh-180px)] rounded-3xl border border-blue-200 bg-white shadow-sm">
              <div className="p-6 md:p-8">
                {activeTab?.component}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
