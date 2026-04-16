import { useState } from 'react'
import ConfigUsuarios from './ConfigUsuarios'
import ConfigPrinters from './ConfigPrinters'
import ConfigERP from './ConfigERP'
import ConfigFiscal from './ConfigFiscal'
import { Tab } from './components/Tab'
import { AbaConfig } from './types/config.types'

export default function Config() {
  const [abaAtiva, setAbaAtiva] = useState<AbaConfig>('Usuarios')

  return (
    <div className="h-full w-full bg-zinc-100 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      <div className="flex h-full flex-col">
        {/* Cabeçalho */}
        <div className="border-b border-zinc-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/80 backdrop-blur-sm">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-6 py-5">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Configurações do sistema</h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Gerencie usuários, impressoras e integrações do PDV.
              </p>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2">
              <Tab
                label="Usuários"
                ativa={abaAtiva === 'Usuarios'}
                onClick={() => setAbaAtiva('Usuarios')}
              />
              <Tab
                label="Impressoras"
                ativa={abaAtiva === 'Impressoras'}
                onClick={() => setAbaAtiva('Impressoras')}
              />
              <Tab
                label="Integracoes / ERP"
                ativa={abaAtiva === 'Integracoes / ERP'}
                onClick={() => setAbaAtiva('Integracoes / ERP')}
              />
              <Tab
                label="Fiscal"
                ativa={abaAtiva === 'Fiscal'}
                onClick={() => setAbaAtiva('Fiscal')}
              />
            </div>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="flex-1 overflow-auto">
          <div className="mx-auto w-full max-w-7xl px-6 py-6">
            <div className="min-h-[calc(100vh-180px)] rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <div className="p-6 md:p-8">
                {abaAtiva === 'Usuarios' && <ConfigUsuarios />}
                {abaAtiva === 'Impressoras' && <ConfigPrinters />}
                {abaAtiva === 'Integracoes / ERP' && <ConfigERP />}
                {abaAtiva === 'Fiscal' && <ConfigFiscal />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
