import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { CheckCircle2, NotebookPen, Plus, Trash2, XCircle } from "lucide-react";
import {
  createLocalCategory,
  listLocalCategories,
  softDeleteLocalCategory,
  updateLocalCategory,
} from "./services/products.service";
import type { LocalCategory } from "./types/products.types";

export default function CategoriasLocais() {
  const [categories, setCategories] = useState<LocalCategory[]>([]);
  const [name, setName] = useState("");
  const [active, setActive] = useState(1);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadCategories() {
    setCategories(await listLocalCategories(false));
  }

  useEffect(() => {
    void loadCategories();
  }, []);

  function resetForm() {
    setName("");
    setActive(1);
    setEditingId(null);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!name.trim()) {
      setError("Informe o nome da categoria.");
      return;
    }

    try {
      if (editingId) {
        await updateLocalCategory(editingId, { name, active });
      } else {
        await createLocalCategory({ name, active });
      }
      resetForm();
      await loadCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível salvar a categoria.");
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Deseja excluir esta categoria local?")) return;
    const result = await softDeleteLocalCategory(id);
    setMessage(result.deactivatedOnly ? "Categoria vinculada a produtos. Ela foi apenas inativada." : "");
    await loadCategories();
  }

  function startEdit(category: LocalCategory) {
    setEditingId(category.id);
    setName(category.name);
    setActive(Number(category.active ?? 1));
    setError("");
    setMessage("");
  }

  return (
    <section className="animate-in fade-in duration-500">
      <div className="mb-8">
        <h2 className="text-2xl font-black tracking-tight text-blue-950">Categorias Locais</h2>
        <p className="text-sm text-blue-800">Cadastre categorias para organizar o catálogo local.</p>
      </div>

      <form onSubmit={handleSubmit} className="mb-6 rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_180px_auto_auto]">
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Nome da categoria"
            className="rounded-xl border border-blue-100 px-4 py-2.5 text-sm font-medium text-blue-950 outline-none focus:border-blue-500"
          />
          <select
            value={active}
            onChange={(event) => setActive(Number(event.target.value))}
            className="rounded-xl border border-blue-100 px-4 py-2.5 text-sm font-medium text-blue-950 outline-none focus:border-blue-500"
          >
            <option value={1}>Ativa</option>
            <option value={0}>Inativa</option>
          </select>
          <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700">
            <Plus size={16} />
            {editingId ? "Salvar" : "Criar"}
          </button>
          {editingId && (
            <button type="button" onClick={resetForm} className="rounded-lg border border-blue-100 px-4 py-2 text-sm font-bold text-blue-700 hover:bg-blue-50">
              Cancelar
            </button>
          )}
        </div>
        {error && <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>}
        {message && <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">{message}</div>}
      </form>

      <div className="overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-blue-100 bg-blue-50">
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-blue-500">Nome</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-blue-500">Status</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-blue-500">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-blue-50">
            {categories.map((category) => (
              <tr key={category.id} className="hover:bg-blue-50/50">
                <td className="px-6 py-4 text-sm font-bold text-blue-950">{category.name}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-bold ${category.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {category.active ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                    {category.active ? "Ativa" : "Inativa"}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button type="button" onClick={() => startEdit(category)} title="Editar" className="rounded-lg p-2 text-gray-400 hover:bg-blue-50 hover:text-blue-600">
                      <NotebookPen size={18} />
                    </button>
                    <button type="button" onClick={() => void handleDelete(category.id)} title="Excluir" className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
