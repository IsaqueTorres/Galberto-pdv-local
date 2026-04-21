import { FiscalSettingsPanel } from './components/FiscalSettingsPanel';

export default function ConfigFiscal() {
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

        <FiscalSettingsPanel />
      </div>
    </section>
  );
}
