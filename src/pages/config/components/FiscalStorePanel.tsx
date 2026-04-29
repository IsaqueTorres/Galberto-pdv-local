import { useEffect, useState } from 'react';
import { AlertTriangle, Building2, MapPin, Pencil, Save } from 'lucide-react';
import { fiscalConfigService } from '../services/fiscal-config.service';
import type { FiscalEnvironment, FiscalStoreInput, FiscalStoreRecord, TaxRegimeCode } from '../types/fiscal-config.types';

const emptyStoreForm: FiscalStoreInput = {
  code: 'MAIN',
  name: '',
  legalName: '',
  cnpj: '',
  stateRegistration: '',
  taxRegimeCode: '1',
  environment: 'homologation',
  cscId: '',
  cscToken: '',
  defaultSeries: 1,
  nextNfceNumber: 1,
  addressStreet: '',
  addressNumber: '',
  addressNeighborhood: '',
  addressCity: '',
  addressState: 'SP',
  addressZipCode: '',
  addressCityIbgeCode: '',
};

type FiscalStorePanelProps = {
  onStoreReady?: (store: FiscalStoreRecord) => void;
};

export function FiscalStorePanel({ onStoreReady }: FiscalStorePanelProps) {
  const [store, setStore] = useState<FiscalStoreRecord | null>(null);
  const [form, setForm] = useState<FiscalStoreInput>(emptyStoreForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const activeStore = await fiscalConfigService.getActiveStore();
      setStore(activeStore);
      if (activeStore) {
        setForm(mapStoreToInput(activeStore));
        onStoreReady?.(activeStore);
      } else {
        setForm(emptyStoreForm);
        setShowForm(true);
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Erro ao carregar estabelecimento fiscal.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function updateField<K extends keyof FiscalStoreInput>(field: K, value: FiscalStoreInput[K]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const saved = await fiscalConfigService.saveActiveStore(form);
      setStore(saved);
      setForm(mapStoreToInput(saved));
      setShowForm(false);
      onStoreReady?.(saved);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Erro ao salvar estabelecimento fiscal.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-slate-500">Estabelecimento fiscal</p>
          <h2 className="mt-1 text-xl font-black text-slate-950">
            {store ? store.legalName : 'Cadastre a Store para emitir NFC-e'}
          </h2>
          <p className="mt-1 text-sm font-medium text-slate-600">
            Fonte oficial dos dados do emitente: tabela stores.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-800 transition hover:bg-slate-50"
        >
          <Pencil size={16} />
          {store ? 'Alterar Store' : 'Cadastrar Store'}
        </button>
      </div>

      {error && (
        <div className="mt-4 rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          {error}
        </div>
      )}

      {!loading && !store && (
        <div className="mt-4 flex gap-3 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
          <AlertTriangle className="mt-0.5 shrink-0" size={18} />
          <span>Nenhuma Store fiscal ativa encontrada. Cadastre o emitente antes de configurar certificado, CSC e SEFAZ.</span>
        </div>
      )}

      {store && (
        <div className="mt-5 grid gap-3 md:grid-cols-4">
          <StoreTile icon={Building2} label="CNPJ" value={formatCnpj(store.cnpj)} />
          <StoreTile label="IE" value={store.stateRegistration} />
          <StoreTile label="CRT" value={crtLabel(store.taxRegimeCode)} />
          <StoreTile label="Ambiente" value={store.environment === 'production' ? 'Producao' : 'Homologacao'} tone={store.environment === 'production' ? 'rose' : 'emerald'} />
          <StoreTile icon={MapPin} label="Municipio" value={`${store.addressCity}/${store.addressState}`} />
          <StoreTile label="IBGE" value={store.addressCityIbgeCode} />
          <StoreTile label="Serie NFC-e" value={String(store.defaultSeries)} />
          <StoreTile label="Proximo numero" value={String(store.nextNfceNumber)} />
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4">
          <div className="max-h-[92vh] w-full max-w-5xl overflow-auto rounded-lg bg-white shadow-2xl">
            <div className="sticky top-0 z-10 border-b border-slate-200 bg-white px-5 py-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-black text-slate-950">{store ? 'Alterar Store fiscal' : 'Cadastrar Store fiscal'}</h3>
                  <p className="mt-1 text-sm font-medium text-slate-600">Esses dados entram no XML como emitente da NFC-e.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-bold text-slate-700 hover:bg-slate-50"
                >
                  Fechar
                </button>
              </div>
              <div className="mt-4 flex gap-3 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
                <AlertTriangle className="mt-0.5 shrink-0" size={18} />
                <span>Alterar emitente, ambiente, serie ou proximo numero pode causar rejeicoes fiscais e interrupcao nas vendas. Confira com o contador antes de salvar.</span>
              </div>
            </div>

            <div className="space-y-5 p-5">
              <div>
                <p className="mb-3 text-xs font-black uppercase tracking-wide text-slate-500">Identificacao</p>
                <div className="grid gap-4 md:grid-cols-3">
                  <InputCard label="Codigo" value={form.code} onChange={(value) => updateField('code', value)} />
                  <InputCard label="Nome fantasia" value={form.name} onChange={(value) => updateField('name', value)} />
                  <InputCard label="Razao social" value={form.legalName} onChange={(value) => updateField('legalName', value)} />
                  <InputCard label="CNPJ" value={form.cnpj} placeholder="00.000.000/0000-00" onChange={(value) => updateField('cnpj', value)} />
                  <InputCard label="Inscricao estadual" value={form.stateRegistration} onChange={(value) => updateField('stateRegistration', value)} />
                  <SelectCard
                    label="CRT"
                    value={form.taxRegimeCode}
                    onChange={(value) => updateField('taxRegimeCode', value as TaxRegimeCode)}
                    options={[
                      { value: '1', label: '1 - Simples Nacional' },
                      { value: '2', label: '2 - Simples Nacional - excesso de sublimite' },
                      { value: '3', label: '3 - Regime Normal' },
                      { value: '4', label: '4 - Simples Nacional - MEI' },
                    ]}
                  />
                </div>
              </div>

              <div>
                <p className="mb-3 text-xs font-black uppercase tracking-wide text-slate-500">Endereco fiscal</p>
                <div className="grid gap-4 md:grid-cols-3">
                  <InputCard label="Logradouro" value={form.addressStreet} onChange={(value) => updateField('addressStreet', value)} />
                  <InputCard label="Numero" value={form.addressNumber} onChange={(value) => updateField('addressNumber', value)} />
                  <InputCard label="Bairro" value={form.addressNeighborhood} onChange={(value) => updateField('addressNeighborhood', value)} />
                  <InputCard label="Cidade" value={form.addressCity} onChange={(value) => updateField('addressCity', value)} />
                  <InputCard label="UF" value={form.addressState} onChange={(value) => updateField('addressState', value.toUpperCase())} />
                  <InputCard label="CEP" value={form.addressZipCode} onChange={(value) => updateField('addressZipCode', value)} />
                  <InputCard label="Codigo IBGE municipio" value={form.addressCityIbgeCode} onChange={(value) => updateField('addressCityIbgeCode', value)} />
                </div>
              </div>

              <div>
                <p className="mb-3 text-xs font-black uppercase tracking-wide text-slate-500">NFC-e</p>
                <div className="grid gap-4 md:grid-cols-3">
                  <SelectCard
                    label="Ambiente"
                    value={form.environment}
                    onChange={(value) => updateField('environment', value as FiscalEnvironment)}
                    options={[
                      { value: 'homologation', label: 'Homologacao' },
                      { value: 'production', label: 'Producao' },
                    ]}
                  />
                  <InputCard label="CSC ID" value={form.cscId ?? ''} onChange={(value) => updateField('cscId', value)} />
                  <InputCard label="CSC Token" type="password" value={form.cscToken ?? ''} onChange={(value) => updateField('cscToken', value)} />
                  <InputCard label="Serie padrao" type="number" value={String(form.defaultSeries)} onChange={(value) => updateField('defaultSeries', Number(value || 1))} />
                  <InputCard label="Proximo numero NFC-e" type="number" value={String(form.nextNfceNumber)} onChange={(value) => updateField('nextNfceNumber', Number(value || 1))} />
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-md border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-slate-950 px-4 py-2 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Save size={16} />
                  {saving ? 'Salvando...' : 'Salvar Store'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function mapStoreToInput(store: FiscalStoreRecord): FiscalStoreInput {
  return {
    id: store.id,
    code: store.code,
    name: store.name,
    legalName: store.legalName,
    cnpj: store.cnpj,
    stateRegistration: store.stateRegistration,
    taxRegimeCode: store.taxRegimeCode,
    environment: store.environment,
    cscId: store.cscId ?? '',
    cscToken: '',
    defaultSeries: store.defaultSeries,
    nextNfceNumber: store.nextNfceNumber,
    addressStreet: store.addressStreet,
    addressNumber: store.addressNumber,
    addressNeighborhood: store.addressNeighborhood,
    addressCity: store.addressCity,
    addressState: store.addressState,
    addressZipCode: store.addressZipCode,
    addressCityIbgeCode: store.addressCityIbgeCode,
  };
}

function formatCnpj(value: string) {
  const digits = value.replace(/\D/g, '');
  return digits.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
}

function crtLabel(value: string) {
  const labels: Record<string, string> = {
    '1': 'Simples Nacional',
    '2': 'Simples Nacional - excesso de sublimite',
    '3': 'Regime Normal',
    '4': 'Simples Nacional - MEI',
  };
  return labels[value] ?? value;
}

type Option = { value: string; label: string };

function InputCard({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  label: string;
  value: string | number | null | undefined;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-black uppercase tracking-wide text-slate-500">{label}</span>
      <input
        type={type}
        value={value ?? ''}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-950 outline-none transition focus:border-slate-700 focus:bg-white"
      />
    </label>
  );
}

function SelectCard({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-black uppercase tracking-wide text-slate-500">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-950 outline-none transition focus:border-slate-700 focus:bg-white"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function StoreTile({
  icon: Icon,
  label,
  value,
  tone = 'slate',
}: {
  icon?: typeof Building2;
  label: string;
  value: string;
  tone?: 'slate' | 'emerald' | 'rose';
}) {
  const toneClass = {
    slate: 'border-slate-200 bg-slate-50 text-slate-950',
    emerald: 'border-emerald-200 bg-emerald-50 text-emerald-950',
    rose: 'border-rose-200 bg-rose-50 text-rose-950',
  }[tone];

  return (
    <div className={`rounded-md border px-4 py-3 ${toneClass}`}>
      <div className="flex items-center gap-2">
        {Icon && <Icon size={15} />}
        <p className="text-[11px] font-black uppercase tracking-wide opacity-60">{label}</p>
      </div>
      <p className="mt-1 truncate text-sm font-black">{value || '-'}</p>
    </div>
  );
}
