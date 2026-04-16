import { FiscalSettingsPanel } from './components/FiscalSettingsPanel';

export default function ConfigFiscal() {
  return (
    <section className="p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-800 dark:text-white">
            Fiscal NFC-e
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-zinc-500 dark:text-zinc-400">
            Configure provider fiscal, certificado digital, CSC, contingência e acompanhe a fila
            de reprocessamento. Toda a operação sensível fica no Main Process do Electron.
          </p>
        </div>

        <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-700 dark:border-blue-900/30 dark:bg-blue-900/10 dark:text-blue-400">
          A emissão NFC-e depende de conectividade com SEFAZ ou gateway, exceto quando o fallback
          estiver configurado para contingência/fila. O operador do caixa não precisa manipular
          credenciais na UI.
        </div>

        <FiscalSettingsPanel />
      </div>
    </section>
  );
}

