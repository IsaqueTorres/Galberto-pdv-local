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
import type { LocalCategory, ProductFormState } from "./types/products.types";
import { recordToForm, emptyForm } from "./utils/recordToForm";
import { toPayload } from "./utils/toPayload";
import { Field } from "./components/Field";
import { TextArea } from "./components/TextArea";

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

  const fieldHints: Record<string, string> = {
    name: "Nome comercial do produto usado no PDV e nas notas fiscais.",
    sale_price: "Preço de venda do produto em reais; usado nas vendas e no cálculo de margem.",
    sku: "Código interno para identificar o produto no estoque.",
    barcode: "Código de barras utilizado por leitoras no ponto de venda.",
    category_id: "Categoria do produto para organização e relatórios.",
    unit: "Unidade de medida do produto (ex: UN, KG, PC).",
    cost_price: "Preço de compra para controlar custo e margem.",
    minimum_stock: "Quantidade mínima desejada em estoque antes de reposição.",
    maximum_stock: "Quantidade máxima recomendada de estoque para evitar excesso.",
    ncm: "Código NCM usado na emissão da nota fiscal.",
    cfop: "Código CFOP que identifica a natureza da operação tributária.",
    origin: "Origem do produto para tributação (ex: nacional, estrangeiro).",
    cest: "Código CEST, usado quando há substituição tributária.",
    situation: "Situação fiscal ou tributária do produto.",
    active: "Status do produto: ativo para venda ou inativo somente para histórico.",
    supplier_code: "Código do produto fornecido pelo fornecedor.",
    supplier_name: "Nome do fornecedor ou fabricante do produto.",
    location: "Localização física do produto no estoque ou prateleira.",
    brand: "Marca do produto para facilitar buscas e relatórios.",
    product_group: "Grupo ou família do produto dentro do cadastro.",
    short_description: "Descrição curta exibida no PDV e em listagens.",
    complementary_description: "Descrição adicional para controle interno.",
    notes: "Observações extras que ajudam o operador ou a equipe de estoque.",
    additional_info: "Informações suplementares importantes para o produto.",
  };

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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-blue-950/40 px-4 py-6 sm:px-6 sm:py-8">
          <form onSubmit={handleSubmit} className="max-h-[90vh] w-full max-w-[1200px] min-w-[min(100%,48rem)] overflow-visible rounded-2xl border border-blue-100 bg-white p-6 shadow-2xl">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-xl font-black text-blue-950">{title}</h3>
                <p className="text-sm font-medium text-blue-700">O estoque atual é controlado somente pelos fluxos de estoque e venda.</p>
              </div>
              <button type="button" onClick={() => setModalOpen(false)} className="rounded-lg p-2 text-blue-500 hover:bg-blue-50">
                <X size={20} />
              </button>
            </div>

            {error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3 xl:grid-cols-4">
              <Field label="Nome *" value={form.name} onChange={(v) => updateField("name", v)} hint={fieldHints.name} className="md:col-span-2 xl:col-span-2" />
              <Field label="Preço de venda *" value={form.sale_price} onChange={(v) => updateField("sale_price", v)} placeholder="0,00" hint={fieldHints.sale_price} />
              <Field label="SKU" value={form.sku} onChange={(v) => updateField("sku", v)} hint={fieldHints.sku} />
              <Field label="Código de barras" value={form.barcode} onChange={(v) => updateField("barcode", v)} hint={fieldHints.barcode} />
              <label className="group flex flex-col gap-1 text-sm font-bold text-blue-900">
                <div className="flex items-center gap-2">
                  <span>Categoria</span>
                  <span className="relative inline-flex h-5 w-5 cursor-help items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-blue-700">
                    ?
                    <span className="pointer-events-none absolute left-1/2 top-full z-20 hidden w-64 -translate-x-1/2 rounded-2xl border border-blue-100 bg-white p-3 text-xs font-normal text-blue-900 shadow-lg group-hover:block">
                      {fieldHints.category_id}
                    </span>
                  </span>
                </div>
                <select value={form.category_id} onChange={(e) => updateField("category_id", e.target.value)} className="rounded-lg border border-blue-100 px-3 py-2 font-medium outline-none focus:border-blue-500">
                  <option value="">Sem categoria</option>
                  {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                </select>
              </label>
              <Field label="Unidade" value={form.unit} onChange={(v) => updateField("unit", v)} hint={fieldHints.unit} />
              <Field label="Preço de custo" value={form.cost_price} onChange={(v) => updateField("cost_price", v)} placeholder="0,00" hint={fieldHints.cost_price} />
              <Field label="Estoque mínimo" value={form.minimum_stock} onChange={(v) => updateField("minimum_stock", v)} type="number" hint={fieldHints.minimum_stock} />
              <Field label="Estoque máximo" value={form.maximum_stock} onChange={(v) => updateField("maximum_stock", v)} type="number" hint={fieldHints.maximum_stock} />
              <Field label="NCM" value={form.ncm} onChange={(v) => updateField("ncm", v)} hint={fieldHints.ncm} />
              <Field label="CFOP" value={form.cfop} onChange={(v) => updateField("cfop", v)} hint={fieldHints.cfop} />
              <Field label="Origem" value={form.origin} onChange={(v) => updateField("origin", v)} hint={fieldHints.origin} />
              <Field label="CEST" value={form.cest} onChange={(v) => updateField("cest", v)} hint={fieldHints.cest} />
              <Field label="Situação" value={form.situation} onChange={(v) => updateField("situation", v)} hint={fieldHints.situation} />
              <label className="group flex flex-col gap-1 text-sm font-bold text-blue-900">
                <div className="flex items-center gap-2">
                  <span>Status</span>
                  <span className="relative inline-flex h-5 w-5 cursor-help items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-blue-700">
                    ?
                    <span className="pointer-events-none absolute left-1/2 top-full z-20 hidden w-64 -translate-x-1/2 rounded-2xl border border-blue-100 bg-white p-3 text-xs font-normal text-blue-900 shadow-lg group-hover:block">
                      {fieldHints.active}
                    </span>
                  </span>
                </div>
                <select value={form.active} onChange={(e) => updateField("active", Number(e.target.value))} className="rounded-lg border border-blue-100 px-3 py-2 font-medium outline-none focus:border-blue-500">
                  <option value={1}>Ativo</option>
                  <option value={0}>Inativo</option>
                </select>
              </label>
              <Field label="Código fornecedor" value={form.supplier_code} onChange={(v) => updateField("supplier_code", v)} hint={fieldHints.supplier_code} />
              <Field label="Nome fornecedor" value={form.supplier_name} onChange={(v) => updateField("supplier_name", v)} hint={fieldHints.supplier_name} />
              <Field label="Localização" value={form.location} onChange={(v) => updateField("location", v)} hint={fieldHints.location} />
              <Field label="Marca" value={form.brand} onChange={(v) => updateField("brand", v)} hint={fieldHints.brand} />
              <Field label="Grupo" value={form.product_group} onChange={(v) => updateField("product_group", v)} hint={fieldHints.product_group} />
              <Field label="Descrição curta" value={form.short_description} onChange={(v) => updateField("short_description", v)} hint={fieldHints.short_description} />
              <TextArea label="Descrição complementar" value={form.complementary_description} onChange={(v) => updateField("complementary_description", v)} hint={fieldHints.complementary_description} />
              <TextArea label="Observações" value={form.notes} onChange={(v) => updateField("notes", v)} hint={fieldHints.notes} />
              <TextArea label="Informações adicionais" value={form.additional_info} onChange={(v) => updateField("additional_info", v)} hint={fieldHints.additional_info} />
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