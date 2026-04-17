import { useEffect, useMemo, useState } from "react";
import { buscarVendaPorId, listarVendas, reprintSaleReceipt, retomarVendaNoPdv } from "./services/sales.service";

type SaleStatus = "FINALIZADA" | "ABERTA_PAGAMENTO" | "CANCELADA" | "ORCAMENTO" | "TESTE" | "PAUSADA";

type SaleRow = {
  id: number;
  data_emissao: string;
  status: SaleStatus;
  cliente_nome: string | null;
  cpf_cliente: string | null;
  valor_total: number;
};

type SaleDetail = {
  id: number;
  data_emissao: string;
  data_movimento: string | null;
  status: string;
  cliente_nome: string | null;
  cpf_cliente: string | null;
  valor_total: number;
  valor_produtos: number;
  valor_troco: number;
  observacao: string | null;
  itens: Array<{
    produto_id: string;
    codigo_produto: string;
    nome_produto: string;
    quantidade_comercial: number;
    valor_unitario_comercial: number;
    subtotal: number;
  }>;
};

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatDateTime(value?: string | null) {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString("pt-BR");
}

function mapStatusLabel(status: string) {
  const labels: Record<string, string> = {
    FINALIZADA: "Finalizada",
    ABERTA_PAGAMENTO: "Pendente",
    CANCELADA: "Cancelada",
    ORCAMENTO: "Orcamento",
    TESTE: "Teste",
    PAUSADA: "Pausada",
  };
  return labels[status] ?? status;
}

function statusClass(status: string) {
  const classes: Record<string, string> = {
    FINALIZADA: "bg-emerald-100 text-emerald-700 border border-emerald-200",
    ABERTA_PAGAMENTO: "bg-amber-100 text-amber-700 border border-amber-200",
    CANCELADA: "bg-red-100 text-red-700 border border-red-200",
    ORCAMENTO: "bg-sky-100 text-sky-700 border border-sky-200",
    TESTE: "bg-violet-100 text-violet-700 border border-violet-200",
    PAUSADA: "bg-orange-100 text-orange-700 border border-orange-200",
  };
  return classes[status] ?? "bg-slate-100 text-slate-700 border border-slate-200";
}

export default function Sales() {
  const [sales, setSales] = useState<SaleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"todos" | SaleStatus>("todos");
  const [selectedSale, setSelectedSale] = useState<SaleDetail | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [actionMessage, setActionMessage] = useState("");
  const [actionTone, setActionTone] = useState<"success" | "error">("success");

  async function loadSales() {
    try {
      setLoading(true);
      setError("");
      const response = await listarVendas({ page: 1, limit: 200 });
      setSales(Array.isArray(response?.data) ? response.data : []);
    } catch (err) {
      console.error("Erro ao listar vendas:", err);
      setError("Nao foi possivel carregar as vendas.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSales();
  }, []);

  const filteredSales = useMemo(() => {
    const term = search.trim().toLowerCase();

    return sales.filter((sale) => {
      const matchesSearch =
        !term ||
        String(sale.id).includes(term) ||
        (sale.cliente_nome ?? "").toLowerCase().includes(term) ||
        (sale.cpf_cliente ?? "").includes(term);

      const matchesStatus = statusFilter === "todos" || sale.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [sales, search, statusFilter]);

  const totalValue = filteredSales.reduce((acc, sale) => acc + Number(sale.valor_total ?? 0), 0);

  async function openDetails(id: number) {
    try {
      const sale = await buscarVendaPorId(id);
      setSelectedSale(sale);
      setDetailsOpen(true);
    } catch (err) {
      console.error("Erro ao buscar detalhes da venda:", err);
      setError("Nao foi possivel abrir os detalhes da venda.");
    }
  }

  async function handleResume(id: number) {
    try {
      const sale = await buscarVendaPorId(id);
      if (!sale) {
        setError("Nao foi possivel retomar a venda selecionada.");
        return;
      }

      retomarVendaNoPdv(sale);
      window.api.fecharJanela();
    } catch (err) {
      console.error("Erro ao retomar venda:", err);
      setError("Nao foi possivel retomar a venda.");
    }
  }

  async function handleReprint(id: number) {
    try {
      const result = await reprintSaleReceipt(id);
      setActionTone(result?.success ? "success" : "error");
      setActionMessage(result?.message ?? "Não foi possível reimprimir o cupom.");
    } catch (err) {
      console.error("Erro ao reimprimir cupom:", err);
      setActionTone("error");
      setActionMessage("Não foi possível reimprimir o cupom.");
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 p-4 text-slate-800">
      <section className="mx-auto max-w-7xl rounded-2xl border border-slate-200 bg-white shadow-sm">
        <header className="border-b border-slate-200 p-4">
          <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl font-bold">Buscar vendas</h1>
              <p className="text-sm text-slate-500">
                Consulte vendas reais registradas no banco local do PDV.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-xl bg-slate-50 px-4 py-3">
                <p className="text-xs uppercase text-slate-500">Registros</p>
                <p className="text-lg font-bold">{filteredSales.length}</p>
              </div>
              <div className="rounded-xl bg-slate-50 px-4 py-3">
                <p className="text-xs uppercase text-slate-500">Total</p>
                <p className="text-lg font-bold">{formatCurrency(totalValue)}</p>
              </div>
              <div className="rounded-xl bg-slate-50 px-4 py-3">
                <p className="text-xs uppercase text-slate-500">Pendentes</p>
                <p className="text-lg font-bold">
                  {filteredSales.filter((sale) => sale.status === "ABERTA_PAGAMENTO").length}
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 px-4 py-3">
                <p className="text-xs uppercase text-slate-500">Hoje</p>
                <p className="text-lg font-bold">{new Date().toLocaleDateString("pt-BR")}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-3 lg:grid-cols-[1fr_220px_180px]">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600">
                Buscar por venda, cliente ou CPF
              </label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Ex.: 15, Consumidor final, 12345678909..."
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as "todos" | SaleStatus)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="todos">Todos</option>
                <option value="FINALIZADA">Finalizadas</option>
                <option value="ABERTA_PAGAMENTO">Pendentes</option>
                <option value="PAUSADA">Pausadas</option>
                <option value="CANCELADA">Canceladas</option>
                <option value="ORCAMENTO">Orcamentos</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("todos");
                  loadSales();
                }}
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Atualizar
              </button>
            </div>
          </div>
        </header>

        <div className="p-4">
          {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          {actionMessage && (
            <div
              className={`mb-4 rounded-xl px-4 py-3 text-sm font-medium ${
                actionTone === "success"
                  ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border border-amber-200 bg-amber-50 text-amber-700"
              }`}
            >
              {actionMessage}
            </div>
          )}

          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3 text-left">Venda ID</th>
                    <th className="px-4 py-3 text-left">Data</th>
                    <th className="px-4 py-3 text-left">Cliente</th>
                    <th className="px-4 py-3 text-left">CPF</th>
                    <th className="px-4 py-3 text-left">Valor</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Acoes</th>
                  </tr>
                </thead>

                <tbody>
                  {!loading && filteredSales.length > 0 ? (
                    filteredSales.map((sale) => (
                      <tr key={sale.id} className="border-t border-slate-200 transition hover:bg-slate-50">
                        <td className="px-4 py-3 font-semibold text-slate-800">#{sale.id}</td>
                        <td className="px-4 py-3 text-slate-600">{formatDateTime(sale.data_emissao)}</td>
                        <td className="px-4 py-3 text-slate-700">{sale.cliente_nome || "Consumidor final"}</td>
                        <td className="px-4 py-3 text-slate-600">{sale.cpf_cliente || "—"}</td>
                        <td className="px-4 py-3 font-medium">{formatCurrency(Number(sale.valor_total ?? 0))}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(sale.status)}`}>
                            {mapStatusLabel(sale.status)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => openDetails(sale.id)}
                              className="rounded-lg border border-slate-300 px-3 py-1.5 font-medium text-slate-700 transition hover:bg-slate-100"
                            >
                              Detalhes
                            </button>
                            {sale.status === "FINALIZADA" && (
                              <button
                                type="button"
                                onClick={() => handleReprint(sale.id)}
                                className="rounded-lg border border-blue-300 bg-blue-50 px-3 py-1.5 font-medium text-blue-700 transition hover:bg-blue-100"
                              >
                                Reimprimir Cupom
                              </button>
                            )}
                            {(sale.status === "PAUSADA" || sale.status === "ABERTA_PAGAMENTO") && (
                              <button
                                type="button"
                                onClick={() => handleResume(sale.id)}
                                className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 font-medium text-amber-700 transition hover:bg-amber-100"
                              >
                                Retomar
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-4 py-10 text-center text-slate-500">
                        {loading ? "Carregando vendas..." : "Nenhuma venda encontrada com os filtros informados."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {detailsOpen && selectedSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-3xl rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Venda #{selectedSale.id}</h2>
                <p className="text-sm text-slate-500">{formatDateTime(selectedSale.data_emissao)}</p>
              </div>
              <div className="flex items-center gap-2">
                {selectedSale.status === "FINALIZADA" && (
                  <button
                    type="button"
                    onClick={() => handleReprint(selectedSale.id)}
                    className="rounded-lg border border-blue-300 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100"
                  >
                    Reimprimir Cupom
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setDetailsOpen(false)}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Fechar
                </button>
              </div>
            </div>

            <div className="grid gap-4 border-b border-slate-200 px-6 py-5 md:grid-cols-4">
              <div>
                <p className="text-xs uppercase text-slate-500">Status</p>
                <p className="mt-1 font-semibold text-slate-900">{mapStatusLabel(selectedSale.status)}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-slate-500">Cliente</p>
                <p className="mt-1 font-semibold text-slate-900">{selectedSale.cliente_nome || "Consumidor final"}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-slate-500">CPF</p>
                <p className="mt-1 font-semibold text-slate-900">{selectedSale.cpf_cliente || "—"}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-slate-500">Total</p>
                <p className="mt-1 font-semibold text-slate-900">{formatCurrency(Number(selectedSale.valor_total ?? 0))}</p>
              </div>
            </div>

            <div className="max-h-[420px] overflow-auto px-6 py-5">
              <table className="min-w-full text-sm">
                <thead className="text-xs uppercase text-slate-500">
                  <tr>
                    <th className="pb-3 text-left">Codigo</th>
                    <th className="pb-3 text-left">Produto</th>
                    <th className="pb-3 text-right">Qtd</th>
                    <th className="pb-3 text-right">Unitario</th>
                    <th className="pb-3 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedSale.itens.map((item, index) => (
                    <tr key={`${item.produto_id}-${index}`} className="border-t border-slate-100">
                      <td className="py-3 text-slate-600">{item.codigo_produto || "—"}</td>
                      <td className="py-3 font-medium text-slate-900">{item.nome_produto}</td>
                      <td className="py-3 text-right text-slate-700">{item.quantidade_comercial}</td>
                      <td className="py-3 text-right text-slate-700">{formatCurrency(Number(item.valor_unitario_comercial ?? 0))}</td>
                      <td className="py-3 text-right font-semibold text-slate-900">{formatCurrency(Number(item.subtotal ?? 0))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
