import { useEffect, useState } from "react";
import { Eye, NotebookPenIcon, Plus, Trash2 } from "lucide-react";
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
import ProductFormModal from "./components/ProductFormModal";

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
  const [initialFormData, setInitialFormData] = useState<ProductFormState>(emptyForm);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

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
    setInitialFormData(emptyForm);
    setError("");
    setModalOpen(true);
  }

  async function openEditModal(id: string) {
    try {
      const product = await getProductById(id);
      if (!product || product.integration_source !== "local") {
        setError("Este produto não é local e não pode ser editado nesta versão.");
        return;
      }
      setEditingId(String(product.id));
      setInitialFormData(recordToForm(product));
      setError("");
      setModalOpen(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao abrir formulário");
    }
  }

  async function handleModalSubmit(payload: any) {
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
    try {
      await softDeleteLocalProduct(id);
      await carregarProdutos(page);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao excluir produto");
    }
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
          <input
            className="w-full rounded-xl border border-blue-100 bg-white px-4 py-2.5 text-sm text-blue-950 outline-none transition-all placeholder:text-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            placeholder="Nome do produto"
            value={filtroNome}
            onChange={(e) => setFiltroNome(e.target.value)}
          />
          <input
            className="w-full rounded-xl border border-blue-100 bg-white px-4 py-2.5 text-sm text-blue-950 outline-none transition-all placeholder:text-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            placeholder="Código / SKU"
            value={filtroCodigo}
            onChange={(e) => setFiltroCodigo(e.target.value)}
          />
          <select
            className="w-full rounded-xl border border-blue-100 bg-white px-4 py-2.5 text-sm text-blue-950 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            value={filtroAtivo ?? ""}
            onChange={(e) => setFiltroAtivo(e.target.value === "" ? undefined : Number(e.target.value))}
          >
            <option value="">Todos</option>
            <option value="1">Ativo</option>
            <option value="0">Inativo</option>
          </select>
          <button
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white transition hover:bg-blue-700"
            onClick={() => {
              setPage(1);
              void carregarProdutos(1);
            }}
          >
            Buscar
          </button>
          <button
            className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-300"
            onClick={() => {
              setFiltroNome("");
              setFiltroCodigo("");
              setFiltroAtivo(undefined);
              setPage(1);
            }}
          >
            Limpar
          </button>
        </div>
      </div>

      {error && !modalOpen && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </div>
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
                      <button
                        className="rounded-lg p-2 text-gray-400 transition-all hover:bg-emerald-50 hover:text-emerald-600"
                        title="Ver"
                        onClick={() => showProductWindow(p.id)}
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        className="rounded-lg p-2 text-gray-400 transition-all hover:bg-blue-50 hover:text-blue-600"
                        title="Editar"
                        onClick={() => void openEditModal(p.id)}
                      >
                        <NotebookPenIcon size={18} />
                      </button>
                      <button
                        className="rounded-lg p-2 text-gray-400 transition-all hover:bg-red-50 hover:text-red-600"
                        title="Excluir"
                        onClick={() => void handleDelete(p.id)}
                      >
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
          <button
            className="rounded-lg border border-gray-300 bg-emerald-600 px-3 py-1 text-white hover:bg-emerald-500 disabled:opacity-50"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Anterior
          </button>
          <button
            className="rounded-lg border border-gray-300 bg-emerald-600 px-3 py-1 text-white hover:bg-emerald-500 disabled:opacity-50"
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Próxima
          </button>
        </div>
      </div>

      <ProductFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleModalSubmit}
        initialData={initialFormData}
        categories={categories}
        isEditing={editingId !== null}
        isSaving={saving}
      />
    </section>
  );
}