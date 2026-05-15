import { useState, useMemo } from "react";
import type { FormEvent } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { ProductFormState, LocalCategory } from "../types/products.types";
import { emptyForm } from "../utils/recordToForm";
import { toPayload } from "../utils/toPayload";
import { Field } from "./Field";
import { TextArea } from "./TextArea";

type Step = 1 | 2 | 3 | 4 | 5 | 6;

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: any) => Promise<void>;
  initialData?: ProductFormState;
  categories: LocalCategory[];
  isEditing: boolean;
  isSaving: boolean;
}

const fieldHints = {
  name: "Nome comercial do produto usado no PDV e nas notas fiscais.",
  sale_price: "Preço de venda do produto em reais; usado nas vendas e no cálculo de margem.",
  sku: "Código interno para identificar o produto no estoque.",
  barcode: "Código de barras utilizado por leitoras no ponto de venda.",
  category_id: "Categoria do produto para organização e relatórios.",
  unit: "Unidade de medida do produto (ex: UN, KG, PC).",
  cost_price: "Preço de custo para controlar custo e margem.",
  purchase_price: "Último preço de compra do produto.",
  minimum_stock: "Quantidade mínima desejada em estoque antes de reposição.",
  maximum_stock: "Quantidade máxima recomendada de estoque para evitar excesso.",
  current_stock: "Estoque atual do produto (apenas para produtos novos).",
  ncm: "Código NCM usado na emissão da nota fiscal.",
  cfop: "Código CFOP que identifica a natureza da operação tributária.",
  origin: "Origem do produto para tributação (ex: nacional, estrangeiro).",
  cest: "Código CEST, usado quando há substituição tributária.",
  situation: "Situação fiscal ou tributária do produto.",
  active: "Status do produto: ativo para venda ou inativo somente para histórico.",
  supplier_code: "Código do produto fornecido pelo fornecedor.",
  supplier_name: "Nome do fornecedor ou fabricante do produto.",
  supplier_product_description: "Descrição do produto conforme catálogo do fornecedor.",
  supplier_warranty_months: "Meses de garantia oferecido pelo fornecedor.",
  location: "Localização física do produto no estoque ou prateleira.",
  brand: "Marca do produto para facilitar buscas e relatórios.",
  product_group: "Grupo ou família do produto dentro do cadastro.",
  short_description: "Descrição curta exibida no PDV e em listagens.",
  department: "Departamento ou seção do produto.",
  item_type: "Tipo de item (Produto, Serviço, Insumo, etc).",
  complementary_description: "Descrição adicional para controle interno.",
  additional_info: "Informações suplementares importantes para o produto.",
  expiration_date: "Data de validade do produto, se aplicável.",
  items_per_box: "Quantidade de itens por caixa ou embalagem.",
  packaging_barcode: "Código de barras da embalagem/caixa.",
  production_type: "Tipo de produção do item.",
  ipi_tax_class: "Classificação IPI do produto.",
  fci_number: "Número FCI (Ficha de Comunicação de Importação).",
  notes: "Observações extras que ajudam o operador ou a equipe de estoque.",
  net_weight_kg: "Peso líquido em quilogramas.",
  gross_weight_kg: "Peso bruto em quilogramas.",
  width_cm: "Largura em centímetros.",
  height_cm: "Altura em centímetros.",
  depth_cm: "Profundidade/Comprimento em centímetros.",
  volumes: "Volume total ou quantidade de volumes.",
  is_variation: "Marque se este produto é uma variação de outro.",
  parent_code: "Código do produto pai, se for uma variação.",
  product_condition: "Condição do produto (novo, usado, etc).",
  tags: "Marcadores/tags para o produto separados por vírgula.",
};

export default function ProductFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  categories,
  isEditing,
  isSaving,
}: ProductFormModalProps) {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [form, setForm] = useState<ProductFormState>(initialData || emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState("");

  const title = useMemo(() => (isEditing ? "Editar produto" : "Novo produto"), [isEditing]);

  const stepTitles = {
    1: "Dados básicos",
    2: "Preços",
    3: "Estoque",
    4: "Fiscal",
    5: "Fornecedor",
    6: "Avançado",
  };

  function updateField(field: keyof ProductFormState, value: string | number) {
    setForm((current) => ({ ...current, [field]: value }));
    // Limpar erro do campo ao editar
    if (errors[field]) {
      setErrors((current) => {
        const newErrors = { ...current };
        delete newErrors[field];
        return newErrors;
      });
    }
  }

  function validateStep(step: Step): boolean {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!form.name.trim()) newErrors.name = "Nome é obrigatório";
      if (!form.unit.trim()) newErrors.unit = "Unidade é obrigatória";
    }

    if (step === 2) {
      const salePrice = Number(form.sale_price) || 0;
      if (salePrice <= 0) newErrors.sale_price = "Preço de venda deve ser maior que zero";
      
      if (form.cost_price) {
        const costPrice = Number(form.cost_price) || 0;
        if (costPrice < 0) newErrors.cost_price = "Preço de custo não pode ser negativo";
      }
      
      if (form.purchase_price) {
        const purchasePrice = Number(form.purchase_price) || 0;
        if (purchasePrice < 0) newErrors.purchase_price = "Preço de compra não pode ser negativo";
      }
    }

    if (step === 3) {
      const minStock = Number(form.minimum_stock) || 0;
      const maxStock = form.maximum_stock ? Number(form.maximum_stock) : null;
      
      if (minStock < 0) newErrors.minimum_stock = "Estoque mínimo não pode ser negativo";
      if (maxStock !== null && maxStock < 0) newErrors.maximum_stock = "Estoque máximo não pode ser negativo";
      if (maxStock !== null && minStock > maxStock) newErrors.maximum_stock = "Estoque máximo deve ser maior ou igual ao mínimo";
    }

    if (step === 5) {
      if (form.supplier_warranty_months) {
        const warranty = Number(form.supplier_warranty_months);
        if (warranty < 0 || !Number.isInteger(warranty)) {
          newErrors.supplier_warranty_months = "Meses de garantia deve ser um número inteiro não negativo";
        }
      }
    }

    if (step === 6) {
      if (form.net_weight_kg && Number(form.net_weight_kg) < 0) {
        newErrors.net_weight_kg = "Peso não pode ser negativo";
      }
      if (form.gross_weight_kg && Number(form.gross_weight_kg) < 0) {
        newErrors.gross_weight_kg = "Peso não pode ser negativo";
      }
      if (form.width_cm && Number(form.width_cm) < 0) newErrors.width_cm = "Largura não pode ser negativa";
      if (form.height_cm && Number(form.height_cm) < 0) newErrors.height_cm = "Altura não pode ser negativa";
      if (form.depth_cm && Number(form.depth_cm) < 0) newErrors.depth_cm = "Profundidade não pode ser negativa";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function nextStep() {
    if (validateStep(currentStep)) {
      if (currentStep < 6) {
        setCurrentStep((currentStep + 1) as Step);
        setGlobalError("");
      }
    }
  }

  function prevStep() {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as Step);
      setGlobalError("");
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setGlobalError("");

    if (!validateStep(currentStep)) {
      return;
    }

    try {
      const payload = toPayload(form);
      await onSubmit(payload);
    } catch (err) {
      setGlobalError(err instanceof Error ? err.message : "Erro ao salvar produto");
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-blue-950/40 px-4 py-6 sm:px-6 sm:py-8">
      <form
        onSubmit={handleSubmit}
        className="max-h-[90vh] w-full max-w-[1200px] min-w-[min(100%,48rem)] overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="flex flex-col gap-3 border-b border-blue-100 bg-gradient-to-r from-blue-50 to-white p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-black text-blue-950">{title}</h2>
            <p className="text-sm font-medium text-blue-700">
              Etapa {currentStep} de 6: {stepTitles[currentStep]}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-blue-500 hover:bg-blue-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="flex flex-wrap gap-2 border-b border-blue-100 bg-white px-6 py-4">
          {(
            [1, 2, 3, 4, 5, 6] as Step[]
          ).map((step) => (
            <button
              key={step}
              type="button"
              onClick={() => {
                if (validateStep(currentStep)) setCurrentStep(step);
              }}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-full font-semibold text-sm transition-all ${
                step === currentStep
                  ? "bg-blue-600 text-white"
                  : step < currentStep
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-200 text-gray-600 hover:bg-gray-300"
              }`}
            >
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/30 text-xs font-bold">
                {step}
              </span>
              <span className="text-xs md:text-sm">{stepTitles[step]}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {globalError && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {globalError}
            </div>
          )}

          {/* Step 1: Dados Básicos */}
          {currentStep === 1 && (
            <StepBasicData
              form={form}
              updateField={updateField}
              categories={categories}
              errors={errors}
              fieldHints={fieldHints}
            />
          )}

          {/* Step 2: Preços */}
          {currentStep === 2 && (
            <StepPrices form={form} updateField={updateField} errors={errors} fieldHints={fieldHints} />
          )}

          {/* Step 3: Estoque */}
          {currentStep === 3 && (
            <StepStock form={form} updateField={updateField} errors={errors} fieldHints={fieldHints} isEditing={isEditing} />
          )}

          {/* Step 4: Fiscal */}
          {currentStep === 4 && (
            <StepFiscal form={form} updateField={updateField} errors={errors} fieldHints={fieldHints} />
          )}

          {/* Step 5: Fornecedor */}
          {currentStep === 5 && (
            <StepSupplier form={form} updateField={updateField} errors={errors} fieldHints={fieldHints} />
          )}

          {/* Step 6: Avançado */}
          {currentStep === 6 && (
            <StepAdvanced form={form} updateField={updateField} errors={errors} fieldHints={fieldHints} />
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between border-t border-blue-100 bg-white px-6 py-4 gap-3">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="inline-flex items-center gap-2 rounded-lg border border-blue-100 px-4 py-2 text-sm font-bold text-blue-700 hover:bg-blue-50 disabled:opacity-50"
            >
              <ChevronLeft size={16} />
              Voltar
            </button>
            <button
              type="button"
              onClick={nextStep}
              disabled={currentStep === 6}
              className="inline-flex items-center gap-2 rounded-lg border border-blue-100 px-4 py-2 text-sm font-bold text-blue-700 hover:bg-blue-50 disabled:opacity-50"
            >
              Próximo
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-blue-100 px-4 py-2 text-sm font-bold text-blue-700 hover:bg-blue-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isSaving ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

// Step Components
interface StepProps {
  form: ProductFormState;
  updateField: (field: keyof ProductFormState, value: string | number) => void;
  errors: Record<string, string>;
  fieldHints: Record<string, string>;
  categories?: any[];
  isEditing?: boolean;
}

function StepBasicData({ form, updateField, errors, fieldHints, categories }: StepProps & { categories: any[] }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field
          label="Nome *"
          value={form.name}
          onChange={(v) => updateField("name", v)}
          hint={fieldHints.name}
          className={errors.name ? "border-red-400" : ""}
        />
        <Field
          label="Unidade *"
          value={form.unit}
          onChange={(v) => updateField("unit", v)}
          hint={fieldHints.unit}
          className={errors.unit ? "border-red-400" : ""}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Field
          label="SKU"
          value={form.sku}
          onChange={(v) => updateField("sku", v)}
          hint={fieldHints.sku}
        />
        <Field
          label="Código de barras"
          value={form.barcode}
          onChange={(v) => updateField("barcode", v)}
          hint={fieldHints.barcode}
        />
        <div className="group flex flex-col gap-1">
          <label className="flex items-center gap-2 text-sm font-bold text-blue-900">
            <span>Categoria</span>
            <span className="relative inline-flex h-5 w-5 cursor-help items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-blue-700">
              ?
              <span className="pointer-events-none absolute left-1/2 top-full z-20 hidden w-64 -translate-x-1/2 rounded-2xl border border-blue-100 bg-white p-3 text-xs font-normal text-blue-900 shadow-lg group-hover:block">
                {fieldHints.category_id}
              </span>
            </span>
          </label>
          <select
            value={form.category_id}
            onChange={(e) => updateField("category_id", e.target.value)}
            className="rounded-lg border border-blue-100 px-3 py-2 font-medium outline-none focus:border-blue-500"
          >
            <option value="">Sem categoria</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Field
          label="Marca"
          value={form.brand}
          onChange={(v) => updateField("brand", v)}
          hint={fieldHints.brand}
        />
        <Field
          label="Departamento"
          value={form.department}
          onChange={(v) => updateField("department", v)}
          hint={fieldHints.department}
        />
        <div className="group flex flex-col gap-1">
          <label className="flex items-center gap-2 text-sm font-bold text-blue-900">
            <span>Tipo de item</span>
            <span className="relative inline-flex h-5 w-5 cursor-help items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-blue-700">
              ?
              <span className="pointer-events-none absolute left-1/2 top-full z-20 hidden w-64 -translate-x-1/2 rounded-2xl border border-blue-100 bg-white p-3 text-xs font-normal text-blue-900 shadow-lg group-hover:block">
                {fieldHints.item_type}
              </span>
            </span>
          </label>
          <select
            value={form.item_type}
            onChange={(e) => updateField("item_type", e.target.value)}
            className="rounded-lg border border-blue-100 px-3 py-2 font-medium outline-none focus:border-blue-500"
          >
            <option value="Produto">Produto</option>
            <option value="Serviço">Serviço</option>
            <option value="Insumo">Insumo</option>
            <option value="Composição">Composição</option>
            <option value="Outro">Outro</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field
          label="Grupo"
          value={form.product_group}
          onChange={(v) => updateField("product_group", v)}
          hint={fieldHints.product_group}
        />
        <div className="flex items-end">
          <label className="flex items-center gap-2 text-sm font-bold text-blue-900">
            <input
              type="checkbox"
              checked={form.active === 1}
              onChange={(e) => updateField("active", e.target.checked ? 1 : 0)}
              className="rounded border-blue-100"
            />
            Ativo
          </label>
        </div>
      </div>

      <Field
        label="Descrição curta"
        value={form.short_description}
        onChange={(v) => updateField("short_description", v)}
        hint={fieldHints.short_description}
      />

      {errors.name && <div className="text-sm text-red-600">{errors.name}</div>}
      {errors.unit && <div className="text-sm text-red-600">{errors.unit}</div>}
    </div>
  );
}

function StepPrices({ form, updateField, errors, fieldHints }: StepProps) {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
        <p className="text-sm font-medium text-blue-700">
          Preencha os preços do produto. O preço de venda é obrigatório.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Field
          label="Preço de venda *"
          value={form.sale_price}
          onChange={(v) => updateField("sale_price", v)}
          placeholder="0,00"
          hint={fieldHints.sale_price}
          className={errors.sale_price ? "border-red-400" : ""}
        />
        <Field
          label="Preço de custo"
          value={form.cost_price}
          onChange={(v) => updateField("cost_price", v)}
          placeholder="0,00"
          hint={fieldHints.cost_price}
          className={errors.cost_price ? "border-red-400" : ""}
        />
        <Field
          label="Preço de compra"
          value={form.purchase_price}
          onChange={(v) => updateField("purchase_price", v)}
          placeholder="0,00"
          hint={fieldHints.purchase_price}
          className={errors.purchase_price ? "border-red-400" : ""}
        />
      </div>

      {errors.sale_price && <div className="text-sm text-red-600">{errors.sale_price}</div>}
      {errors.cost_price && <div className="text-sm text-red-600">{errors.cost_price}</div>}
      {errors.purchase_price && <div className="text-sm text-red-600">{errors.purchase_price}</div>}
    </div>
  );
}

function StepStock({ form, updateField, errors, fieldHints, isEditing }: StepProps & { isEditing?: boolean }) {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-yellow-100 bg-yellow-50 p-4">
        <p className="text-sm font-medium text-yellow-700">
          Esta etapa define apenas os parâmetros iniciais de estoque. Movimentações são registradas no módulo de estoque.
        </p>
      </div>

      {!isEditing && (
        <Field
          label="Estoque atual"
          value={form.current_stock}
          onChange={(v) => updateField("current_stock", v)}
          type="number"
          hint={fieldHints.current_stock}
        />
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Field
          label="Estoque mínimo"
          value={form.minimum_stock}
          onChange={(v) => updateField("minimum_stock", v)}
          type="number"
          hint={fieldHints.minimum_stock}
          className={errors.minimum_stock ? "border-red-400" : ""}
        />
        <Field
          label="Estoque máximo"
          value={form.maximum_stock}
          onChange={(v) => updateField("maximum_stock", v)}
          type="number"
          hint={fieldHints.maximum_stock}
          className={errors.maximum_stock ? "border-red-400" : ""}
        />
        <Field
          label="Itens por caixa"
          value={form.items_per_box}
          onChange={(v) => updateField("items_per_box", v)}
          type="number"
          hint={fieldHints.items_per_box}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field
          label="Localização"
          value={form.location}
          onChange={(v) => updateField("location", v)}
          hint={fieldHints.location}
        />
        <Field
          label="Data de validade"
          value={form.expiration_date}
          onChange={(v) => updateField("expiration_date", v)}
          type="date"
          hint={fieldHints.expiration_date}
        />
      </div>

      <Field
        label="Código de barras da embalagem"
        value={form.packaging_barcode}
        onChange={(v) => updateField("packaging_barcode", v)}
        hint={fieldHints.packaging_barcode}
      />

      {errors.minimum_stock && <div className="text-sm text-red-600">{errors.minimum_stock}</div>}
      {errors.maximum_stock && <div className="text-sm text-red-600">{errors.maximum_stock}</div>}
    </div>
  );
}

function StepFiscal({ form, updateField, errors, fieldHints }: StepProps) {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
        <p className="text-sm font-medium text-blue-700">
          Dados fiscais para emissão de notas fiscais e conformidade tributária.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Field
          label="NCM"
          value={form.ncm}
          onChange={(v) => updateField("ncm", v)}
          hint={fieldHints.ncm}
          placeholder="Ex: 12345678"
        />
        <Field
          label="CFOP"
          value={form.cfop}
          onChange={(v) => updateField("cfop", v)}
          hint={fieldHints.cfop}
          placeholder="Ex: 5102"
        />
        <Field
          label="CEST"
          value={form.cest}
          onChange={(v) => updateField("cest", v)}
          hint={fieldHints.cest}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="group flex flex-col gap-1">
          <label className="flex items-center gap-2 text-sm font-bold text-blue-900">
            <span>Origem</span>
            <span className="relative inline-flex h-5 w-5 cursor-help items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-blue-700">
              ?
              <span className="pointer-events-none absolute left-1/2 top-full z-20 hidden w-64 -translate-x-1/2 rounded-2xl border border-blue-100 bg-white p-3 text-xs font-normal text-blue-900 shadow-lg group-hover:block">
                {fieldHints.origin}
              </span>
            </span>
          </label>
          <select
            value={form.origin}
            onChange={(e) => updateField("origin", e.target.value)}
            className="rounded-lg border border-blue-100 px-3 py-2 font-medium outline-none focus:border-blue-500"
          >
            <option value="">Selecione a origem</option>
            <option value="0">Nacional</option>
            <option value="1">Estrangeira</option>
            <option value="2">Estrangeira - Importação direta</option>
            <option value="3">Estrangeira - Adquirida no mercado interno</option>
          </select>
        </div>
        <Field
          label="Situação"
          value={form.situation}
          onChange={(v) => updateField("situation", v)}
          hint={fieldHints.situation}
        />
      </div>

      <TextArea
        label="Descrição complementar"
        value={form.complementary_description}
        onChange={(v) => updateField("complementary_description", v)}
        hint={fieldHints.complementary_description}
      />

      <TextArea
        label="Informações adicionais"
        value={form.additional_info}
        onChange={(v) => updateField("additional_info", v)}
        hint={fieldHints.additional_info}
      />

      {/* Advanced Fiscal Section */}
      <details className="border-t border-blue-100 pt-4">
        <summary className="cursor-pointer text-sm font-bold text-blue-700 hover:text-blue-900">
          ⚙️ Avançado fiscal
        </summary>
        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Field
              label="Tipo de produção"
              value={form.production_type}
              onChange={(v) => updateField("production_type", v)}
              hint={fieldHints.production_type}
            />
            <Field
              label="Classe IPI"
              value={form.ipi_tax_class}
              onChange={(v) => updateField("ipi_tax_class", v)}
              hint={fieldHints.ipi_tax_class}
            />
            <Field
              label="Número FCI"
              value={form.fci_number}
              onChange={(v) => updateField("fci_number", v)}
              hint={fieldHints.fci_number}
            />
          </div>
        </div>
      </details>
    </div>
  );
}

function StepSupplier({ form, updateField, errors, fieldHints }: StepProps) {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
        <p className="text-sm font-medium text-blue-700">
          Informações do fornecedor e do produto conforme catálogo externo.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field
          label="Nome fornecedor"
          value={form.supplier_name}
          onChange={(v) => updateField("supplier_name", v)}
          hint={fieldHints.supplier_name}
        />
        <Field
          label="Código fornecedor"
          value={form.supplier_code}
          onChange={(v) => updateField("supplier_code", v)}
          hint={fieldHints.supplier_code}
        />
      </div>

      <TextArea
        label="Descrição do produto (fornecedor)"
        value={form.supplier_product_description}
        onChange={(v) => updateField("supplier_product_description", v)}
        hint={fieldHints.supplier_product_description}
      />

      <Field
        label="Meses de garantia"
        value={form.supplier_warranty_months}
        onChange={(v) => updateField("supplier_warranty_months", v)}
        type="number"
        hint={fieldHints.supplier_warranty_months}
        className={errors.supplier_warranty_months ? "border-red-400" : ""}
      />

      {errors.supplier_warranty_months && (
        <div className="text-sm text-red-600">{errors.supplier_warranty_months}</div>
      )}
    </div>
  );
}

function StepAdvanced({ form, updateField, errors, fieldHints }: StepProps) {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
        <p className="text-sm font-medium text-blue-700">
          Campos avançados para controle detalhado do produto. Todos são opcionais.
        </p>
      </div>

      {/* Dimensions and Weight */}
      <div>
        <h3 className="mb-3 font-bold text-blue-900">Dimensões e peso</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Field
            label="Largura (cm)"
            value={form.width_cm}
            onChange={(v) => updateField("width_cm", v)}
            type="number"
            step="0.01"
            hint={fieldHints.width_cm}
            className={errors.width_cm ? "border-red-400" : ""}
          />
          <Field
            label="Altura (cm)"
            value={form.height_cm}
            onChange={(v) => updateField("height_cm", v)}
            type="number"
            step="0.01"
            hint={fieldHints.height_cm}
            className={errors.height_cm ? "border-red-400" : ""}
          />
          <Field
            label="Profundidade (cm)"
            value={form.depth_cm}
            onChange={(v) => updateField("depth_cm", v)}
            type="number"
            step="0.01"
            hint={fieldHints.depth_cm}
            className={errors.depth_cm ? "border-red-400" : ""}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Field
          label="Peso líquido (kg)"
          value={form.net_weight_kg}
          onChange={(v) => updateField("net_weight_kg", v)}
          type="number"
          step="0.01"
          hint={fieldHints.net_weight_kg}
          className={errors.net_weight_kg ? "border-red-400" : ""}
        />
        <Field
          label="Peso bruto (kg)"
          value={form.gross_weight_kg}
          onChange={(v) => updateField("gross_weight_kg", v)}
          type="number"
          step="0.01"
          hint={fieldHints.gross_weight_kg}
          className={errors.gross_weight_kg ? "border-red-400" : ""}
        />
        <Field
          label="Volumes"
          value={form.volumes}
          onChange={(v) => updateField("volumes", v)}
          type="number"
          hint={fieldHints.volumes}
        />
      </div>

      {/* Variation */}
      <div>
        <h3 className="mb-3 font-bold text-blue-900">Variações</h3>
        <div className="space-y-4">
          <label className="flex items-center gap-2 text-sm font-bold text-blue-900">
            <input
              type="checkbox"
              checked={form.is_variation === 1}
              onChange={(e) => updateField("is_variation", e.target.checked ? 1 : 0)}
              className="rounded border-blue-100"
            />
            Este produto é uma variação
          </label>

          {form.is_variation === 1 && (
            <Field
              label="Código produto pai"
              value={form.parent_code}
              onChange={(v) => updateField("parent_code", v)}
              hint={fieldHints.parent_code}
            />
          )}
        </div>
      </div>

      {/* Other */}
      <div>
        <h3 className="mb-3 font-bold text-blue-900">Outros</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="group flex flex-col gap-1">
            <label className="flex items-center gap-2 text-sm font-bold text-blue-900">
              <span>Condição</span>
              <span className="relative inline-flex h-5 w-5 cursor-help items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-blue-700">
                ?
                <span className="pointer-events-none absolute left-1/2 top-full z-20 hidden w-64 -translate-x-1/2 rounded-2xl border border-blue-100 bg-white p-3 text-xs font-normal text-blue-900 shadow-lg group-hover:block">
                  {fieldHints.product_condition}
                </span>
              </span>
            </label>
            <select
              value={form.product_condition}
              onChange={(e) => updateField("product_condition", e.target.value)}
              className="rounded-lg border border-blue-100 px-3 py-2 font-medium outline-none focus:border-blue-500"
            >
              <option value="">Selecione</option>
              <option value="novo">Novo</option>
              <option value="usado">Usado</option>
              <option value="recondicionado">Recondicionado</option>
            </select>
          </div>

          <Field
            label="Tags"
            value={form.tags}
            onChange={(v) => updateField("tags", v)}
            placeholder="Ex: promocão, estoque-baixo"
            hint={fieldHints.tags}
          />
        </div>
      </div>

      <TextArea
        label="Observações"
        value={form.notes}
        onChange={(v) => updateField("notes", v)}
        hint={fieldHints.notes}
      />

      {errors.width_cm && <div className="text-sm text-red-600">{errors.width_cm}</div>}
      {errors.height_cm && <div className="text-sm text-red-600">{errors.height_cm}</div>}
      {errors.depth_cm && <div className="text-sm text-red-600">{errors.depth_cm}</div>}
      {errors.net_weight_kg && <div className="text-sm text-red-600">{errors.net_weight_kg}</div>}
      {errors.gross_weight_kg && <div className="text-sm text-red-600">{errors.gross_weight_kg}</div>}
    </div>
  );
}
