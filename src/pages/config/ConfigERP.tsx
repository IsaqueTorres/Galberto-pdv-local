import { useEffect, useState } from 'react';
import { integrationsService } from './services/integrations.service';
import { ERPIntegration, IntegrationStatus } from './types/integrations.types';

type SyncState = {
  status: 'idle' | 'running' | 'success' | 'error';
  lastSyncAt?: string | null;
  lastSuccessAt?: string | null;
  errorMessage?: string | null;
} | null;

type ResourceSyncResult = {
  mode: 'initial' | 'incremental';
  processed: number;
  created: number;
  updated: number;
  failed: number;
};

type SyncAllResult = {
  success: boolean;
  categories?: ResourceSyncResult;
  products?: ResourceSyncResult;
  message?: string;
};

type SyncLogEntry = {
  id: string;
  resource: string;
  mode: 'initial' | 'incremental';
  status: 'running' | 'success' | 'failed';
  startedAt: string;
  finishedAt?: string | null;
  itemsProcessed: number;
  itemsCreated: number;
  itemsUpdated: number;
  itemsFailed: number;
  errorMessage?: string | null;
};

export default function ConfigERP() {
  const [integracoes] = useState<ERPIntegration[]>([
    { id: 'bling', name: 'Bling', logo: 'https://www.inovaki.com.br/_next/static/media/logo-bling.446d995f.svg' },
    { id: 'tiny', name: 'Tiny', logo: 'http://goformance.com.br/wp-content/uploads/2024/09/logo-tiny-2.webp' },
    { id: 'omie', name: 'Omie', logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS_XdIt_wfa2DdigtutmsrHsFU5XJXBMTlfiQ&s' },
    { id: 'outros', name: 'Outros', logo: '' },
  ]);

  const [statusMap, setStatusMap] = useState<Record<string, IntegrationStatus>>({});
  const [syncing, setSyncing] = useState(false);
  const [productsSyncState, setProductsSyncState] = useState<SyncState>(null);
  const [categoriesSyncState, setCategoriesSyncState] = useState<SyncState>(null);
  const [lastSyncResult, setLastSyncResult] = useState<SyncAllResult | null>(null);
  const [syncLogs, setSyncLogs] = useState<SyncLogEntry[]>([]);

  const loadSyncData = async () => {
    try {
      const [productsState, categoriesState, productLogs, categoryLogs] = await Promise.all([
        integrationsService.getSyncStatus(),
        integrationsService.getCategoriesSyncStatus(),
        integrationsService.getSyncLogs(),
        integrationsService.getCategoriesSyncLogs(),
      ]);
      setProductsSyncState(productsState);
      setCategoriesSyncState(categoriesState);

      // Mescla logs de ambos os recursos, ordena por data decrescente
      const merged: SyncLogEntry[] = [
        ...(productLogs ?? []).map((l: any) => ({ ...l, resource: 'produtos' })),
        ...(categoryLogs ?? []).map((l: any) => ({ ...l, resource: 'categorias' })),
      ].sort((a, b) => (a.startedAt < b.startedAt ? 1 : -1)).slice(0, 15);
      setSyncLogs(merged);
    } catch {
      // silencioso — pode não ter histórico ainda
    }
  };

  useEffect(() => {
    const loadStatus = async () => {
      const newStatus: Record<string, IntegrationStatus> = {};
      for (const erp of integracoes) {
        try {
          const res = await integrationsService.getStatus(erp.id);
          newStatus[erp.id] = { connected: res.connected, loading: false, expiresAt: res.expiresAt ?? null };
        } catch {
          newStatus[erp.id] = { connected: false, loading: false, expiresAt: null };
        }
      }
      setStatusMap(newStatus);
    };

    loadStatus();
    loadSyncData();
  }, []);

  const refreshStatus = async (id: string) => {
    const updatedStatus = await integrationsService.getStatus(id);
    setStatusMap(prev => ({
      ...prev,
      [id]: { connected: updatedStatus.connected, loading: false, expiresAt: updatedStatus.expiresAt ?? null },
    }));
  };

  const handleConnect = async (id: string) => {
    setStatusMap(prev => ({ ...prev, [id]: { ...prev[id], loading: true } }));
    try {
      const isConnected = statusMap[id]?.connected;
      const result = isConnected
        ? await integrationsService.disconnect(id)
        : await integrationsService.connect(id);
      if (!result.success) throw new Error(result.message);
      await refreshStatus(id);
    } catch (error) {
      console.error(error);
      setStatusMap(prev => ({ ...prev, [id]: { ...prev[id], loading: false } }));
    }
  };

  const handleSyncAll = async () => {
    setSyncing(true);
    setLastSyncResult(null);
    try {
      const result: SyncAllResult = await integrationsService.syncAll();
      setLastSyncResult(result);
      await loadSyncData();
    } catch {
      setLastSyncResult({ success: false, message: 'Erro inesperado ao sincronizar.' });
    } finally {
      setSyncing(false);
    }
  };

  const getButtonLabel = (erpId: string) => {
    const status = statusMap[erpId];
    if (!status) return 'Carregando...';
    if (status.loading) return 'Processando...';
    if (status.connected) return 'Desconectar';
    return 'Integrar';
  };

  const formatDate = (value?: string | null) => {
    if (!value) return '—';
    try { return new Date(value).toLocaleString('pt-BR'); } catch { return value; }
  };

  const formatDuration = (start?: string | null, end?: string | null) => {
    if (!start || !end) return '—';
    try {
      const ms = new Date(end).getTime() - new Date(start).getTime();
      if (ms < 1000) return `${ms}ms`;
      return `${(ms / 1000).toFixed(1)}s`;
    } catch { return '—'; }
  };

  const shortJobId = (value: string) => value.slice(0, 8);

  const blingConnected = statusMap['bling']?.connected;

  const syncStateLabel = (state: SyncState) => {
    if (!state) return { text: 'Nunca sincronizado', color: 'text-zinc-500 dark:text-zinc-400' };
    switch (state.status) {
      case 'success': return { text: 'Sucesso', color: 'text-emerald-600 dark:text-emerald-400' };
      case 'error':   return { text: 'Falhou',  color: 'text-rose-600 dark:text-rose-400' };
      case 'running': return { text: 'Em andamento...', color: 'text-blue-600 dark:text-blue-400' };
      default:        return { text: 'Aguardando', color: 'text-zinc-500 dark:text-zinc-400' };
    }
  };

  const logStatusBadge = (status: SyncLogEntry['status']) => {
    switch (status) {
      case 'success': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400';
      case 'failed':  return 'bg-rose-100 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400';
      default:        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400';
    }
  };

  const logStatusText = (status: SyncLogEntry['status']) => {
    switch (status) {
      case 'success': return 'Sucesso';
      case 'failed':  return 'Falhou';
      default:        return 'Em andamento';
    }
  };

  return (
    <section className="p-6">
      <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white tracking-tight">Sistema / ERP</h1>
            <p className="text-gray-500 dark:text-zinc-400 mt-1">
              Conecte seu PDV aos principais sistemas de gestão do mercado.
            </p>
          </div>
          <div className="hidden md:block text-right">
            <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">Status Geral</span>
            <div className="flex items-center gap-2 text-emerald-500 font-medium">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Sincronização Ativa
            </div>
          </div>
        </div>

        {/* Cards de integração */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {integracoes.map((erp) => {
            const status = statusMap[erp.id];
            return (
              <button
                key={erp.id}
                onClick={() => handleConnect(erp.id)}
                disabled={status?.loading}
                className={`
                  group relative flex flex-col items-center justify-center p-8
                  bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800
                  rounded-xl transition-all duration-300 transform hover:-translate-y-1
                  hover:shadow-xl active:scale-95
                  ${status?.connected ? 'border-emerald-500/50 ring-1 ring-emerald-500/20' : ''}
                  ${status?.loading ? 'opacity-60 cursor-not-allowed' : ''}
                `}
              >
                <div className="h-12 w-full flex items-center justify-center mb-4 grayscale group-hover:grayscale-0 transition-all">
                  {erp.logo ? (
                    <img src={erp.logo} alt={erp.name} className="max-h-full max-w-[120px] object-contain" />
                  ) : (
                    <span className="text-zinc-400 font-bold">EM BREVE</span>
                  )}
                </div>
                <span className="text-sm font-semibold text-zinc-600 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white">
                  {getButtonLabel(erp.id)} {erp.name}
                </span>
                <div className="absolute top-2 right-2">
                  <div className={`w-2 h-2 rounded-full ${status?.connected ? 'bg-emerald-500' : 'bg-zinc-300 dark:bg-zinc-700'}`} />
                </div>
              </button>
            );
          })}
        </div>

        {/* Painel Bling */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">

            {/* Status da conexão */}
            <div className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl">
              <div className="flex items-center justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-zinc-800 dark:text-white">Conexão Bling</h2>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">Token OAuth e status da integração.</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-semibold ${blingConnected ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400' : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300'}`}>
                  {blingConnected ? 'Conectado' : 'Desconectado'}
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
                  <span className="text-zinc-500 dark:text-zinc-400">ERP</span>
                  <span className="font-medium text-zinc-800 dark:text-white">Bling</span>
                </div>
                <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
                  <span className="text-zinc-500 dark:text-zinc-400">Status</span>
                  <span className="font-medium text-zinc-800 dark:text-white">{blingConnected ? 'Ativo' : 'Inativo'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500 dark:text-zinc-400">Token expira em</span>
                  <span className="font-medium text-zinc-800 dark:text-white">{formatDate(statusMap['bling']?.expiresAt)}</span>
                </div>
              </div>

              <div className="mt-5">
                <button
                  onClick={() => handleConnect('bling')}
                  disabled={statusMap['bling']?.loading}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${statusMap['bling']?.loading ? 'bg-zinc-200 text-zinc-500 cursor-not-allowed dark:bg-zinc-800 dark:text-zinc-500' : blingConnected ? 'bg-rose-600 text-white hover:bg-rose-700' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}
                >
                  {statusMap['bling']?.loading ? 'Processando...' : blingConnected ? 'Desconectar' : 'Integrar com Bling'}
                </button>
              </div>
            </div>

            {/* Sincronização */}
            <div className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl">
              <div className="flex items-center justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-zinc-800 dark:text-white">Sincronização de Catálogo</h2>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    Importa categorias e produtos do Bling para o banco local.
                  </p>
                </div>
              </div>

              {/* Grid de status por recurso */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
                  <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-2">Categorias</p>
                  <p className={`text-sm font-medium ${syncStateLabel(categoriesSyncState).color}`}>
                    {syncStateLabel(categoriesSyncState).text}
                  </p>
                  <p className="text-xs text-zinc-400 mt-1">{formatDate(categoriesSyncState?.lastSuccessAt)}</p>
                  {categoriesSyncState?.errorMessage && (
                    <p className="text-xs text-rose-500 mt-1 break-all">{categoriesSyncState.errorMessage}</p>
                  )}
                </div>
                <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
                  <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-2">Produtos</p>
                  <p className={`text-sm font-medium ${syncStateLabel(productsSyncState).color}`}>
                    {syncStateLabel(productsSyncState).text}
                  </p>
                  <p className="text-xs text-zinc-400 mt-1">{formatDate(productsSyncState?.lastSuccessAt)}</p>
                  {productsSyncState?.errorMessage && (
                    <p className="text-xs text-rose-500 mt-1 break-all">{productsSyncState.errorMessage}</p>
                  )}
                </div>
              </div>

              {/* Resultado do sync desta sessão */}
              {lastSyncResult && (
                <div className={`mb-4 p-3 rounded-lg text-sm ${lastSyncResult.success ? 'bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30' : 'bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/30'}`}>
                  {lastSyncResult.success ? (
                    <div className="space-y-1 text-emerald-700 dark:text-emerald-400">
                      {lastSyncResult.categories && (
                        <p>
                          <span className="font-semibold">Categorias</span> ({lastSyncResult.categories.mode === 'initial' ? 'inicial' : 'incremental'}):
                          {' '}{lastSyncResult.categories.processed} processadas,
                          {' '}{lastSyncResult.categories.created} criadas,
                          {' '}{lastSyncResult.categories.updated} atualizadas,
                          {' '}{lastSyncResult.categories.failed} ignoradas/com falha.
                        </p>
                      )}
                      {lastSyncResult.products && (
                        <p>
                          <span className="font-semibold">Produtos</span> ({lastSyncResult.products.mode === 'initial' ? 'inicial' : 'incremental'}):
                          {' '}{lastSyncResult.products.processed} processados,
                          {' '}{lastSyncResult.products.created} criados,
                          {' '}{lastSyncResult.products.updated} atualizados,
                          {' '}{lastSyncResult.products.failed} ignorados/com falha.
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-rose-600 dark:text-rose-400">{lastSyncResult.message}</p>
                  )}
                </div>
              )}

              <button
                onClick={handleSyncAll}
                disabled={!blingConnected || syncing}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${!blingConnected || syncing ? 'bg-zinc-200 text-zinc-500 cursor-not-allowed dark:bg-zinc-800 dark:text-zinc-500' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}
              >
                {syncing && (
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                )}
                {syncing ? 'Sincronizando...' : 'Sincronizar Catálogo'}
              </button>
            </div>

            {/* Histórico de sincronizações */}
            {syncLogs.length > 0 && (
              <div className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                <h2 className="text-base font-semibold text-zinc-800 dark:text-white mb-4">Histórico de Sincronizações</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide border-b border-zinc-100 dark:border-zinc-800">
                        <th className="pb-2 pr-4">Job</th>
                        <th className="pb-2 pr-4">Recurso</th>
                        <th className="pb-2 pr-4">Modo</th>
                        <th className="pb-2 pr-4">Status</th>
                        <th className="pb-2 pr-4">Processados</th>
                        <th className="pb-2 pr-4">Criados</th>
                        <th className="pb-2 pr-4">Atualizados</th>
                        <th className="pb-2 pr-4">Falhas</th>
                        <th className="pb-2 pr-4">Duração</th>
                        <th className="pb-2">Início</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                      {syncLogs.map((log) => (
                        <tr key={log.id} className="text-zinc-600 dark:text-zinc-300">
                          <td className="py-2 pr-4 font-mono text-xs text-zinc-400">{shortJobId(log.id)}</td>
                          <td className="py-2 pr-4 font-medium capitalize">{log.resource}</td>
                          <td className="py-2 pr-4 capitalize">{log.mode === 'initial' ? 'Inicial' : 'Incremental'}</td>
                          <td className="py-2 pr-4">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${logStatusBadge(log.status)}`}>
                              {logStatusText(log.status)}
                            </span>
                          </td>
                          <td className="py-2 pr-4">{log.itemsProcessed}</td>
                          <td className="py-2 pr-4 text-emerald-600 dark:text-emerald-400">+{log.itemsCreated}</td>
                          <td className="py-2 pr-4 text-blue-600 dark:text-blue-400">~{log.itemsUpdated}</td>
                          <td className="py-2 pr-4 text-rose-600 dark:text-rose-400">{log.itemsFailed}</td>
                          <td className="py-2 pr-4 text-zinc-400">{formatDuration(log.startedAt, log.finishedAt)}</td>
                          <td className="py-2 text-xs text-zinc-400">{formatDate(log.startedAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {syncLogs.some(l => l.errorMessage) && (
                  <div className="mt-3 space-y-2">
                    {syncLogs.filter(l => l.errorMessage).map(l => (
                      <div key={l.id} className="p-2 bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/30 rounded text-xs text-rose-600 dark:text-rose-400 break-all">
                        <span className="font-semibold">{l.resource}:</span> {l.errorMessage}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Observações */}
          <div className="space-y-4">
            <div className="p-5 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-xl">
              <h3 className="text-sm font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wide mb-2">
                Observações
              </h3>
              <p className="text-sm text-blue-600 dark:text-blue-400 leading-relaxed">
                Configure as variáveis
                <span className="font-semibold"> BLING_CLIENT_ID</span>,
                <span className="font-semibold"> BLING_CLIENT_SECRET</span> e
                <span className="font-semibold"> BLING_REDIRECT_URI</span> no ambiente.
              </p>
              <p className="text-sm text-blue-600 dark:text-blue-400 leading-relaxed mt-3">
                O sync <span className="font-semibold">inicial</span> importa todo o catálogo.
                Os syncs seguintes são <span className="font-semibold">incrementais</span> — buscam apenas alterações desde a última execução.
              </p>
            </div>

            <div className="p-5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl">
              <h3 className="text-sm font-bold text-zinc-600 dark:text-zinc-300 uppercase tracking-wide mb-2">
                Ordem do Sync
              </h3>
              <ol className="text-sm text-zinc-500 dark:text-zinc-400 space-y-2 list-none">
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
                  Categorias sincronizadas
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                  Produtos com categoria vinculada
                </li>
              </ol>
            </div>
          </div>
        </div>

        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-lg">
          <p className="text-sm text-blue-600 dark:text-blue-400 text-center">
            Precisa de uma integração personalizada?{' '}
            <span className="font-bold underline cursor-pointer">Fale com o suporte.</span>
          </p>
        </div>
      </div>
    </section>
  );
}
