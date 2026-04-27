import { useState } from 'react';
import { FiscalSettingsPanel } from './components/FiscalSettingsPanel';
import { FiscalStorePanel } from './components/FiscalStorePanel';
import type { FiscalStoreRecord } from './types/fiscal-config.types';

export default function ConfigFiscal() {
  const [storeReady, setStoreReady] = useState<FiscalStoreRecord | null>(null);

  return (
    <section className="p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-blue-950">
            Fiscal NFC-e
          </h1>
          <p className="mt-2 max-w-3xl text-sm font-medium text-blue-800">
            Configure provider fiscal, certificado digital, CSC, contingência e acompanhe a fila
            de reprocessamento. Toda a operação sensível fica no Main Process do Electron.
          </p>
        </div>

        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm font-medium text-blue-700">
          A emissão NFC-e depende de conectividade com SEFAZ ou gateway, exceto quando o fallback
          estiver configurado para contingência/fila. O operador do caixa não precisa manipular
          credenciais na UI.
        </div>

        <FiscalStorePanel onStoreReady={setStoreReady} />

        {storeReady ? (
          <FiscalSettingsPanel />
        ) : (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm font-semibold text-slate-600">
            Cadastre a Store fiscal para liberar certificado, CSC, SEFAZ e diagnostico de emissao.
          </div>
        )}
      </div>
    </section>
  );
}
