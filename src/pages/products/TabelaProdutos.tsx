import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Eye, NotebookPenIcon, Plus, Trash2, X } from "lucide-react";
import {
  createLocalProduct,
  getProductById,
  listLocalCategories,
  listarProdutos,
  showProductWindow,
  softDeleteLocalProduct,
  updateLocalProduct,
} from "./services/products.service";
import type { LocalCategory, LocalProductPayload, ProductRecord } from "./types/products.types";

type ProductFormState = {
  name: string;
  sale_price: string;
  sku: string;
  barcode: string;
  category_id: string;
  unit: string;
  cost_price: string;
  minimum_stock: string;
  maximum_stock: string;
  active: number;
  ncm: string;
  cfop: string;
  origin: string;
  cest: string;
  notes: string;
  situation: string;
  supplier_code: string;
  supplier_name: string;
  location: string;
  brand: string;
  product_group: string;
  short_description: string;
  complementary_description: string;
  additional_info: string;
};

const emptyForm: ProductFormState = {
  name: "",
  sale_price: "",
  sku: "",
  barcode: "",
  category_id: "",
  unit: "UN",
  cost_price: "",
  minimum_stock: "0",
  maximum_stock: "",
  active: 1,
  ncm: "",
  cfop: "",
  origin: "",
  cest: "",
  notes: "",
  situation: "",
  supplier_code: "",
  supplier_name: "",
  location: "",
  brand: "",
  product_group: "",
  short_description: "",
  complementary_description: "",
  additional_info: "",
};

function centsFromMoney(value: string) {
  const normalized = value.replace(/\./g, "").replace(",", ".");
  const number = Number(normalized);
  if (!Number.isFinite(number) || number < 0) return NaN;
  return Math.round(number * 100);
}

function moneyInput(value: number | null | undefined) {
  if (value === null || value === undefined) return "";
  return Number(value).toFixed(2).replace(".", ",");
}

function recordToForm(product: ProductRecord): ProductFormState {
  return {
    ...emptyForm,
    name: product.nome ?? "",
    sale_price: moneyInput(product.preco_venda),
    sku: product.sku ?? "",
    barcode: product.codigo_barras ?? "",
    category_id: product.categoria_id ?? "",
    unit: product.unidade_medida ?? "UN",
    cost_price: moneyInput(product.preco_custo),
    minimum_stock: String(product.estoque_minimo ?? 0),
    maximum_stock: product.estoque_maximo === null || product.estoque_maximo === undefined ? "" : String(product.estoque_maximo),
    active: Number(product.ativo ?? 1),
    ncm: product.ncm ?? "",
    cfop: product.cfop ?? "",
    origin: product.origem ?? "",
    cest: product.cest ?? "",
    notes: product.observacoes ?? "",
    situation: product.situacao ?? "",
    supplier_code: product.supplier_code ?? "",
    supplier_name: product.supplier_name ?? "",
    location: product.localizacao ?? "",
    brand: product.brand ?? "",
    product_group: product.product_group ?? "",
    short_description: product.short_description ?? "",
    complementary_description: product.complementary_description ?? "",
    additional_info: product.additional_info ?? "",
  };
}

function toPayload(form: ProductFormState): LocalProductPayload {
  return {
    name: form.name.trim(),
    sale_price_cents: centsFromMoney(form.sale_price),
    sku: form.sku,
    barcode: form.barcode,
    category_id: form.category_id || null,
    unit: form.unit || "UN",
    cost_price_cents: centsFromMoney(form.cost_price || "0"),
    minimum_stock: Number(form.minimum_stock || 0),
    maximum_stock: form.maximum_stock.trim() ? Number(form.maximum_stock) : null,
    active: form.active,
    ncm: form.ncm,
    cfop: form.cfop,
    origin: form.origin,
    cest: form.cest,
    notes: form.notes,
    situation: form.situation,
    supplier_code: form.supplier_code,
    supplier_name: form.supplier_name,
    location: form.location,
    brand: form.brand,
    product_group: form.product_group,
    short_description: form.short_description,
    complementary_description: form.complementary_description,
    additional_info: form.additional_info,
  };
}

export default function TabelaProdutos() {
  const [produtos, setProdutos] = useState<any[]>([]);
  const [categories, setCategories] = useState<LocalCategory[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filtroNome, setFiltroNome] = useState("");
  const [filtroAtivo, setFiltroAtivo] = useState<number | undefined>(undefined);
  const [filtroCodigo, setFiltroCodigo] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductFormState>(emptyForm);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const title = useMemo(() => editingId ? "Editar produto" : "Novo produto", [editingId]);

  async function carregarProdutos(p = page) {
    const res = await listarProdutos({
      nome: filtroNome,
      ativo: filtroAtivo,
      codigo: filtroCodigo,
      page: p,
      limit: 20,
    });
    setProdutos(res.data);
    setTotalPages(Math.max(1, Math.ceil(res.total / res.limit)));
  }

  async function carregarCategorias() {
    setCategories(await listLocalCategories(true));
  }

  useEffect(() => {
    void carregarProdutos();
  }, [page, filtroNome, filtroAtivo, filtroCodigo]);

  useEffect(() => {
    void carregarCategorias();
  }, []);

  function openCreateModal() {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setModalOpen(true);
  }

  async function openEditModal(id: string) {
    const product = await getProductById(id);
    if (!product || product.integration_source !== "local") {
      setError("Este produto não é local e não pode ser editado nesta versão.");
      return;
    }
    setEditingId(String(product.id));
    setForm(recordToForm(product));
    setError("");
    setModalOpen(true);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");

    const payload = toPayload(form);
    if (!payload.name) {
      setError("Informe o nome do produto.");
      return;
    }
    if (!Number.isFinite(payload.sale_price_cents) || payload.sale_price_cents < 0) {
      setError("Informe um preço de venda válido.");
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        await updateLocalProduct(editingId, payload);
      } else {
        await createLocalProduct(payload);
      }
      setModalOpen(false);
      await carregarProdutos(1);
      setPage(1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível salvar o produto.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Deseja excluir este produto local?")) return;
    await softDeleteLocalProduct(id);
    await carregarProdutos(page);
  }

  function updateField(field: keyof ProductFormState, value: string | number) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  return (
    <section className="animate-in fade-in duration-500">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-blue-950">Gestão de Produtos</h2>
          <p className="text-sm text-blue-800">Cadastre e consulte produtos locais do PDV.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-blue-700"
        >
          <Plus size={18} />
          Novo produto
        </button>
      </div>

      <div className="mb-4 rounded-2xl border-b border-blue-100 bg-blue-50/60 p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
          <input className="w-full rounded-xl border border-blue-100 bg-white px-4 py-2.5 text-sm text-blue-950 outline-none transition-all placeholder:text-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" placeholder="Nome do produto" value={filtroNome} onChange={(e) => setFiltroNome(e.target.value)} />
          <input className="w-full rounded-xl border border-blue-100 bg-white px-4 py-2.5 text-sm text-blue-950 outline-none transition-all placeholder:text-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" placeholder="Código / SKU" value={filtroCodigo} onChange={(e) => setFiltroCodigo(e.target.value)} />
          <select className="w-full rounded-xl border border-blue-100 bg-white px-4 py-2.5 text-sm text-blue-950 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" value={filtroAtivo ?? ""} onChange={(e) => setFiltroAtivo(e.target.value === "" ? undefined : Number(e.target.value))}>
            <option value="">Todos</option>
            <option value="1">Ativo</option>
            <option value="0">Inativo</option>
          </select>
          <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white transition hover:bg-blue-700" onClick={() => { setPage(1); void carregarProdutos(1); }}>Buscar</button>
          <button className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-300" onClick={() => { setFiltroNome(""); setFiltroCodigo(""); setFiltroAtivo(undefined); setPage(1); }}>Limpar</button>
        </div>
      </div>

      {error && !modalOpen && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>
      )}

      <div className="overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-blue-100 bg-blue-50">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-blue-500">Código</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-blue-500">Nome do Produto</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-blue-500">Código de Barras</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-blue-500">Preço</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-blue-500">Estoque</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-blue-500">Status</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-blue-500">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-50">
              {produtos.map((p) => (
                <tr key={p.id} className="transition-colors hover:bg-blue-50/50">
                  <td className="px-6 py-4 text-xs font-mono text-blue-700">{p.sku || p.codigo_barras || String(p.id).slice(0, 8)}</td>
                  <td className="px-6 py-4 text-sm font-bold text-blue-950">{p.nome}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-blue-950">{p.codigo_barras || "Sem código"}</td>
                  <td className="px-6 py-4 text-sm font-bold text-blue-950">R$ {Number(p.preco_venda ?? 0).toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm font-bold text-blue-950">{p.estoque_atual}</td>
                  <td className="px-6 py-4 text-sm font-bold text-blue-950">
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${p.ativo ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {p.ativo ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center gap-2">
                      <button className="rounded-lg p-2 text-gray-400 transition-all hover:bg-emerald-50 hover:text-emerald-600" title="Ver" onClick={() => showProductWindow(p.id)}>
                        <Eye size={18} />
                      </button>
                      <button className="rounded-lg p-2 text-gray-400 transition-all hover:bg-blue-50 hover:text-blue-600" title="Editar" onClick={() => void openEditModal(p.id)}>
                        <NotebookPenIcon size={18} />
                      </button>
                      <button className="rounded-lg p-2 text-gray-400 transition-all hover:bg-red-50 hover:text-red-600" title="Excluir" onClick={() => void handleDelete(p.id)}>
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-gray-200 p-4">
        <span className="text-sm text-gray-600">Página {page} de {totalPages}</span>
        <div className="space-x-2">
          <button className="rounded-lg border border-gray-300 bg-emerald-600 px-3 py-1 text-white hover:bg-emerald-500 disabled:opacity-50" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Anterior</button>
          <button className="rounded-lg border border-gray-300 bg-emerald-600 px-3 py-1 text-white hover:bg-emerald-500 disabled:opacity-50" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>Próxima</button>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-blue-950/40 p-4">
          <form onSubmit={handleSubmit} className="max-h-[92vh] w-full max-w-5xl overflow-auto rounded-2xl border border-blue-100 bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-blue-950">{title}</h3>
                <p className="text-sm font-medium text-blue-700">O estoque atual é controlado somente pelos fluxos de estoque e venda.</p>
              </div>
              <button type="button" onClick={() => setModalOpen(false)} className="rounded-lg p-2 text-blue-500 hover:bg-blue-50">
                <X size={20} />
              </button>
            </div>

            {error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Field label="Nome *" value={form.name} onChange={(v) => updateField("name", v)} className="md:col-span-2" />
              <Field label="Preço de venda *" value={form.sale_price} onChange={(v) => updateField("sale_price", v)} placeholder="0,00" />
              <Field label="SKU" value={form.sku} onChange={(v) => updateField("sku", v)} />
              <Field label="Código de barras" value={form.barcode} onChange={(v) => updateField("barcode", v)} />
              <label className="flex flex-col gap-1 text-sm font-bold text-blue-900">
                Categoria
                <select value={form.category_id} onChange={(e) => updateField("category_id", e.target.value)} className="rounded-lg border border-blue-100 px-3 py-2 font-medium outline-none focus:border-blue-500">
                  <option value="">Sem categoria</option>
                  {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                </select>
              </label>
              <Field label="Unidade" value={form.unit} onChange={(v) => updateField("unit", v)} />
              <Field label="Preço de custo" value={form.cost_price} onChange={(v) => updateField("cost_price", v)} placeholder="0,00" />
              <Field label="Estoque mínimo" value={form.minimum_stock} onChange={(v) => updateField("minimum_stock", v)} type="number" />
              <Field label="Estoque máximo" value={form.maximum_stock} onChange={(v) => updateField("maximum_stock", v)} type="number" />
              <Field label="NCM" value={form.ncm} onChange={(v) => updateField("ncm", v)} />
              <Field label="CFOP" value={form.cfop} onChange={(v) => updateField("cfop", v)} />
              <Field label="Origem" value={form.origin} onChange={(v) => updateField("origin", v)} />
              <Field label="CEST" value={form.cest} onChange={(v) => updateField("cest", v)} />
              <Field label="Situação" value={form.situation} onChange={(v) => updateField("situation", v)} />
              <label className="flex flex-col gap-1 text-sm font-bold text-blue-900">
                Status
                <select value={form.active} onChange={(e) => updateField("active", Number(e.target.value))} className="rounded-lg border border-blue-100 px-3 py-2 font-medium outline-none focus:border-blue-500">
                  <option value={1}>Ativo</option>
                  <option value={0}>Inativo</option>
                </select>
              </label>
              <Field label="Código fornecedor" value={form.supplier_code} onChange={(v) => updateField("supplier_code", v)} />
              <Field label="Nome fornecedor" value={form.supplier_name} onChange={(v) => updateField("supplier_name", v)} />
              <Field label="Localização" value={form.location} onChange={(v) => updateField("location", v)} />
              <Field label="Marca" value={form.brand} onChange={(v) => updateField("brand", v)} />
              <Field label="Grupo" value={form.product_group} onChange={(v) => updateField("product_group", v)} />
              <Field label="Descrição curta" value={form.short_description} onChange={(v) => updateField("short_description", v)} />
              <TextArea label="Descrição complementar" value={form.complementary_description} onChange={(v) => updateField("complementary_description", v)} />
              <TextArea label="Observações" value={form.notes} onChange={(v) => updateField("notes", v)} />
              <TextArea label="Informações adicionais" value={form.additional_info} onChange={(v) => updateField("additional_info", v)} />
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setModalOpen(false)} className="rounded-lg border border-blue-100 px-4 py-2 text-sm font-bold text-blue-700 hover:bg-blue-50">Cancelar</button>
              <button type="submit" disabled={saving} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50">
                {saving ? "Salvando..." : "Salvar produto"}
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}

function Field({ label, value, onChange, type = "text", placeholder, className = "" }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  className?: string;
}) {
  return (
    <label className={`flex flex-col gap-1 text-sm font-bold text-blue-900 ${className}`}>
      {label}
      <input type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className="rounded-lg border border-blue-100 px-3 py-2 font-medium outline-none focus:border-blue-500" />
    </label>
  );
}

function TextArea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="flex flex-col gap-1 text-sm font-bold text-blue-900 md:col-span-1">
      {label}
      <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3} className="resize-none rounded-lg border border-blue-100 px-3 py-2 font-medium outline-none focus:border-blue-500" />
    </label>
  );
}
