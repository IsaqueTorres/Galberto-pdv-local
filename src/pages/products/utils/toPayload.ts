import type { ProductFormState } from "../types/products.types";
import type { LocalProductPayload } from "../types/products.types";
import { centsFromMoney } from "./centsFromMoney";

export function toPayload(form: ProductFormState): LocalProductPayload {
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