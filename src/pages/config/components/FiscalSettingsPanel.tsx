import { useEffect, useState } from 'react';
import { fiscalConfigService } from '../services/fiscal-config.service';
import type {
  CertificateInfo,
  FiscalConfigInput,
  FiscalConfigView,
  FiscalContingencyMode,
  FiscalEnvironment,
  FiscalProviderKind,
  FiscalQueueItem,
  FiscalQueueSummary,
} from '../types/fiscal-config.types';

const defaultForm: FiscalConfigInput = {
  provider: 'mock',
  environment: 'homologation',
  contingencyMode: 'queue',
  sefazBaseUrl: '',
  gatewayBaseUrl: '',
  gatewayApiKey: '',
  certificatePath: '',
  certificatePassword: '',
  cscId: '',
  cscToken: '',
  defaultSeries: 1,
};

export function FiscalSettingsPanel() {
  const [form, setForm] = useState<FiscalConfigInput>(defaultForm);
  const [config, setConfig] = useState<FiscalConfigView | null>(null);
  const [certificateInfo, setCertificateInfo] = useState<CertificateInfo | null>(null);
  const [queueSummary, setQueueSummary] = useState<FiscalQueueSummary | null>(null);
  const [queueItems, setQueueItems] = useState<FiscalQueueItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [runtimeConfig, certificate, summary, queue] = await Promise.all([
        fiscalConfigService.getConfig(),
        fiscalConfigService.getCertificateInfo(),
        fiscalConfigService.getQueueSummary(),
        fiscalConfigService.listQueue(8),
      ]);

      setConfig(runtimeConfig);
      setCertificateInfo(certificate);
      setQueueSummary(summary);
      setQueueItems(queue);
      setForm({
        provider: runtimeConfig.provider,
        environment: runtimeConfig.environment,
        contingencyMode: runtimeConfig.contingencyMode,
        sefazBaseUrl: runtimeConfig.sefazBaseUrl ?? '',
        gatewayBaseUrl: runtimeConfig.gatewayBaseUrl ?? '',
        gatewayApiKey: '',
        certificatePath: runtimeConfig.certificatePath ?? '',
        certificatePassword: '',
        cscId: runtimeConfig.cscId ?? '',
        cscToken: '',
        defaultSeries: runtimeConfig.defaultSeries ?? 1,
      });
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Erro ao carregar configuração fiscal.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function updateField<K extends keyof FiscalConfigInput>(field: K, value: FiscalConfigInput[K]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const saved = await fiscalConfigService.saveConfig(form);
      setConfig(saved);
      await load();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Erro ao salvar configuração fiscal.');
    } finally {
      setSaving(false);
    }
  }

  async function handleRetry(queueId: string) {
    try {
      await fiscalConfigService.reprocessQueueItem(queueId);
      await load();
    } catch (retryError) {
      setError(retryError instanceof Error ? retryError.message : 'Erro ao reprocessar item da fila.');
    }
  }

  async function handleProcessNow() {
    try {
      await fiscalConfigService.processNextQueueItem();
      await load();
    } catch (processError) {
      setError(processError instanceof Error ? processError.message : 'Erro ao processar a fila fiscal.');
    }
  }

  const providers: Array<{ value: FiscalProviderKind; label: string }> = [
    { value: 'mock', label: 'Mock' },
    { value: 'sefaz-direct', label: 'SEFAZ Direta' },
    { value: 'gateway', label: 'Gateway Fiscal' },
  ];

  const environments: Array<{ value: FiscalEnvironment; label: string }> = [
    { value: 'homologation', label: 'Homologação' },
    { value: 'production', label: 'Produção' },
  ];

  const contingencies: Array<{ value: FiscalContingencyMode; label: string }> = [
    { value: 'queue', label: 'Fila/Reprocesso' },
    { value: 'offline-contingency', label: 'Contingência Offline' },
    { value: 'online', label: 'Somente Online' },
  ];

  return (
    <div className="rounded-2xl border border-blue-300 bg-gradient-to-br from-blue-50 via-white to-blue-50/70 p-5 shadow-lg shadow-blue-900/10">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-blue-950">Camada Fiscal NFC-e</h2>
          <p className="mt-1 text-sm font-medium text-blue-800">
            Configuração do provider fiscal, certificado e fila offline-first no Main Process.
          </p>
        </div>
        {config && (
          <div className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            {config.integrationId}
          </div>
        )}
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {error}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="grid gap-4 md:grid-cols-3">
            <SelectCard
              label="Provider"
              value={form.provider}
              options={providers}
              onChange={(value) => updateField('provider', value as FiscalProviderKind)}
              disabled={loading || saving}
            />
            <SelectCard
              label="Ambiente"
              value={form.environment}
              options={environments}
              onChange={(value) => updateField('environment', value as FiscalEnvironment)}
              disabled={loading || saving}
            />
            <SelectCard
              label="Fallback"
              value={form.contingencyMode}
              options={contingencies}
              onChange={(value) => updateField('contingencyMode', value as FiscalContingencyMode)}
              disabled={loading || saving}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <InputCard
              label="URL SEFAZ"
              value={form.sefazBaseUrl ?? ''}
              placeholder="https://sefaz.uf.gov.br/ws/nfce"
              onChange={(value) => updateField('sefazBaseUrl', value)}
            />
            <InputCard
              label="URL Gateway"
              value={form.gatewayBaseUrl ?? ''}
              placeholder="https://gateway.exemplo.com/fiscal"
              onChange={(value) => updateField('gatewayBaseUrl', value)}
            />
            <InputCard
              label="Certificado A1"
              value={form.certificatePath ?? ''}
              placeholder="/caminho/certificado.pfx"
              onChange={(value) => updateField('certificatePath', value)}
            />
            <InputCard
              label="Senha Certificado"
              type="password"
              value={form.certificatePassword ?? ''}
              placeholder={config?.hasCertificatePassword ? 'Mantida no backend' : 'Informe a senha'}
              onChange={(value) => updateField('certificatePassword', value)}
            />
            <InputCard
              label="CSC ID"
              value={form.cscId ?? ''}
              placeholder="000001"
              onChange={(value) => updateField('cscId', value)}
            />
            <InputCard
              label="CSC Token"
              type="password"
              value={form.cscToken ?? ''}
              placeholder={config?.hasCscToken ? 'Mantido no backend' : 'Informe o token'}
              onChange={(value) => updateField('cscToken', value)}
            />
            <InputCard
              label="API Key Gateway"
              type="password"
              value={form.gatewayApiKey ?? ''}
              placeholder={config?.hasGatewayApiKey ? 'Mantida no backend' : 'Informe a chave'}
              onChange={(value) => updateField('gatewayApiKey', value)}
            />
            <InputCard
              label="Série Padrão"
              type="number"
              value={String(form.defaultSeries ?? 1)}
              placeholder="1"
              onChange={(value) => updateField('defaultSeries', Number(value || 1))}
            />
          </div>

          <div className="flex items-center justify-between rounded-xl border border-blue-300 bg-white px-4 py-3 shadow-md shadow-blue-900/5">
            <div>
              <p className="text-sm font-bold text-blue-950">Persistência em `integrations`</p>
              <p className="text-xs font-medium text-blue-600">
                Config salva em `raw_json` do registro `fiscal:nfce`. Segredos não voltam para o React.
              </p>
            </div>
            <button
              type="button"
              onClick={handleSave}
              disabled={loading || saving}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? 'Salvando...' : 'Salvar Fiscal'}
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-blue-300 bg-gradient-to-br from-white to-blue-50 p-4 shadow-md shadow-blue-900/5">
            <h3 className="text-sm font-black uppercase tracking-wide text-blue-600">Fila Fiscal</h3>
            <div className="mt-3 flex items-center justify-between gap-3">
              <div className="text-xs font-medium text-blue-700">
                Certificado: {certificateInfo?.configured ? `${certificateInfo.type} · ${certificateInfo.alias ?? 'configurado'}` : 'não configurado'}
              </div>
              <button
                type="button"
                onClick={handleProcessNow}
                className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100"
              >
                Processar agora
              </button>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Metric label="Pendentes" value={queueSummary?.pending ?? 0} tone="emerald" />
              <Metric label="Processando" value={queueSummary?.processing ?? 0} tone="blue" />
              <Metric label="Falhas" value={queueSummary?.failed ?? 0} tone="rose" />
              <Metric label="Concluídos" value={queueSummary?.done ?? 0} tone="zinc" />
            </div>
            <p className="mt-3 text-xs font-medium text-blue-600">
              Próxima tentativa: {queueSummary?.nextRetryAt ? new Date(queueSummary.nextRetryAt).toLocaleString('pt-BR') : '—'}
            </p>
          </div>

          <div className="rounded-xl border border-blue-300 bg-gradient-to-br from-white to-blue-50 p-4 shadow-md shadow-blue-900/5">
            <h3 className="text-sm font-black uppercase tracking-wide text-blue-600">Últimos Jobs</h3>
            <div className="mt-3 space-y-3">
              {queueItems.length === 0 && (
                <p className="text-sm font-medium text-blue-600">Nenhum item na fila fiscal.</p>
              )}
              {queueItems.map((item) => (
                <div key={item.id} className="rounded-lg border border-blue-100 bg-blue-50/50 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-blue-950">{item.operation}</p>
                      <p className="text-xs font-medium text-blue-600">
                        Venda #{item.saleId} · Tentativas {item.attempts}/{item.maxAttempts}
                      </p>
                    </div>
                    <span className="rounded-full bg-white px-2 py-1 text-[11px] font-semibold text-blue-700">
                      {item.status}
                    </span>
                  </div>
                  {item.lastErrorMessage && (
                    <p className="mt-2 text-xs font-medium text-rose-600">{item.lastErrorMessage}</p>
                  )}
                  <div className="mt-3 flex items-center justify-between text-xs font-medium text-blue-600">
                    <span>{new Date(item.createdAt).toLocaleString('pt-BR')}</span>
                    <button
                      type="button"
                      onClick={() => handleRetry(item.id)}
                      className="font-semibold text-blue-600 hover:text-blue-800"
                    >
                      Reprocessar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SelectCard({
  label,
  value,
  options,
  onChange,
  disabled,
}: {
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <label className="block rounded-xl border border-blue-300 bg-white p-4 shadow-md shadow-blue-900/5">
      <span className="mb-2 block text-xs font-black uppercase tracking-wide text-blue-600">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        className="w-full rounded-lg border border-blue-200 bg-blue-50/50 px-3 py-2 text-sm font-medium text-blue-950 outline-none ring-0 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function InputCard({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block rounded-xl border border-blue-300 bg-white p-4 shadow-md shadow-blue-900/5">
      <span className="mb-2 block text-xs font-black uppercase tracking-wide text-blue-600">{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-blue-200 bg-blue-50/50 px-3 py-2 text-sm font-medium text-blue-950 placeholder:text-blue-300 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
      />
    </label>
  );
}

function Metric({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: 'emerald' | 'blue' | 'rose' | 'zinc';
}) {
  const tones = {
    emerald: 'text-emerald-600',
    blue: 'text-blue-600',
    rose: 'text-rose-600',
    zinc: 'text-blue-950',
  };

  return (
    <div className="rounded-lg border border-blue-100 bg-blue-50/50 p-3">
      <p className="text-[11px] font-black uppercase tracking-wide text-blue-500">{label}</p>
      <p className={`mt-2 text-2xl font-black ${tones[tone]}`}>{value}</p>
    </div>
  );
}
