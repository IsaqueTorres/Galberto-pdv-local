import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Clock3, FileCheck2, Pencil, Server, ShieldCheck } from 'lucide-react';
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
  uf: 'SP',
  model: 65,
  defaultSeries: 1,
};

type DiagnosticStep = {
  label: string;
  description: string;
  status: 'idle' | 'running' | 'ok' | 'error' | 'warning';
  severity: 'Low' | 'Medium' | 'High' | 'Pending';
};

export function FiscalSettingsPanel() {
  const [form, setForm] = useState<FiscalConfigInput>(defaultForm);
  const [config, setConfig] = useState<FiscalConfigView | null>(null);
  const [certificateInfo, setCertificateInfo] = useState<CertificateInfo | null>(null);
  const [queueSummary, setQueueSummary] = useState<FiscalQueueSummary | null>(null);
  const [queueItems, setQueueItems] = useState<FiscalQueueItem[]>([]);
  const [allQueueItems, setAllQueueItems] = useState<FiscalQueueItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showJobsModal, setShowJobsModal] = useState(false);
  const [jobsOperationFilter, setJobsOperationFilter] = useState<'all' | FiscalQueueItem['operation']>('all');
  const [jobsStatusFilter, setJobsStatusFilter] = useState<'all' | FiscalQueueItem['status']>('all');
  const [error, setError] = useState<string | null>(null);
  const [processMessage, setProcessMessage] = useState<string | null>(null);
  const [diagnosticResult, setDiagnosticResult] = useState<ReturnType<typeof readStatusResult> | null>(null);
  const [diagnosticError, setDiagnosticError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [runtimeConfig, certificate, summary, queue] = await Promise.all([
        fiscalConfigService.getConfig(),
        fiscalConfigService.getCertificateInfo(),
        fiscalConfigService.getQueueSummary(),
        fiscalConfigService.listQueue(100),
      ]);

      setConfig(runtimeConfig);
      setCertificateInfo(certificate);
      setQueueSummary(summary);
      setAllQueueItems(queue);
      setQueueItems(queue.filter(isTodayQueueItem).slice(0, 5));
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
        uf: runtimeConfig.uf ?? 'SP',
        model: runtimeConfig.model ?? 65,
        defaultSeries: runtimeConfig.defaultSeries ?? 1,
      });

      const latestStatus = queue.map((item) => readStatusResult(item.result)).find(Boolean) ?? null;
      setDiagnosticResult(latestStatus);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Erro ao carregar configuracao fiscal.');
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
      setShowEditModal(false);
      await load();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Erro ao salvar configuracao fiscal.');
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
    setProcessing(true);
    setError(null);
    setDiagnosticError(null);
    setProcessMessage('Executando diagnostico fiscal...');
    setDiagnosticResult(null);
    try {
      const item = await fiscalConfigService.runStatusDiagnostic();
      const result = readStatusResult(item.result);
      setDiagnosticResult(result);
      setProcessMessage(result?.statusMessage ?? `Job ${item.id} finalizado com status ${item.status}.`);
      await load();
    } catch (processError) {
      const message = processError instanceof Error ? processError.message : 'Erro ao processar diagnostico fiscal.';
      setError(message);
      setDiagnosticError(message);
      setProcessMessage(null);
    } finally {
      setProcessing(false);
    }
  }

  const providers: Array<{ value: FiscalProviderKind; label: string }> = [
    { value: 'mock', label: 'Mock' },
    { value: 'sefaz-direct', label: 'SEFAZ Direta' },
    { value: 'gateway', label: 'Gateway Fiscal' },
  ];

  const environments: Array<{ value: FiscalEnvironment; label: string }> = [
    { value: 'homologation', label: 'Homologacao' },
    { value: 'production', label: 'Producao' },
  ];

  const contingencies: Array<{ value: FiscalContingencyMode; label: string }> = [
    { value: 'queue', label: 'Fila/Reprocesso' },
    { value: 'offline-contingency', label: 'Contingencia Offline' },
    { value: 'online', label: 'Somente Online' },
  ];

  const diagnostics = useMemo<DiagnosticStep[]>(() => {
    const certificateOk = Boolean(certificateInfo?.configured);
    const statusOk = diagnosticResult?.statusCode === '107';
    const hasWarning = Boolean(diagnosticResult?.warning);
    const queueCreated = queueItems.some((item) => item.operation === 'TEST_STATUS_NFCE');

    return [
      {
        label: 'Configuracao fiscal',
        description: config ? `${providerLabel(config.provider)} · ${environmentLabel(config.environment)} · ${config.uf ?? 'SP'}` : 'Nao carregada',
        status: config ? 'ok' : loading ? 'running' : 'error',
        severity: config ? 'Low' : 'High',
      },
      {
        label: 'Certificado A1',
        description: certificateInfo?.configured
          ? `${certificateInfo.type} · ${certificateInfo.alias ?? 'arquivo configurado'}`
          : 'Certificado nao configurado ou nao encontrado',
        status: certificateOk ? 'ok' : processing ? 'running' : 'error',
        severity: certificateOk ? 'Low' : 'High',
      },
      {
        label: 'Job fiscal',
        description: queueCreated ? 'Job de teste registrado na fila fiscal' : 'Aguardando execucao do diagnostico',
        status: queueCreated ? 'ok' : processing ? 'running' : 'idle',
        severity: queueCreated ? 'Low' : 'Pending',
      },
      {
        label: 'SEFAZ StatusServico',
        description: diagnosticResult?.statusMessage ?? diagnosticError ?? 'Aguardando consulta NFeStatusServico4',
        status: statusOk ? (hasWarning ? 'warning' : 'ok') : diagnosticError ? 'error' : processing ? 'running' : 'idle',
        severity: statusOk ? (hasWarning ? 'Medium' : 'Low') : diagnosticError ? 'High' : 'Pending',
      },
    ];
  }, [certificateInfo, config, diagnosticError, diagnosticResult, loading, processing, queueItems]);

  const filteredQueueItems = useMemo(() => {
    return allQueueItems.filter((item) => {
      const operationMatches = jobsOperationFilter === 'all' || item.operation === jobsOperationFilter;
      const statusMatches = jobsStatusFilter === 'all' || item.status === jobsStatusFilter;
      return operationMatches && statusMatches;
    });
  }, [allQueueItems, jobsOperationFilter, jobsStatusFilter]);

  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-wide text-slate-500">Camada Fiscal NFC-e</p>
            <h2 className="mt-1 text-xl font-black text-slate-950">Ambiente fiscal ativo</h2>
            <p className="mt-1 text-sm font-medium text-slate-600">
              Fonte oficial: stores + fiscal_settings. integrations fica apenas como fallback legado temporario.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowEditModal(true)}
            className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-800 transition hover:bg-slate-50"
          >
            <Pencil size={16} />
            Alterar ambiente fiscal
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
            {error}
          </div>
        )}

        <div className="mt-5 grid gap-3 md:grid-cols-4">
          <SummaryTile label="Provider" value={config ? providerLabel(config.provider) : 'Carregando'} />
          <SummaryTile label="Ambiente" value={config ? environmentLabel(config.environment) : 'Carregando'} tone={config?.environment === 'production' ? 'rose' : 'emerald'} />
          <SummaryTile label="UF / Modelo" value={`${config?.uf ?? 'SP'} · NFC-e ${config?.model ?? 65}`} />
          <SummaryTile label="Serie padrao" value={String(config?.defaultSeries ?? 1)} />
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <StatusPill
            icon={FileCheck2}
            label="Certificado"
            value={certificateInfo?.configured ? `${certificateInfo.type} configurado` : 'Nao configurado'}
            ok={Boolean(certificateInfo?.configured)}
          />
          <StatusPill
            icon={ShieldCheck}
            label="CSC"
            value={config?.hasCscToken ? `ID ${config.cscId ?? '-'}` : 'Token ausente'}
            ok={Boolean(config?.hasCscToken && config?.cscId)}
          />
          <StatusPill
            icon={Server}
            label="Endpoint"
            value={config?.sefazBaseUrl || 'Padrao SEFAZ SP'}
            ok={Boolean(config)}
          />
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-slate-500">Painel de status</p>
              <h3 className="mt-1 text-lg font-black text-slate-950">Diagnostico da conexao fiscal</h3>
              <p className="mt-1 text-sm font-medium text-slate-600">
                Executa certificado, fila fiscal e NFeStatusServico4 em sequencia.
              </p>
            </div>
            <button
              type="button"
              onClick={handleProcessNow}
              disabled={processing}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Clock3 size={16} />
              {processing ? 'Testando...' : 'Testar conexao fiscal'}
            </button>
          </div>

          <DiagnosticTable steps={diagnostics} />

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <SummaryTile label="Latencia SEFAZ" value={diagnosticResult ? `${diagnosticResult.responseTimeMs ?? 0}ms` : '-'} tone="emerald" />
            <SummaryTile label="cStat" value={diagnosticResult?.statusCode ?? '-'} tone={diagnosticResult?.statusCode === '107' ? 'emerald' : 'slate'} />
            <SummaryTile label="Servico" value={diagnosticResult?.statusMessage ?? processMessage ?? 'Nao testado'} />
          </div>

          {diagnosticResult?.url && (
            <div className="mt-4 rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-700">
              {diagnosticResult.url}
            </div>
          )}

          {diagnosticResult?.warning && (
            <div className="mt-4 flex gap-3 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
              <AlertTriangle className="mt-0.5 shrink-0" size={18} />
              <span>{diagnosticResult.warning}</span>
            </div>
          )}
        </div>

        <div className="space-y-5">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-black uppercase tracking-wide text-slate-500">Fila Fiscal</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Metric label="Pendentes" value={queueSummary?.pending ?? 0} tone="emerald" />
              <Metric label="Processando" value={queueSummary?.processing ?? 0} tone="blue" />
              <Metric label="Falhas" value={queueSummary?.failed ?? 0} tone="rose" />
              <Metric label="Concluidos" value={queueSummary?.done ?? 0} tone="zinc" />
            </div>
            <p className="mt-3 text-xs font-medium text-slate-500">
              Proxima tentativa: {queueSummary?.nextRetryAt ? new Date(queueSummary.nextRetryAt).toLocaleString('pt-BR') : '-'}
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-wide text-slate-500">Jobs de hoje</p>
                <p className="mt-1 text-xs font-medium text-slate-500">Resumo dos registros mais recentes.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowJobsModal(true)}
                className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Ver todos
              </button>
            </div>
            <div className="mt-3 overflow-hidden rounded-md border border-slate-200 bg-slate-50">
              {queueItems.length === 0 && (
                <p className="px-3 py-2 text-sm font-medium text-slate-500">Nenhum job fiscal registrado hoje.</p>
              )}
              {queueItems.map((item) => (
                <QueueItemCard key={item.id} item={item} onRetry={handleRetry} compact />
              ))}
            </div>
          </div>
        </div>
      </div>

      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4">
          <div className="max-h-[92vh] w-full max-w-5xl overflow-auto rounded-lg bg-white shadow-2xl">
            <div className="sticky top-0 z-10 border-b border-slate-200 bg-white px-5 py-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-black text-slate-950">Alterar ambiente fiscal</h3>
                  <p className="mt-1 text-sm font-medium text-slate-600">Revise os dados antes de salvar.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-bold text-slate-700 hover:bg-slate-50"
                >
                  Fechar
                </button>
              </div>
              <div className="mt-4 flex gap-3 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
                <AlertTriangle className="mt-0.5 shrink-0" size={18} />
                <span>Alterar dados fiscais pode interromper vendas, invalidar emissao de NFC-e ou causar risco fiscal. Salve apenas com dados conferidos.</span>
              </div>
            </div>

            <div className="p-5">
              <div className="grid gap-4 md:grid-cols-3">
                <SelectCard label="Provider" value={form.provider} options={providers} onChange={(value) => updateField('provider', value as FiscalProviderKind)} disabled={loading || saving} />
                <SelectCard label="Ambiente" value={form.environment} options={environments} onChange={(value) => updateField('environment', value as FiscalEnvironment)} disabled={loading || saving} />
                <SelectCard label="Fallback" value={form.contingencyMode} options={contingencies} onChange={(value) => updateField('contingencyMode', value as FiscalContingencyMode)} disabled={loading || saving} />
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <InputCard label="URL SEFAZ" value={form.sefazBaseUrl ?? ''} placeholder="https://sefaz.uf.gov.br/ws/nfce" onChange={(value) => updateField('sefazBaseUrl', value)} />
                <InputCard label="URL Gateway" value={form.gatewayBaseUrl ?? ''} placeholder="https://gateway.exemplo.com/fiscal" onChange={(value) => updateField('gatewayBaseUrl', value)} />
                <InputCard label="Certificado A1" value={form.certificatePath ?? ''} placeholder="/caminho/certificado.pfx" onChange={(value) => updateField('certificatePath', value)} />
                <InputCard label="Senha Certificado" type="password" value={form.certificatePassword ?? ''} placeholder={config?.hasCertificatePassword ? 'Mantida no backend' : 'Informe a senha'} onChange={(value) => updateField('certificatePassword', value)} />
                <InputCard label="CSC ID" value={form.cscId ?? ''} placeholder="000001" onChange={(value) => updateField('cscId', value)} />
                <InputCard label="CSC Token" type="password" value={form.cscToken ?? ''} placeholder={config?.hasCscToken ? 'Mantido no backend' : 'Informe o token'} onChange={(value) => updateField('cscToken', value)} />
                <InputCard label="API Key Gateway" type="password" value={form.gatewayApiKey ?? ''} placeholder={config?.hasGatewayApiKey ? 'Mantida no backend' : 'Informe a chave'} onChange={(value) => updateField('gatewayApiKey', value)} />
                <InputCard label="UF" value={form.uf ?? 'SP'} placeholder="SP" onChange={(value) => updateField('uf', value.toUpperCase())} />
                <InputCard label="Modelo" value={String(form.model ?? 65)} placeholder="65" onChange={() => updateField('model', 65)} />
                <InputCard label="Serie Padrao" type="number" value={String(form.defaultSeries ?? 1)} placeholder="1" onChange={(value) => updateField('defaultSeries', Number(value || 1))} />
              </div>

              <div className="mt-5 flex justify-end gap-3 border-t border-slate-200 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="rounded-md border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={loading || saving}
                  className="rounded-md bg-slate-950 px-4 py-2 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? 'Salvando...' : 'Salvar ambiente fiscal'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showJobsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4">
          <div className="flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-lg bg-white shadow-2xl">
            <div className="border-b border-slate-200 px-5 py-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <h3 className="text-lg font-black text-slate-950">Jobs fiscais</h3>
                  <p className="mt-1 text-sm font-medium text-slate-600">
                    {filteredQueueItems.length} de {allQueueItems.length} registros carregados.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowJobsModal(false)}
                  className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-bold text-slate-700 hover:bg-slate-50"
                >
                  Fechar
                </button>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-xs font-black uppercase tracking-wide text-slate-500">Tipo</span>
                  <select
                    value={jobsOperationFilter}
                    onChange={(event) => setJobsOperationFilter(event.target.value as typeof jobsOperationFilter)}
                    className="w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-950 outline-none focus:border-slate-700 focus:bg-white"
                  >
                    <option value="all">Todos</option>
                    <option value="TEST_STATUS_NFCE">TEST_STATUS_NFCE</option>
                    <option value="AUTHORIZE_NFCE">AUTHORIZE_NFCE</option>
                    <option value="CANCEL_NFCE">CANCEL_NFCE</option>
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-black uppercase tracking-wide text-slate-500">Status</span>
                  <select
                    value={jobsStatusFilter}
                    onChange={(event) => setJobsStatusFilter(event.target.value as typeof jobsStatusFilter)}
                    className="w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-950 outline-none focus:border-slate-700 focus:bg-white"
                  >
                    <option value="all">Todos</option>
                    <option value="pending">pending</option>
                    <option value="processing">processing</option>
                    <option value="done">done</option>
                    <option value="failed">failed</option>
                  </select>
                </label>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50 p-4">
              <div className="overflow-hidden rounded-md border border-slate-200 bg-white">
                {filteredQueueItems.length === 0 && (
                  <p className="px-3 py-2 text-sm font-medium text-slate-500">Nenhum job encontrado com os filtros atuais.</p>
                )}
                {filteredQueueItems.map((item) => (
                  <QueueItemCard key={item.id} item={item} onRetry={handleRetry} />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function isTodayQueueItem(item: FiscalQueueItem) {
  const created = new Date(item.createdAt);
  const now = new Date();
  return created.getFullYear() === now.getFullYear()
    && created.getMonth() === now.getMonth()
    && created.getDate() === now.getDate();
}

function providerLabel(provider: FiscalProviderKind) {
  const labels: Record<FiscalProviderKind, string> = {
    mock: 'Mock',
    'sefaz-direct': 'SEFAZ Direta',
    gateway: 'Gateway Fiscal',
  };
  return labels[provider];
}

function environmentLabel(environment: FiscalEnvironment) {
  return environment === 'production' ? 'Producao' : 'Homologacao';
}

function readStatusResult(result: unknown): {
  statusCode?: string | null;
  statusMessage: string;
  responseTimeMs?: number;
  url?: string;
  warning?: string | null;
} | null {
  if (!result || typeof result !== 'object') return null;
  const data = result as Record<string, unknown>;
  if (data.service !== 'NFeStatusServico4') return null;

  return {
    statusCode: typeof data.statusCode === 'string' ? data.statusCode : null,
    statusMessage: typeof data.statusMessage === 'string' ? data.statusMessage : 'Resultado fiscal sem mensagem.',
    responseTimeMs: typeof data.responseTimeMs === 'number' ? data.responseTimeMs : 0,
    url: typeof data.url === 'string' ? data.url : '',
    warning: typeof data.warning === 'string' ? data.warning : null,
  };
}

function SummaryTile({
  label,
  value,
  tone = 'slate',
}: {
  label: string;
  value: string;
  tone?: 'slate' | 'emerald' | 'rose';
}) {
  const tones = {
    slate: 'text-slate-950 bg-slate-50 border-slate-200',
    emerald: 'text-emerald-800 bg-emerald-50 border-emerald-200',
    rose: 'text-rose-800 bg-rose-50 border-rose-200',
  };

  return (
    <div className={`rounded-lg border px-4 py-3 ${tones[tone]}`}>
      <p className="text-[11px] font-black uppercase tracking-wide opacity-70">{label}</p>
      <p className="mt-1 text-sm font-black">{value}</p>
    </div>
  );
}

function StatusPill({
  icon: Icon,
  label,
  value,
  ok,
}: {
  icon: typeof FileCheck2;
  label: string;
  value: string;
  ok: boolean;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
      <Icon className={ok ? 'text-emerald-600' : 'text-rose-600'} size={20} />
      <div>
        <p className="text-[11px] font-black uppercase tracking-wide text-slate-500">{label}</p>
        <p className="text-sm font-bold text-slate-950">{value}</p>
      </div>
    </div>
  );
}

function DiagnosticTable({ steps }: { steps: DiagnosticStep[] }) {
  return (
    <div className="mt-5 overflow-hidden rounded-md border border-slate-200">
      <div className="grid grid-cols-[minmax(0,1.6fr)_120px_120px] border-b border-slate-200 bg-slate-50 text-[11px] font-black uppercase tracking-wide text-slate-500">
        <div className="px-3 py-2">Verificacao</div>
        <div className="px-3 py-2 text-center">Status</div>
        <div className="px-3 py-2 text-center">Prioridade</div>
      </div>
      {steps.map((step) => (
        <div key={step.label} className="grid grid-cols-[minmax(0,1.6fr)_120px_120px] border-b border-slate-100 text-sm last:border-b-0">
          <div className="bg-cyan-50 px-3 py-2">
            <p className="font-semibold text-slate-900">{step.label}</p>
            <p className="mt-0.5 truncate text-xs font-medium text-slate-500">{step.description}</p>
          </div>
          <div className="flex items-center justify-center bg-white px-3 py-2 font-medium text-slate-700">
            {statusLabel(step.status)}
          </div>
          <div className="flex items-center justify-center gap-2 bg-white px-3 py-2 font-medium text-slate-700">
            <StatusDot tone={severityTone(step.severity)} />
            {step.severity}
          </div>
        </div>
      ))}
    </div>
  );
}

function statusLabel(status: DiagnosticStep['status']) {
  const labels: Record<DiagnosticStep['status'], string> = {
    idle: 'Pendente',
    running: 'Processando',
    ok: 'Aprovado',
    warning: 'Aprovado',
    error: 'Falha',
  };
  return labels[status];
}

function severityTone(severity: DiagnosticStep['severity']): 'green' | 'yellow' | 'red' | 'gray' {
  const tones: Record<DiagnosticStep['severity'], 'green' | 'yellow' | 'red' | 'gray'> = {
    Low: 'green',
    Medium: 'yellow',
    High: 'red',
    Pending: 'gray',
  };
  return tones[severity];
}

function StatusDot({ tone }: { tone: 'green' | 'yellow' | 'red' | 'gray' }) {
  const colors = {
    green: 'bg-lime-500',
    yellow: 'bg-amber-400',
    red: 'bg-red-500',
    gray: 'bg-slate-300',
  };
  return (
    <span className={`h-3 w-3 rounded-full ${colors[tone]}`} />
  );
}

function QueueItemCard({
  item,
  onRetry,
  compact = false,
}: {
  item: FiscalQueueItem;
  onRetry: (queueId: string) => void;
  compact?: boolean;
}) {
  const result = readStatusResult(item.result);

  return (
    <div className="border-b border-slate-200 px-3 py-2 text-xs last:border-b-0">
      <div className="flex items-start gap-2">
        <StatusDot tone={queueStatusTone(item.status)} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="font-mono text-slate-500">{new Date(item.createdAt).toLocaleString('pt-BR')}</span>
            <span className="font-bold text-slate-900">{item.operation}</span>
            {!compact && <span className="text-slate-500">status={item.status}</span>}
            {!compact && <span className="text-slate-500">tentativas={item.attempts}/{item.maxAttempts}</span>}
          </div>
          <p className="mt-1 truncate font-medium text-slate-600">
            {item.lastErrorMessage ?? result?.statusMessage ?? `job=${item.id} venda=${item.saleId}`}
          </p>
        </div>
        {!compact && (
          <button
            type="button"
            onClick={() => onRetry(item.id)}
            className="shrink-0 font-semibold text-slate-600 hover:text-slate-950"
          >
            Reprocessar
          </button>
        )}
      </div>
      {result && !compact && (
        <div className="ml-5 mt-1 font-mono text-[11px] text-slate-500">
          cStat={result.statusCode ?? '-'} latency={result.responseTimeMs ?? 0}ms endpoint={result.url}
        </div>
      )}
    </div>
  );
}

function queueStatusTone(status: FiscalQueueItem['status']): 'green' | 'yellow' | 'red' | 'gray' {
  const tones: Record<FiscalQueueItem['status'], 'green' | 'yellow' | 'red' | 'gray'> = {
    pending: 'gray',
    processing: 'yellow',
    done: 'green',
    failed: 'red',
  };
  return tones[status];
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
    <label className="block rounded-lg border border-slate-200 bg-white p-4">
      <span className="mb-2 block text-xs font-black uppercase tracking-wide text-slate-500">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        className="w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-950 outline-none focus:border-slate-700 focus:bg-white"
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
    <label className="block rounded-lg border border-slate-200 bg-white p-4">
      <span className="mb-2 block text-xs font-black uppercase tracking-wide text-slate-500">{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-950 placeholder:text-slate-400 outline-none focus:border-slate-700 focus:bg-white"
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
    zinc: 'text-slate-950',
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      <p className="text-[11px] font-black uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-2 text-2xl font-black ${tones[tone]}`}>{value}</p>
    </div>
  );
}
