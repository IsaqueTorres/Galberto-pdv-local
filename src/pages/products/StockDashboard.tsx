import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Boxes, CheckCircle2, CircleDollarSign, PackageX, RefreshCw } from "lucide-react";
import { listarProdutos } from "./services/products.service";

type StockProduct = {
  id: string | number;
  nome: string;
  codigo_barras?: string | null;
  preco_venda: number;
  estoque_atual: number;
  ativo: number;
};

function formatMoney(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function getStockStatus(product: StockProduct) {
  const stock = Number(product.estoque_atual ?? 0);
  if (stock <= 0) return "Sem estoque";
  if (stock <= 5) return "Crítico";
  if (stock <= 20) return "Baixo";
  return "OK";
}

export default function StockDashboard() {
  const [products, setProducts] = useState<StockProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadStock() {
    setLoading(true);
    setError("");

    try {
      const response = await listarProdutos({
        page: 1,
        limit: 1000,
      });
      setProducts(
        (response.data ?? []).map((product: Partial<StockProduct>) => ({
          id: product.id ?? "",
          nome: product.nome ?? "Produto sem nome",
          codigo_barras: product.codigo_barras ?? null,
          preco_venda: Number(product.preco_venda ?? 0),
          estoque_atual: Number(product.estoque_atual ?? 0),
          ativo: Number(product.ativo ?? 0),
        })),
      );
    } catch (err) {
      console.error("Erro ao carregar estoque:", err);
      setError("Não foi possível carregar os dados de estoque.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadStock();
  }, []);

  const metrics = useMemo(() => {
    const activeProducts = products.filter((product) => Number(product.ativo) === 1);
    const totalUnits = activeProducts.reduce((sum, product) => sum + Number(product.estoque_atual ?? 0), 0);
    const stockValue = activeProducts.reduce(
      (sum, product) => sum + Number(product.estoque_atual ?? 0) * Number(product.preco_venda ?? 0),
      0,
    );
    const outOfStock = activeProducts.filter((product) => Number(product.estoque_atual ?? 0) <= 0);
    const critical = activeProducts.filter((product) => {
      const stock = Number(product.estoque_atual ?? 0);
      return stock > 0 && stock <= 5;
    });
    const low = activeProducts.filter((product) => {
      const stock = Number(product.estoque_atual ?? 0);
      return stock > 5 && stock <= 20;
    });
    const ok = activeProducts.filter((product) => Number(product.estoque_atual ?? 0) > 20);
    const topStock = [...activeProducts]
      .sort((a, b) => Number(b.estoque_atual ?? 0) - Number(a.estoque_atual ?? 0))
      .slice(0, 8);

    return {
      activeProducts,
      totalUnits,
      stockValue,
      outOfStock,
      critical,
      low,
      ok,
      topStock,
    };
  }, [products]);

  const maxBarValue = Math.max(
    metrics.outOfStock.length,
    metrics.critical.length,
    metrics.low.length,
    metrics.ok.length,
    1,
  );

  return (
    <section className="animate-in fade-in duration-500">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-blue-950">Painel de Estoque</h2>
          <p className="text-sm font-medium text-blue-800">
            Visão somente leitura. Entradas e saídas continuam sendo controladas pelo Bling.
          </p>
        </div>

        <button
          onClick={() => void loadStock()}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Atualizar
        </button>
      </div>

      {error && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Produtos ativos" value={String(metrics.activeProducts.length)} icon={Boxes} tone="blue" />
        <MetricCard title="Unidades em estoque" value={metrics.totalUnits.toLocaleString("pt-BR")} icon={CheckCircle2} tone="emerald" />
        <MetricCard title="Sem estoque" value={String(metrics.outOfStock.length)} icon={PackageX} tone="rose" />
        <MetricCard title="Valor em venda" value={formatMoney(metrics.stockValue)} icon={CircleDollarSign} tone="amber" />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="rounded-3xl border border-blue-200 bg-gradient-to-br from-white to-blue-50 p-6 shadow-md shadow-blue-900/5 xl:col-span-2">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-blue-950">Distribuição do estoque</h3>
              <p className="text-sm font-medium text-blue-700">Classificação simples por quantidade atual.</p>
            </div>
          </div>

          <div className="space-y-4">
            <StockBar label="Sem estoque" count={metrics.outOfStock.length} max={maxBarValue} color="bg-rose-500" />
            <StockBar label="Crítico (1 a 5)" count={metrics.critical.length} max={maxBarValue} color="bg-orange-500" />
            <StockBar label="Baixo (6 a 20)" count={metrics.low.length} max={maxBarValue} color="bg-amber-500" />
            <StockBar label="OK (acima de 20)" count={metrics.ok.length} max={maxBarValue} color="bg-emerald-500" />
          </div>
        </div>

        <div className="rounded-3xl border border-amber-300 bg-gradient-to-br from-amber-50 via-white to-white p-6 shadow-md shadow-amber-900/10">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-2xl bg-amber-500 p-3 text-white shadow-lg shadow-amber-600/20">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-amber-950">Atenção</h3>
              <p className="text-sm font-medium text-amber-800">Produtos com estoque crítico.</p>
            </div>
          </div>

          <ProductList
            emptyMessage="Nenhum produto crítico encontrado."
            products={[...metrics.outOfStock, ...metrics.critical].slice(0, 8)}
          />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="rounded-3xl border border-blue-200 bg-white p-6 shadow-md shadow-blue-900/5">
          <h3 className="mb-4 text-lg font-black text-blue-950">Maior volume em estoque</h3>
          <ProductList emptyMessage="Nenhum produto com estoque." products={metrics.topStock} />
        </div>

        <div className="rounded-3xl border border-rose-200 bg-gradient-to-br from-rose-50 via-white to-white p-6 shadow-md shadow-rose-900/5">
          <h3 className="mb-4 text-lg font-black text-rose-950">Sem estoque</h3>
          <ProductList emptyMessage="Nenhum produto sem estoque." products={metrics.outOfStock.slice(0, 8)} />
        </div>
      </div>
    </section>
  );
}

function MetricCard({
  title,
  value,
  icon: Icon,
  tone,
}: {
  title: string;
  value: string;
  icon: React.ElementType;
  tone: "blue" | "emerald" | "rose" | "amber";
}) {
  const tones = {
    blue: "bg-gradient-to-br from-white to-blue-100 text-blue-700 border-blue-300 shadow-blue-900/10",
    emerald: "bg-gradient-to-br from-white to-emerald-100 text-emerald-700 border-emerald-300 shadow-emerald-900/10",
    rose: "bg-gradient-to-br from-white to-rose-100 text-rose-700 border-rose-300 shadow-rose-900/10",
    amber: "bg-gradient-to-br from-white to-amber-100 text-amber-700 border-amber-300 shadow-amber-900/10",
  };

  return (
    <div className={`rounded-3xl border p-5 shadow-md ${tones[tone]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-widest opacity-80">{title}</p>
          <p className="mt-2 text-2xl font-black text-blue-950">{value}</p>
        </div>
        <div className="rounded-2xl bg-white p-3 shadow-sm">
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}

function StockBar({ label, count, max, color }: { label: string; count: number; max: number; color: string }) {
  const width = Math.max((count / max) * 100, count > 0 ? 8 : 0);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-semibold text-blue-900">{label}</span>
        <span className="font-bold text-blue-950">{count}</span>
      </div>
      <div className="h-4 overflow-hidden rounded-full bg-blue-100">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

function ProductList({ products, emptyMessage }: { products: StockProduct[]; emptyMessage: string }) {
  if (products.length === 0) {
    return <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-5 text-center text-sm font-medium text-blue-600">{emptyMessage}</div>;
  }

  return (
    <div className="space-y-3">
      {products.map((product) => (
        <div key={product.id} className="flex items-center justify-between rounded-2xl border border-blue-100 bg-white px-4 py-3 shadow-sm transition hover:border-blue-300 hover:bg-blue-50/50">
          <div className="min-w-0">
            <div className="truncate text-sm font-bold text-blue-950">{product.nome}</div>
            <div className="text-xs font-medium text-blue-500">
              {product.codigo_barras || "Sem código"} · {getStockStatus(product)}
            </div>
          </div>
          <div className="ml-4 text-right">
            <div className="text-lg font-black text-blue-950">{Number(product.estoque_atual ?? 0)}</div>
            <div className="text-[10px] font-bold uppercase text-blue-400">unid.</div>
          </div>
        </div>
      ))}
    </div>
  );
}
