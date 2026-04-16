import { useState } from "react";
import Sales from "./SalesDashboard";
import { Tab } from "./components/Tab";
type AbaConfig = 'Vendas' | 'Gerenciar Vendas'

export default function SalesMainPage() {
  const [abaAtiva, setAbaAtiva] = useState<AbaConfig>('Vendas')

  return (

    <div className="flex flex-col h-full animate-in fade-in duration-500">
      <div className="flex gap-8 px-2 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/50 backdrop-blur-md">
        <Tab
          label="Vendas"
          ativa={abaAtiva === 'Vendas'}
          onClick={() => setAbaAtiva('Vendas')}
        />
      </div>

      {/* ÁREA DE CONTEÚDO - Fundo Neutro para não cansar */}
      <div className="flex-1 overflow-auto py-8">
        <div className="max-w-350 mx-auto">
          {abaAtiva === 'Vendas' && <Sales />}
        </div>
      </div>

    </div>
  )
}

