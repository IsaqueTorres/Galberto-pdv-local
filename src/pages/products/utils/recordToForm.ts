import type { ProductRecord, ProductFormState } from "../types/products.types";
import { moneyInput } from "./moneyInput";


export const emptyForm: ProductFormState = {
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


export function recordToForm(product: ProductRecord): ProductFormState {
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