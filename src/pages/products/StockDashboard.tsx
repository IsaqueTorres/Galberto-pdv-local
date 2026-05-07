import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { ArrowDownCircle, ArrowUpCircle, ClipboardList, History, PackageX, RefreshCw, Scale, X } from "lucide-react";
import {
  createStockMovement,
  listLocalStockProducts,
  listStockMovementsByProduct,
} from "./services/products.service";
import type { LocalStockProduct, StockMovementInput, StockMovementRecord } from "./types/products.types";

type StockFilter = "all" | "low" | "out" | "inactive";
type ModalMode = "entry" | "exit" | "adjustment" | "history" | null;

const reasonOptions = {
  entry: [
    ["compra", "Compra"],
    ["devolucao_cliente", "Devolução de cliente"],
    ["ajuste_positivo", "Ajuste positivo"],
    ["inventario", "Inventário"],
    ["outro", "Outro"],
  ],
  exit: [
    ["perda", "Perda"],
    ["quebra", "Quebra"],
    ["vencimento", "Vencimento"],
    ["uso_interno", "Uso interno"],
    ["ajuste_negativo", "Ajuste negativo"],
    ["outro", "Outro"],
  ],
  adjustment: [
    ["inventario", "Inventário"],
    ["contagem_fisica", "Contagem física"],
    ["correcao_saldo", "Correção de saldo"],
    ["outro", "Outro"],
  ],
};

function parseNumber(value: string) {
  const normalized = value.replace(/\./g, "").replace(",", ".");
  const number = Number(normalized);
  return Number.isFinite(number) ? number : NaN;
}

function formatNumber(value: number | null | undefined) {
  return Number(value ?? 0).toLocaleString("pt-BR", { maximumFractionDigits: 3 });
}

function formatDate(value: string) {
  try {
    return new Date(value).toLocaleString("pt-BR");
  } catch {
    return value;
  }
}

export default function StockDashboard() {
  const [products, setProducts] = useState<LocalStockProduct[]>([]);
  const [term, setTerm] = useState("");
  const [filter, setFilter] = useState<StockFilter>("all");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<LocalStockProduct | null>(null);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [quantity, setQuantity] = useState("");
  const [newStock, setNewStock] = useState("");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [history, setHistory] = useState<StockMovementRecord[]>([]);

  async function loadProducts() {
    setLoading(true);
    setError("");
    try {
      const response = await listLocalStockProducts({
        term,
        stockFilter: filter === "inactive" ? "all" : filter,
        active: filter === "inactive" ? 0 : 1,
        page: 1,
        limit: 500,
      });
      setProducts(response.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível carregar o estoque.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadProducts();
  }, [filter]);

  const metrics = useMemo(() => {
    const activeProducts = products.filter((product) => Number(product.active) === 1);
    const lowStock = activeProducts.filter((product) => Number(product.minimum_stock ?? 0) > 0 && Number(product.current_stock ?? 0) <= Number(product.minimum_stock ?? 0));
    const outOfStock = activeProducts.filter((product) => Number(product.current_stock ?? 0) <= 0);
    const totalStock = activeProducts.reduce((sum, product) => sum + Number(product.current_stock ?? 0), 0);

    return {
      activeProducts,
      lowStock,
      outOfStock,
      totalStock,
    };
  }, [products]);

  function resetMovementForm() {
    setQuantity("");
    setNewStock("");
    setReason("");
    setNotes("");
    setError("");
  }

  function openMovement(product: LocalStockProduct, mode: Exclude<ModalMode, "history" | null>) {
    setSelectedProduct(product);
    setModalMode(mode);
    resetMovementForm();
  }

  async function openHistory(product: LocalStockProduct) {
    setSelectedProduct(product);
    setModalMode("history");
    setHistory([]);
    setError("");
    try {
      const response = await listStockMovementsByProduct(product.id, { page: 1, limit: 100 });
      setHistory(response.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível carregar o histórico.");
    }
  }

  async function handleMovementSubmit(event: FormEvent) {
    event.preventDefault();
    if (!selectedProduct || modalMode === "history" || modalMode === null) return;

    const reasonValue = reason.trim();
    if (!reasonValue) {
      setError("Informe uma justificativa.");
      return;
    }

    const input: StockMovementInput = {
      productId: selectedProduct.id,
      type: modalMode,
      reason: reasonValue,
      notes,
    };

    if (modalMode === "entry" || modalMode === "exit") {
      const parsedQuantity = parseNumber(quantity);
      if (!Number.isFinite(parsedQuantity) || parsedQuantity <= 0) {
        setError("Informe uma quantidade maior que zero.");
        return;
      }
      if (modalMode === "exit" && Number(selectedProduct.current_stock ?? 0) - parsedQuantity < 0) {
        setError("Não é possível deixar estoque negativo.");
        return;
      }
      input.quantity = parsedQuantity;
    }

    if (modalMode === "adjustment") {
      const parsedNewStock = parseNumber(newStock);
      if (!Number.isFinite(parsedNewStock) || parsedNewStock < 0) {
        setError("Informe um novo saldo válido.");
        return;
      }
      input.newStock = parsedNewStock;
    }

    setSaving(true);
    setError("");
    try {
      await createStockMovement(input);
      setMessage(modalMode === "entry" ? "Entrada registrada com sucesso." : modalMode === "exit" ? "Saída registrada com sucesso." : "Ajuste registrado com sucesso.");
      setModalMode(null);
      setSelectedProduct(null);
      await loadProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível registrar a movimentação.");
    } finally {
      setSaving(false);
    }
  }

  const modalTitle = modalMode === "entry" ? "Entrada de estoque" : modalMode === "exit" ? "Saída de estoque" : "Ajuste de estoque";

  return (
    <section className="animate-in fade-in duration-500">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-blue-950">Estoque</h2>
          <p className="text-sm font-medium text-blue-800">Controle local de entrada, saída e ajuste de estoque.</p>
        </div>
        <button
          onClick={() => void loadProducts()}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Atualizar
        </button>
      </div>

      <div className="mb-4 rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_220px_auto]">
          <input
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") void loadProducts();
            }}
            placeholder="Buscar por nome, SKU ou código de barras"
            className="rounded-xl border border-blue-100 bg-white px-4 py-2.5 text-sm font-medium text-blue-950 outline-none focus:border-blue-500"
          />
          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value as StockFilter)}
            className="rounded-xl border border-blue-100 bg-white px-4 py-2.5 text-sm font-medium text-blue-950 outline-none focus:border-blue-500"
          >
            <option value="all">Todos ativos</option>
            <option value="low">Estoque baixo</option>
            <option value="out">Sem estoque</option>
            <option value="inactive">Inativos</option>
          </select>
          <button onClick={() => void loadProducts()} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700">
            Buscar
          </button>
        </div>
      </div>

      {message && <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{message}</div>}
      {error && !modalMode && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>}

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Produtos ativos" value={String(metrics.activeProducts.length)} icon={ClipboardList} />
        <MetricCard title="Estoque baixo" value={String(metrics.lowStock.length)} icon={Scale} />
        <MetricCard title="Sem estoque" value={String(metrics.outOfStock.length)} icon={PackageX} />
        <MetricCard title="Quantidade total" value={formatNumber(metrics.totalStock)} icon={ArrowUpCircle} />
      </div>

      <div className="overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-blue-100 bg-blue-50">
                <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-blue-500">Produto</th>
                <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-blue-500">SKU</th>
                <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-blue-500">Código</th>
                <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-blue-500">Categoria</th>
                <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-blue-500">Atual</th>
                <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-blue-500">Mínimo</th>
                <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-blue-500">Unidade</th>
                <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-blue-500">Status</th>
                <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-blue-500">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-50">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-blue-50/50">
                  <td className="px-5 py-4 text-sm font-bold text-blue-950">{product.name}</td>
                  <td className="px-5 py-4 text-xs font-mono text-blue-700">{product.sku || "-"}</td>
                  <td className="px-5 py-4 text-xs font-mono text-blue-700">{product.barcode || "-"}</td>
                  <td className="px-5 py-4 text-sm text-blue-900">{product.category_name || "Sem categoria"}</td>
                  <td className="px-5 py-4 text-sm font-black text-blue-950">{formatNumber(product.current_stock)}</td>
                  <td className="px-5 py-4 text-sm text-blue-900">{formatNumber(product.minimum_stock)}</td>
                  <td className="px-5 py-4 text-sm text-blue-900">{product.unit || "UN"}</td>
                  <td className="px-5 py-4">
                    <span className={`rounded-full px-2 py-1 text-xs font-bold ${product.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {product.active ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <IconButton title="Entrada" disabled={!product.active} onClick={() => openMovement(product, "entry")} icon={ArrowUpCircle} />
                      <IconButton title="Saída" disabled={!product.active} onClick={() => openMovement(product, "exit")} icon={ArrowDownCircle} />
                      <IconButton title="Ajustar" disabled={!product.active} onClick={() => openMovement(product, "adjustment")} icon={Scale} />
                      <IconButton title="Histórico" onClick={() => void openHistory(product)} icon={History} />
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-sm font-semibold text-blue-500">
                    Nenhum produto local encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalMode && selectedProduct && modalMode !== "history" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-blue-950/40 p-4">
          <form onSubmit={handleMovementSubmit} className="w-full max-w-xl rounded-2xl border border-blue-100 bg-white p-6 shadow-2xl">
            <ModalHeader title={modalTitle} onClose={() => setModalMode(null)} />
            <ProductSummary product={selectedProduct} />
            {error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>}

            <div className="space-y-4">
              {(modalMode === "entry" || modalMode === "exit") && (
                <Field label={modalMode === "entry" ? "Quantidade a adicionar" : "Quantidade a remover"} value={quantity} onChange={setQuantity} placeholder="0,000" />
              )}
              {modalMode === "adjustment" && (
                <Field label="Novo estoque contado" value={newStock} onChange={setNewStock} placeholder="0,000" />
              )}
              <label className="flex flex-col gap-1 text-sm font-bold text-blue-900">
                Motivo
                <select value={reason} onChange={(event) => setReason(event.target.value)} className="rounded-lg border border-blue-100 px-3 py-2 font-medium outline-none focus:border-blue-500">
                  <option value="">Selecione</option>
                  {reasonOptions[modalMode].map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </label>
              <label className="flex flex-col gap-1 text-sm font-bold text-blue-900">
                Observações
                <textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={3} className="resize-none rounded-lg border border-blue-100 px-3 py-2 font-medium outline-none focus:border-blue-500" />
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setModalMode(null)} className="rounded-lg border border-blue-100 px-4 py-2 text-sm font-bold text-blue-700 hover:bg-blue-50">Cancelar</button>
              <button type="submit" disabled={saving} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50">
                {saving ? "Registrando..." : "Confirmar"}
              </button>
            </div>
          </form>
        </div>
      )}

      {modalMode === "history" && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-blue-950/40 p-4">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-auto rounded-2xl border border-blue-100 bg-white p-6 shadow-2xl">
            <ModalHeader title="Histórico de estoque" onClose={() => setModalMode(null)} />
            <ProductSummary product={selectedProduct} />
            {error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>}
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-blue-100 bg-blue-50">
                    <th className="px-4 py-3 text-xs font-bold uppercase text-blue-500">Data</th>
                    <th className="px-4 py-3 text-xs font-bold uppercase text-blue-500">Tipo</th>
                    <th className="px-4 py-3 text-xs font-bold uppercase text-blue-500">Qtd.</th>
                    <th className="px-4 py-3 text-xs font-bold uppercase text-blue-500">Anterior</th>
                    <th className="px-4 py-3 text-xs font-bold uppercase text-blue-500">Novo</th>
                    <th className="px-4 py-3 text-xs font-bold uppercase text-blue-500">Motivo</th>
                    <th className="px-4 py-3 text-xs font-bold uppercase text-blue-500">Referência</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-blue-50">
                  {history.map((movement) => (
                    <tr key={movement.id}>
                      <td className="px-4 py-3 text-xs text-blue-900">{formatDate(movement.created_at)}</td>
                      <td className="px-4 py-3 text-sm font-bold text-blue-950">{movementTypeLabel(movement.type)}</td>
                      <td className="px-4 py-3 text-sm text-blue-900">{formatNumber(movement.quantity)}</td>
                      <td className="px-4 py-3 text-sm text-blue-900">{formatNumber(movement.previous_stock)}</td>
                      <td className="px-4 py-3 text-sm font-bold text-blue-950">{formatNumber(movement.new_stock)}</td>
                      <td className="px-4 py-3 text-sm text-blue-900">
                        <div className="font-semibold">{movement.reason}</div>
                        {movement.notes && <div className="text-xs text-blue-500">{movement.notes}</div>}
                      </td>
                      <td className="px-4 py-3 text-xs text-blue-700">{movement.reference_type || "-"} {movement.reference_id || ""}</td>
                    </tr>
                  ))}
                  {history.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-10 text-center text-sm font-semibold text-blue-500">Nenhuma movimentação registrada.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function MetricCard({ title, value, icon: Icon }: { title: string; value: string; icon: React.ElementType }) {
  return (
    <div className="rounded-2xl border border-blue-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-blue-500">{title}</p>
          <p className="mt-2 text-2xl font-black text-blue-950">{value}</p>
        </div>
        <div className="rounded-2xl bg-blue-50 p-3 text-blue-700">
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}

function IconButton({ title, icon: Icon, onClick, disabled = false }: { title: string; icon: React.ElementType; onClick: () => void; disabled?: boolean }) {
  return (
    <button type="button" title={disabled ? "Não é possível movimentar estoque de produto inativo" : title} disabled={disabled} onClick={onClick} className="rounded-lg p-2 text-gray-400 transition-all hover:bg-blue-50 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-35">
      <Icon size={18} />
    </button>
  );
}

function ModalHeader({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div className="mb-5 flex items-center justify-between">
      <h3 className="text-xl font-black text-blue-950">{title}</h3>
      <button type="button" onClick={onClose} className="rounded-lg p-2 text-blue-500 hover:bg-blue-50">
        <X size={20} />
      </button>
    </div>
  );
}

function ProductSummary({ product }: { product: LocalStockProduct }) {
  return (
    <div className="mb-5 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3">
      <div className="text-sm font-black text-blue-950">{product.name}</div>
      <div className="mt-1 text-xs font-semibold text-blue-700">
        Estoque atual: {formatNumber(product.current_stock)} {product.unit || "UN"} · SKU: {product.sku || "-"}
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string }) {
  return (
    <label className="flex flex-col gap-1 text-sm font-bold text-blue-900">
      {label}
      <input value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} className="rounded-lg border border-blue-100 px-3 py-2 font-medium outline-none focus:border-blue-500" />
    </label>
  );
}

function movementTypeLabel(type: StockMovementRecord["type"]) {
  switch (type) {
    case "entry": return "Entrada";
    case "exit": return "Saída";
    case "adjustment": return "Ajuste";
    case "sale": return "Venda";
    case "sale_cancel": return "Cancelamento";
    default: return type;
  }
}
