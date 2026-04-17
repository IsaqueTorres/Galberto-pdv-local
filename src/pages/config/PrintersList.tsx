import { useEffect, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { CheckCircle, Printer, Star, Trash2 } from "lucide-react";
import {
  atualizarLayoutPrinter,
  atualizarPersonalizacaoPrinter,
  definirPrinterPadrao,
  listarPrintersCadastradas,
  removerPrinter,
  testPrint,
} from "../../services/printers";

type PrinterCadastrada = {
  id: number;
  name: string;
  display_name: string;
  brand: string;
  model: string;
  connection_type: string;
  driver_name: string;
  driver_version: string;
  photo_path: string;
  notes: string;
  is_default: number;
  installed_at: string;
  paper_width_mm: number;
  content_width_mm: number;
  base_font_size_px: number;
  line_height: number;
  receipt_settings_json?: string | null;
};

type ReceiptCustomizationMode = "default" | "custom";

type ReceiptCustomizationForm = {
  templateMode: ReceiptCustomizationMode;
  headerTitle: string;
  headerMessage: string;
  footerMessage: string;
  thankYouMessage: string;
  logoPath: string;
  showLogo: boolean;
  showLegalName: boolean;
  showDocument: boolean;
  showAddress: boolean;
  showOperator: boolean;
  showCustomer: boolean;
  showItemCodes: boolean;
  showPaymentBreakdown: boolean;
  showFiscalSection: boolean;
};

const DEFAULT_PAPER_WIDTH_MM = 80;
const DEFAULT_CONTENT_WIDTH_MM = 76;
const DEFAULT_FONT_SIZE_PX = 14;
const DEFAULT_LINE_HEIGHT = 1.55;

const defaultCustomization: ReceiptCustomizationForm = {
  templateMode: "default",
  headerTitle: "",
  headerMessage: "",
  footerMessage: "",
  thankYouMessage: "Documento impresso pelo Galberto PDV",
  logoPath: "",
  showLogo: false,
  showLegalName: true,
  showDocument: true,
  showAddress: true,
  showOperator: true,
  showCustomer: true,
  showItemCodes: true,
  showPaymentBreakdown: true,
  showFiscalSection: true,
};

function parseReceiptSettings(printer: PrinterCadastrada): ReceiptCustomizationForm {
  try {
    const parsed = printer.receipt_settings_json ? JSON.parse(printer.receipt_settings_json) : {};
    return {
      ...defaultCustomization,
      ...parsed,
      templateMode: parsed?.templateMode === "custom" ? "custom" : "default",
    };
  } catch {
    return defaultCustomization;
  }
}

type PrinterCardProps = {
  printer: PrinterCadastrada;
  isDefault: boolean;
  editingPrinterId: number | null;
  customizationOpenId: number | null;
  paperWidthMm: number;
  contentWidthMm: number;
  baseFontSizePx: number;
  lineHeight: number;
  customization: ReceiptCustomizationForm;
  inputClassName: string;
  helperClassName: string;
  onDefineDefault: (id: number) => Promise<void>;
  onRemove: (id: number, name: string) => Promise<void>;
  onStartLayoutEdit: (printer: PrinterCadastrada) => void;
  onStartCustomizationEdit: (printer: PrinterCadastrada) => void;
  onSaveLayout: (id: number) => Promise<void>;
  onSaveCustomization: (id: number) => Promise<void>;
  onTestPrint: (id: number) => Promise<void>;
  onCancelLayout: () => void;
  onCancelCustomization: () => void;
  setPaperWidthMm: (value: number) => void;
  setContentWidthMm: (value: number) => void;
  setBaseFontSizePx: (value: number) => void;
  setLineHeight: (value: number) => void;
  setCustomization: Dispatch<SetStateAction<ReceiptCustomizationForm>>;
};

function LayoutEditor({
  paperWidthMm,
  contentWidthMm,
  baseFontSizePx,
  lineHeight,
  inputClassName,
  helperClassName,
  onCancel,
  onSave,
  setPaperWidthMm,
  setContentWidthMm,
  setBaseFontSizePx,
  setLineHeight,
}: {
  paperWidthMm: number;
  contentWidthMm: number;
  baseFontSizePx: number;
  lineHeight: number;
  inputClassName: string;
  helperClassName: string;
  onCancel: () => void;
  onSave: () => void;
  setPaperWidthMm: (value: number) => void;
  setContentWidthMm: (value: number) => void;
  setBaseFontSizePx: (value: number) => void;
  setLineHeight: (value: number) => void;
}) {
  const safePaperWidth = Number.isFinite(paperWidthMm) ? paperWidthMm : DEFAULT_PAPER_WIDTH_MM;
  const safeContentWidth = Number.isFinite(contentWidthMm) ? contentWidthMm : DEFAULT_CONTENT_WIDTH_MM;
  const safeBaseFontSizePx = Number.isFinite(baseFontSizePx) ? baseFontSizePx : DEFAULT_FONT_SIZE_PX;
  const safeLineHeight = Number.isFinite(lineHeight) ? lineHeight : DEFAULT_LINE_HEIGHT;
  const sideMargins = Math.max((safePaperWidth - safeContentWidth) / 2, 0);

  return (
    <div className="mt-4 rounded-2xl border border-blue-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-zinc-900">Layout do cupom</h3>
        <p className="mt-1 text-sm text-zinc-500">
          Ajuste papel, área útil, fonte e espaçamento. Se a impressão estiver saindo pequena, aumente primeiro a
          fonte base e depois o espaçamento.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div>
          <label className="mb-2 block text-sm font-semibold text-zinc-800">Largura do papel</label>
          <input
            type="number"
            min="58"
            max="80"
            step="1"
            value={paperWidthMm}
            onChange={(e) => setPaperWidthMm(Number(e.target.value || DEFAULT_PAPER_WIDTH_MM))}
            className={inputClassName}
            placeholder="80"
          />
          <p className={helperClassName}>Medida física da bobina. Use 80 mm para impressoras de cupom padrão.</p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-zinc-800">Área útil do cupom</label>
          <input
            type="number"
            min="48"
            max="76"
            step="1"
            value={contentWidthMm}
            onChange={(e) => setContentWidthMm(Number(e.target.value || DEFAULT_CONTENT_WIDTH_MM))}
            className={inputClassName}
            placeholder="76"
          />
          <p className={helperClassName}>Parte realmente usada pelo conteúdo. O restante vira margem lateral.</p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-zinc-800">Fonte base</label>
          <input
            type="number"
            min="10"
            max="22"
            step="0.5"
            value={baseFontSizePx}
            onChange={(e) => setBaseFontSizePx(Number(e.target.value || DEFAULT_FONT_SIZE_PX))}
            className={inputClassName}
            placeholder="14"
          />
          <p className={helperClassName}>Aumente este valor se o texto estiver pequeno demais no papel.</p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-zinc-800">Espaçamento entre linhas</label>
          <input
            type="number"
            min="1"
            max="2.4"
            step="0.05"
            value={lineHeight}
            onChange={(e) => setLineHeight(Number(e.target.value || DEFAULT_LINE_HEIGHT))}
            className={inputClassName}
            placeholder="1,55"
          />
          <p className={helperClassName}>Controla o respiro vertical. Valores maiores deixam o cupom mais alto e legível.</p>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
        <div className="text-sm font-semibold text-zinc-900">Leitura rápida</div>
        <div className="mt-2 grid gap-2 text-sm text-zinc-700 md:grid-cols-2 xl:grid-cols-5">
          <div>
            <span className="font-medium">Papel:</span> {safePaperWidth} mm
          </div>
          <div>
            <span className="font-medium">Conteúdo:</span> {safeContentWidth} mm
          </div>
          <div>
            <span className="font-medium">Margem lateral:</span> {sideMargins.toFixed(1).replace(".", ",")} mm
          </div>
          <div>
            <span className="font-medium">Fonte:</span> {safeBaseFontSizePx}px
          </div>
          <div>
            <span className="font-medium">Espaçamento:</span> {safeLineHeight.toFixed(2).replace(".", ",")}
          </div>
        </div>
      </div>

      <div className="mt-4 flex justify-end gap-2">
        <button onClick={onCancel} className="rounded-lg border border-gray-300 px-3 py-2 text-gray-700 hover:bg-gray-50">
          Cancelar
        </button>
        <button onClick={onSave} className="rounded-lg bg-blue-600 px-3 py-2 text-white hover:bg-blue-700">
          Salvar Layout
        </button>
      </div>
    </div>
  );
}

function CustomizationEditor({
  printer,
  customization,
  inputClassName,
  helperClassName,
  onCancel,
  onSave,
  onTestPrint,
  setCustomization,
}: {
  printer: PrinterCadastrada;
  customization: ReceiptCustomizationForm;
  inputClassName: string;
  helperClassName: string;
  onCancel: () => void;
  onSave: () => void;
  onTestPrint: () => void;
  setCustomization: Dispatch<SetStateAction<ReceiptCustomizationForm>>;
}) {
  const isCustomMode = customization.templateMode === "custom";

  return (
    <div className="mt-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-6 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-zinc-900">Personalização do cupom</h3>
          <p className="mt-1 text-sm text-zinc-500">
            Escolha entre um cupom padrão, mais enxuto, ou um cupom personalizado com textos e blocos próprios.
          </p>
        </div>

        <div className="inline-flex rounded-2xl border border-zinc-200 bg-white p-1 shadow-sm">
          <button
            type="button"
            onClick={() => setCustomization((prev) => ({ ...prev, templateMode: "default" }))}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
              !isCustomMode ? "bg-blue-600 text-white shadow-sm" : "text-zinc-700 hover:bg-zinc-50"
            }`}
          >
            Padrão
          </button>
          <button
            type="button"
            onClick={() => setCustomization((prev) => ({ ...prev, templateMode: "custom" }))}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
              isCustomMode ? "bg-zinc-900 text-white shadow-sm" : "text-zinc-700 hover:bg-zinc-50"
            }`}
          >
            Personalizado
          </button>
        </div>
      </div>

      {!isCustomMode && (
        <div className="mt-5 rounded-2xl border border-blue-200 bg-blue-50 p-5">
          <div className="text-sm font-semibold text-blue-900">Cupom padrão ativo</div>
          <p className="mt-2 text-sm text-blue-800">
            O sistema vai usar o layout operacional padrão do Galberto, com dados da própria venda e da loja cadastrada,
            sem sobrescrever cabeçalho, rodapé ou campos do comprovante.
          </p>
          <div className="mt-4 rounded-xl border border-dashed border-blue-300 bg-white p-4 font-mono text-sm leading-6 text-zinc-800">
            <div className="text-center font-bold">{printer.display_name || printer.name}</div>
            <div className="mt-1 text-center text-zinc-500">Rua da loja, CNPJ e dados operacionais</div>
            <div className="my-2 border-t border-dashed border-zinc-400" />
            <div>ARROZ TIPO 1 5KG</div>
            <div className="flex justify-between">
              <span>1 x 29,90</span>
              <span>29,90</span>
            </div>
            <div className="my-2 border-t border-dashed border-zinc-400" />
            <div className="flex justify-between">
              <span>Dinheiro</span>
              <span>45,90</span>
            </div>
            <div className="mt-3 text-center">Documento impresso pelo Galberto PDV</div>
          </div>
        </div>
      )}

      {isCustomMode && (
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="rounded-xl border border-zinc-200 bg-white p-4">
              <h4 className="text-sm font-semibold text-zinc-900">Cabeçalho e rodapé</h4>
              <div className="mt-4 space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-zinc-800">Título do cabeçalho</label>
                  <input
                    value={customization.headerTitle}
                    onChange={(e) => setCustomization((prev) => ({ ...prev, headerTitle: e.target.value }))}
                    placeholder="Ex.: MERCADO GALBERTO - UNIDADE CENTRO"
                    className={inputClassName}
                  />
                  <p className={helperClassName}>Texto principal do topo. Se deixar vazio, o sistema usa o nome da loja.</p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-zinc-800">Mensagem do cabeçalho</label>
                  <textarea
                    value={customization.headerMessage}
                    onChange={(e) => setCustomization((prev) => ({ ...prev, headerMessage: e.target.value }))}
                    placeholder="Ex.: Promoções válidas enquanto durarem os estoques."
                    rows={3}
                    className={inputClassName}
                  />
                  <p className={helperClassName}>Mensagem curta logo abaixo da identificação da loja.</p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-zinc-800">Mensagem do rodapé</label>
                  <textarea
                    value={customization.footerMessage}
                    onChange={(e) => setCustomization((prev) => ({ ...prev, footerMessage: e.target.value }))}
                    placeholder="Ex.: Trocas somente com este comprovante."
                    rows={3}
                    className={inputClassName}
                  />
                  <p className={helperClassName}>Texto antes da mensagem final. Bom para política de troca ou aviso importante.</p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-zinc-800">Mensagem final</label>
                  <input
                    value={customization.thankYouMessage}
                    onChange={(e) => setCustomization((prev) => ({ ...prev, thankYouMessage: e.target.value }))}
                    placeholder="Ex.: Obrigado pela preferência!"
                    className={inputClassName}
                  />
                  <p className={helperClassName}>Última linha do cupom, normalmente um agradecimento.</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-4">
              <h4 className="text-sm font-semibold text-zinc-900">Logo e identidade</h4>
              <div className="mt-4 space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-zinc-800">Caminho da logo</label>
                  <input
                    value={customization.logoPath}
                    onChange={(e) => setCustomization((prev) => ({ ...prev, logoPath: e.target.value }))}
                    placeholder="Ex.: /home/isaque/Imagens/logo.png"
                    className={inputClassName}
                  />
                  <p className={helperClassName}>Imagem local para o cabeçalho. Se não usar logo, deixe vazio.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-zinc-200 bg-white p-4">
              <h4 className="text-sm font-semibold text-zinc-900">Blocos visíveis</h4>
              <p className="mt-1 text-sm text-zinc-500">Escolha o que deve aparecer no cupom personalizado.</p>
              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 text-sm">
                {[
                  ["showLogo", "Exibir logo"],
                  ["showLegalName", "Exibir razão social"],
                  ["showDocument", "Exibir CNPJ"],
                  ["showAddress", "Exibir endereço"],
                  ["showOperator", "Exibir operador"],
                  ["showCustomer", "Exibir cliente"],
                  ["showItemCodes", "Exibir código dos itens"],
                  ["showPaymentBreakdown", "Exibir pagamentos"],
                  ["showFiscalSection", "Exibir bloco fiscal"],
                ].map(([key, label]) => (
                  <label key={key} className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-3 text-zinc-800">
                    <input
                      type="checkbox"
                      checked={Boolean(customization[key as keyof ReceiptCustomizationForm])}
                      onChange={(e) => setCustomization((prev) => ({ ...prev, [key]: e.target.checked }))}
                    />
                    <span className="font-medium">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-4">
              <div className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">Prévia rápida</div>
              <div className="mt-3 rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-4 font-mono text-sm leading-6 text-zinc-800">
                <div className="text-center font-bold">{customization.headerTitle || printer.display_name || printer.name}</div>
                {customization.headerMessage && <div className="mt-1 text-center">{customization.headerMessage}</div>}
                {customization.showLogo && customization.logoPath && <div className="mt-1 text-center text-zinc-500">[logo configurada]</div>}
                {customization.showAddress && <div className="mt-2 text-center text-zinc-500">Rua exemplo, 123 - Centro</div>}
                <div className="my-2 border-t border-dashed border-zinc-400" />
                <div>ARROZ TIPO 1 5KG</div>
                {customization.showItemCodes && <div className="text-zinc-500">Cod.: 7890001112223</div>}
                <div className="flex justify-between">
                  <span>1 x 29,90</span>
                  <span>29,90</span>
                </div>
                <div className="my-2 border-t border-dashed border-zinc-400" />
                {customization.showPaymentBreakdown && (
                  <div className="flex justify-between">
                    <span>Dinheiro</span>
                    <span>45,90</span>
                  </div>
                )}
                {customization.footerMessage && <div className="mt-2">{customization.footerMessage}</div>}
                <div className="mt-3 text-center">{customization.thankYouMessage}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 flex justify-end gap-2">
        <button onClick={onCancel} className="rounded-lg border border-zinc-300 px-3 py-2 text-zinc-700 hover:bg-white">
          Cancelar
        </button>
        <button onClick={onTestPrint} className="rounded-lg bg-emerald-600 px-3 py-2 text-white hover:bg-emerald-700">
          Testar Agora
        </button>
        <button onClick={onSave} className="rounded-lg bg-zinc-900 px-3 py-2 text-white hover:bg-zinc-800">
          Salvar Personalização
        </button>
      </div>
    </div>
  );
}

function PrinterCard({
  printer,
  isDefault,
  editingPrinterId,
  customizationOpenId,
  paperWidthMm,
  contentWidthMm,
  baseFontSizePx,
  lineHeight,
  customization,
  inputClassName,
  helperClassName,
  onDefineDefault,
  onRemove,
  onStartLayoutEdit,
  onStartCustomizationEdit,
  onSaveLayout,
  onSaveCustomization,
  onTestPrint,
  onCancelLayout,
  onCancelCustomization,
  setPaperWidthMm,
  setContentWidthMm,
  setBaseFontSizePx,
  setLineHeight,
  setCustomization,
}: PrinterCardProps) {
  const customizationMode = parseReceiptSettings(printer).templateMode;

  return (
    <div className={isDefault ? "bg-white rounded-lg p-4 shadow-sm" : "bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:border-gray-300 transition-colors"}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className={`${isDefault ? "bg-blue-100" : "bg-gray-100"} rounded-lg p-3`}>
            <Printer className={isDefault ? "h-8 w-8 text-blue-600" : "h-6 w-6 text-gray-500"} />
          </div>
          <div>
            <h3 className={`font-${isDefault ? "semibold" : "medium"} text-gray-900`}>
              {printer.display_name || printer.name}
            </h3>
            <p className="text-sm text-gray-500">{printer.name}</p>
            {printer.brand && printer.model && (
              <p className={`${isDefault ? "mt-1" : ""} text-xs text-gray-400`}>
                {printer.brand} - {printer.model}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isDefault ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs text-green-700">
              <CheckCircle className="h-3 w-3" />
              Ativa
            </span>
          ) : (
            <>
              <button
                onClick={() => onDefineDefault(printer.id)}
                className="flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-1.5 text-sm text-blue-600 transition-colors hover:bg-blue-100"
                title="Definir como padrão"
              >
                <Star className="h-4 w-4" />
                Usar
              </button>
              <button
                onClick={() => onRemove(printer.id, printer.display_name || printer.name)}
                className="rounded-lg p-1.5 text-red-500 transition-colors hover:bg-red-50"
                title="Remover impressora"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {(printer.connection_type || printer.driver_name) && isDefault && (
        <div className="mt-4 grid grid-cols-2 gap-4 border-t border-gray-100 pt-4 text-sm">
          {printer.connection_type && (
            <div>
              <span className="text-gray-400">Conexão:</span>
              <span className="ml-2 text-gray-700">{printer.connection_type}</span>
            </div>
          )}
          {printer.driver_name && (
            <div>
              <span className="text-gray-400">Driver:</span>
              <span className="ml-2 text-gray-700">{printer.driver_name}</span>
            </div>
          )}
        </div>
      )}

      {printer.notes && isDefault && (
        <div className="mt-3 text-sm text-gray-500">
          <span className="text-gray-400">Obs:</span> {printer.notes}
        </div>
      )}

      <div className={`${isDefault ? "mt-4 border border-blue-200 bg-blue-50 text-blue-900" : "mt-3 border border-zinc-200 bg-zinc-50 text-zinc-700"} rounded-lg px-4 py-3 text-sm`}>
        <div className="font-semibold">Layout atual do cupom</div>
        <div className="mt-1">
          Papel {printer.paper_width_mm} mm, área útil {printer.content_width_mm} mm
        </div>
        <div className="mt-1 text-xs">
          Fonte {printer.base_font_size_px}px, espaçamento {printer.line_height}
        </div>
        <div className="mt-1 text-xs">
          Modo do cupom: {customizationMode === "custom" ? "Personalizado" : "Padrão"}
        </div>
      </div>

      <div className={`${isDefault ? "mt-4 justify-end" : "mt-4"} flex flex-wrap gap-2`}>
        <button
          onClick={() => onTestPrint(printer.id)}
          className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm text-white transition-colors hover:bg-emerald-700"
        >
          Testar Impressão
        </button>
        <button
          onClick={() => onStartLayoutEdit(printer)}
          className={`${isDefault ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-zinc-50 text-zinc-700 hover:bg-zinc-100"} rounded-lg px-3 py-1.5 text-sm transition-colors`}
        >
          Ajustar Layout
        </button>
        <button
          onClick={() => onStartCustomizationEdit(printer)}
          className="rounded-lg bg-zinc-900 px-3 py-1.5 text-sm text-white transition-colors hover:bg-zinc-800"
        >
          Personalizar Cupom
        </button>
      </div>

      {editingPrinterId === printer.id && (
        <LayoutEditor
          paperWidthMm={paperWidthMm}
          contentWidthMm={contentWidthMm}
          baseFontSizePx={baseFontSizePx}
          lineHeight={lineHeight}
          inputClassName={inputClassName}
          helperClassName={helperClassName}
          onCancel={onCancelLayout}
          onSave={() => void onSaveLayout(printer.id)}
          setPaperWidthMm={setPaperWidthMm}
          setContentWidthMm={setContentWidthMm}
          setBaseFontSizePx={setBaseFontSizePx}
          setLineHeight={setLineHeight}
        />
      )}

      {customizationOpenId === printer.id && (
        <CustomizationEditor
          printer={printer}
          customization={customization}
          inputClassName={inputClassName}
          helperClassName={helperClassName}
          onCancel={onCancelCustomization}
          onSave={() => void onSaveCustomization(printer.id)}
          onTestPrint={() => void onTestPrint(printer.id)}
          setCustomization={setCustomization}
        />
      )}
    </div>
  );
}

export default function PrintersList() {
  const [printers, setPrinters] = useState<PrinterCadastrada[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPrinterId, setEditingPrinterId] = useState<number | null>(null);
  const [paperWidthMm, setPaperWidthMm] = useState(DEFAULT_PAPER_WIDTH_MM);
  const [contentWidthMm, setContentWidthMm] = useState(DEFAULT_CONTENT_WIDTH_MM);
  const [baseFontSizePx, setBaseFontSizePx] = useState(DEFAULT_FONT_SIZE_PX);
  const [lineHeight, setLineHeight] = useState(DEFAULT_LINE_HEIGHT);
  const [customizationOpenId, setCustomizationOpenId] = useState<number | null>(null);
  const [customization, setCustomization] = useState<ReceiptCustomizationForm>(defaultCustomization);
  const [feedback, setFeedback] = useState("");

  const carregarPrinters = async () => {
    setLoading(true);
    try {
      const lista = await listarPrintersCadastradas();
      setPrinters(lista || []);
    } catch (err) {
      console.error("Erro ao carregar impressoras cadastradas:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void carregarPrinters();
  }, []);

  const handleDefinirPadrao = async (id: number) => {
    try {
      await definirPrinterPadrao(id);
      await carregarPrinters();
    } catch (err) {
      console.error("Erro ao definir impressora padrão:", err);
    }
  };

  const handleRemover = async (id: number, nome: string) => {
    if (!confirm(`Remover a impressora "${nome}"?`)) return;
    try {
      await removerPrinter(id);
      await carregarPrinters();
    } catch (err) {
      console.error("Erro ao remover impressora:", err);
    }
  };

  const startLayoutEdit = (printer: PrinterCadastrada) => {
    setFeedback("");
    setCustomizationOpenId(null);
    setEditingPrinterId(printer.id);
    setPaperWidthMm(Number(printer.paper_width_mm ?? DEFAULT_PAPER_WIDTH_MM));
    setContentWidthMm(Number(printer.content_width_mm ?? DEFAULT_CONTENT_WIDTH_MM));
    setBaseFontSizePx(Number(printer.base_font_size_px ?? DEFAULT_FONT_SIZE_PX));
    setLineHeight(Number(printer.line_height ?? DEFAULT_LINE_HEIGHT));
  };

  const startCustomizationEdit = (printer: PrinterCadastrada) => {
    setFeedback("");
    setEditingPrinterId(null);
    setCustomizationOpenId(printer.id);
    setCustomization(parseReceiptSettings(printer));
  };

  const handleSalvarLayout = async (id: number) => {
    try {
      await atualizarLayoutPrinter(id, {
        paper_width_mm: paperWidthMm,
        content_width_mm: contentWidthMm,
        base_font_size_px: baseFontSizePx,
        line_height: lineHeight,
      });
      setEditingPrinterId(null);
      setFeedback("Layout da impressora atualizado.");
      await carregarPrinters();
    } catch (err) {
      console.error("Erro ao atualizar layout da impressora:", err);
      setFeedback("Não foi possível salvar o layout da impressora.");
    }
  };

  const handleSalvarPersonalizacao = async (id: number) => {
    try {
      await atualizarPersonalizacaoPrinter(id, JSON.stringify(customization));
      setCustomizationOpenId(null);
      setFeedback(
        customization.templateMode === "custom"
          ? "Cupom personalizado salvo."
          : "Cupom padrão ativado para esta impressora.",
      );
      await carregarPrinters();
    } catch (err) {
      console.error("Erro ao atualizar personalização do cupom:", err);
      setFeedback("Não foi possível salvar a personalização do cupom.");
    }
  };

  const handleTestPrint = async (id: number) => {
    try {
      const result = await testPrint(id);
      setFeedback(result?.message ?? "Teste de impressão enviado.");
    } catch (err) {
      console.error("Erro ao testar impressão:", err);
      setFeedback("Não foi possível testar a impressão.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600" />
        <span className="ml-3 text-gray-600">Carregando impressoras...</span>
      </div>
    );
  }

  if (printers.length === 0) {
    return (
      <div className="rounded-xl bg-white p-8 text-center shadow">
        <Printer className="mx-auto mb-4 h-16 w-16 text-gray-300" />
        <h3 className="mb-2 text-lg font-medium text-gray-700">Nenhuma impressora cadastrada</h3>
        <p className="text-sm text-gray-500">Cadastre uma impressora na aba "Cadastrar" para começar.</p>
      </div>
    );
  }

  const printerPadrao = printers.find((p) => p.is_default === 1);
  const outrasPrinters = printers.filter((p) => p.is_default !== 1);
  const inputClassName =
    "w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-base font-medium text-zinc-900 placeholder:text-zinc-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";
  const helperClassName = "mt-1 text-xs text-zinc-500";

  return (
    <div className="space-y-6">
      {feedback && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          {feedback}
        </div>
      )}

      {printerPadrao && (
        <div className="rounded-xl border-2 border-blue-300 bg-linear-to-r from-blue-50 to-blue-100 p-6">
          <div className="mb-4 flex items-center gap-2">
            <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
            <h2 className="text-lg font-semibold text-blue-800">Impressora Padrão</h2>
          </div>

          <PrinterCard
            printer={printerPadrao}
            isDefault
            editingPrinterId={editingPrinterId}
            customizationOpenId={customizationOpenId}
            paperWidthMm={paperWidthMm}
            contentWidthMm={contentWidthMm}
            baseFontSizePx={baseFontSizePx}
            lineHeight={lineHeight}
            customization={customization}
            inputClassName={inputClassName}
            helperClassName={helperClassName}
            onDefineDefault={handleDefinirPadrao}
            onRemove={handleRemover}
            onStartLayoutEdit={startLayoutEdit}
            onStartCustomizationEdit={startCustomizationEdit}
            onSaveLayout={handleSalvarLayout}
            onSaveCustomization={handleSalvarPersonalizacao}
            onTestPrint={handleTestPrint}
            onCancelLayout={() => setEditingPrinterId(null)}
            onCancelCustomization={() => setCustomizationOpenId(null)}
            setPaperWidthMm={setPaperWidthMm}
            setContentWidthMm={setContentWidthMm}
            setBaseFontSizePx={setBaseFontSizePx}
            setLineHeight={setLineHeight}
            setCustomization={setCustomization}
          />
        </div>
      )}

      {outrasPrinters.length > 0 && (
        <div>
          <h2 className="mb-4 text-lg font-semibold text-gray-700">Outras Impressoras ({outrasPrinters.length})</h2>
          <div className="space-y-3">
            {outrasPrinters.map((printer) => (
              <PrinterCard
                key={printer.id}
                printer={printer}
                isDefault={false}
                editingPrinterId={editingPrinterId}
                customizationOpenId={customizationOpenId}
                paperWidthMm={paperWidthMm}
                contentWidthMm={contentWidthMm}
                baseFontSizePx={baseFontSizePx}
                lineHeight={lineHeight}
                customization={customization}
                inputClassName={inputClassName}
                helperClassName={helperClassName}
                onDefineDefault={handleDefinirPadrao}
                onRemove={handleRemover}
                onStartLayoutEdit={startLayoutEdit}
                onStartCustomizationEdit={startCustomizationEdit}
                onSaveLayout={handleSalvarLayout}
                onSaveCustomization={handleSalvarPersonalizacao}
                onTestPrint={handleTestPrint}
                onCancelLayout={() => setEditingPrinterId(null)}
                onCancelCustomization={() => setCustomizationOpenId(null)}
                setPaperWidthMm={setPaperWidthMm}
                setContentWidthMm={setContentWidthMm}
                setBaseFontSizePx={setBaseFontSizePx}
                setLineHeight={setLineHeight}
                setCustomization={setCustomization}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
