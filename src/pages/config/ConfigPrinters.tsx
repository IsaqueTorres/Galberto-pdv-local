import { useEffect, useState } from "react";
import { PlusCircle } from "lucide-react";
import { buscarImpressoras, addPrinter } from "./services/printers";
import PrintersList from "./PrintersList";

type SubAba = "listar" | "cadastrar";

type Printer = {
  name: string;
  displayName?: string;
};

export default function ConfigPrinters() {
  const [subAba, setSubAba] = useState<SubAba>("listar");
  const [printers, setPrinters] = useState<Printer[]>([]);
  const [selectedPrinter, setSelectedPrinter] = useState("");
  const [display_name, setDisplayName] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [connection_type, setConnectionType] = useState("");
  const [driver_name, setDriverName] = useState("");
  const [driver_version, setDriverVersion] = useState("");
  const [photo_path, setPhotoPath] = useState("");
  const [notes, setNotes] = useState("");
  const [paperWidthMm, setPaperWidthMm] = useState(80);
  const [contentWidthMm, setContentWidthMm] = useState(76);
  const [baseFontSizePx, setBaseFontSizePx] = useState(14);
  const [lineHeight, setLineHeight] = useState(1.55);
  const [is_default, setIsDefault] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    async function loadData() {
      try {
        const PrintersList = await buscarImpressoras();
        setPrinters(PrintersList);
      } catch (err) {
        console.error(err);
      }
    }

    loadData();
  }, []);

  const limparFormulario = () => {
    setSelectedPrinter("");
    setDisplayName("");
    setBrand("");
    setModel("");
    setConnectionType("");
    setDriverName("");
    setDriverVersion("");
    setPhotoPath("");
    setNotes("");
    setPaperWidthMm(80);
    setContentWidthMm(76);
    setBaseFontSizePx(14);
    setLineHeight(1.55);
    setIsDefault(true);
  };

  const salvar = async () => {
    if (!selectedPrinter) {
      alert("Selecione uma impressora!");
      return;
    }

    await addPrinter({
      selectedPrinter,
      display_name,
      brand,
      model,
      connection_type,
      driver_name,
      driver_version,
      photo_path,
      paper_width_mm: paperWidthMm,
      content_width_mm: contentWidthMm,
      base_font_size_px: baseFontSizePx,
      line_height: lineHeight,
      receipt_settings_json: JSON.stringify({
        templateMode: "default",
        thankYouMessage: "Documento impresso pelo Galberto PDV",
        showLogo: false,
        showLegalName: true,
        showDocument: true,
        showAddress: true,
        showOperator: true,
        showCustomer: true,
        showItemCodes: true,
        showPaymentBreakdown: true,
        showFiscalSection: true,
      }),
      notes,
      is_default: is_default ? 1 : 0,
    });

    alert("Impressora cadastrada!");
    limparFormulario();
    setRefreshKey((k) => k + 1);
    setSubAba("listar");
  };


  return (
    <section className="animate-in fade-in duration-500">
      {/* TITULO E BOTAO CADASTRAR NOVA */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        {/* TÍTULO */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white tracking-tight">Impressoras Térmicas</h2>
          <p className="text-sm text-gray-500 dark:text-zinc-400">
            Gerencie as impressoras cadastradas ou adicione uma nova.
          </p>
        </div>


        <button
          onClick={() => setSubAba("cadastrar")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${subAba === "cadastrar"
            ? "bg-blue-600 text-white"
            : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-300"
            }`}
        >
          <PlusCircle className="h-4 w-4" />
          Cadastrar Nova
        </button>
      </div>

      {/* CONTEÚDO */}
      <div>
        {subAba === "listar" && <PrintersList key={refreshKey} />}

        {subAba === "cadastrar" && (
          <div className="max-w-5xl space-y-6">
            <div className="bg-white rounded-2xl shadow p-5 space-y-4">
              <label className="block text-sm font-medium mb-1">
                Impressora de Cupom
              </label>

              <select
                value={selectedPrinter}
                onChange={(e) => setSelectedPrinter(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring"
              >
                <option value="">Selecione uma impressora</option>
                {printers.map((p) => (
                  <option key={p.name} value={p.name}>
                    {p.displayName || p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Dados da Impressora */}
            <section className="bg-white rounded-xl shadow p-6">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">
                Dados da Impressora
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Nome */}
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">
                    Nome para exibição
                  </label>
                  <input
                    className="w-full border rounded-md bg-gray-100 text-gray-900 border-gray-300
                     focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50
                     p-2"
                    value={display_name}
                    onChange={(e) => setDisplayName(e.target.value)}
                  />
                </div>
                {/* MARCA */}
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">Marca</label>
                  <input
                    className="w-full border rounded-md bg-gray-100 text-gray-900 border-gray-300
                     focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50
                     p-2"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                  />
                </div>

                {/* MODELO */}
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">Modelo</label>
                  <input
                    className="w-full border rounded-md bg-gray-100 text-gray-900 border-gray-300
                     focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50
                     p-2"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                  />
                </div>

                {/* TIPO DE CONEXAO */}
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">
                    Tipo de conexão
                  </label>
                  <input
                    className="w-full border rounded-md bg-gray-100 text-gray-900 border-gray-300
                     focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50
                     p-2"
                    value={connection_type}
                    onChange={(e) => setConnectionType(e.target.value)}
                  />
                </div>
              </div>
            </section>

            <section className="bg-white rounded-xl shadow p-6">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">
                Layout do Cupom
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">Largura do papel (mm)</label>
                  <input
                    type="number"
                    min="58"
                    max="80"
                    step="1"
                    className="w-full border rounded-md bg-gray-100 text-gray-900 border-gray-300 p-2"
                    value={paperWidthMm}
                    onChange={(e) => setPaperWidthMm(Number(e.target.value || 80))}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">Largura útil (mm)</label>
                  <input
                    type="number"
                    min="48"
                    max="76"
                    step="1"
                    className="w-full border rounded-md bg-gray-100 text-gray-900 border-gray-300 p-2"
                    value={contentWidthMm}
                    onChange={(e) => setContentWidthMm(Number(e.target.value || 76))}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">Fonte base (px)</label>
                  <input
                    type="number"
                    min="10"
                    max="22"
                    step="0.5"
                    className="w-full border rounded-md bg-gray-100 text-gray-900 border-gray-300 p-2"
                    value={baseFontSizePx}
                    onChange={(e) => setBaseFontSizePx(Number(e.target.value || 14))}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">Espaçamento entre linhas</label>
                  <input
                    type="number"
                    min="1"
                    max="2.4"
                    step="0.05"
                    className="w-full border rounded-md bg-gray-100 text-gray-900 border-gray-300 p-2"
                    value={lineHeight}
                    onChange={(e) => setLineHeight(Number(e.target.value || 1.55))}
                  />
                </div>
              </div>
              <p className="mt-3 text-sm text-gray-500">
                Se o cupom estiver pequeno, aumente a fonte base para 16 ou 18 px. Se ficar apertado, suba também o espaçamento.
              </p>
            </section>

            {/* INFORMAÇÕES TÉCNICAS */}
            <section className="bg-white rounded-xl shadow p-6">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">
                Informações Técnicas
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* NOME DO DRIVER */}
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">Driver</label>
                  <input
                    className="w-full border rounded-md bg-gray-100 text-gray-900 border-gray-300
                     focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50
                     p-2"
                    value={driver_name}
                    onChange={(e) => setDriverName(e.target.value)}
                  />
                </div>

                {/* VERSAO DO DRIVER */}
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">
                    Versão do driver
                  </label>
                  <input
                    className="w-full border rounded-md bg-gray-100 text-gray-900 border-gray-300
                     focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50
                     p-2"
                    value={driver_version}
                    onChange={(e) => setDriverVersion(e.target.value)}
                  />
                </div>

                {/* CAMINHO DA FOTO */}
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">
                    Foto da impressora
                  </label>
                  <input
                    className="w-full border rounded-md bg-gray-100 text-gray-900 border-gray-300
                     focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50
                     p-2"
                    value={photo_path}
                    onChange={(e) => setPhotoPath(e.target.value)}
                  />
                </div>

                {/* OBS */}
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">Observação</label>
                  <input
                    className="w-full border rounded-md bg-gray-100 text-gray-900 border-gray-300
                     focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50
                     p-2"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>
            </section>

            {/* DEFINIR COMO PADRÃO */}
            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">
                  Definir como padrão
                </label>

                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-red-500">Off</span>

                  <label className="relative inline-block w-11 h-6 cursor-pointer">
                    <input
                      type="checkbox"
                      className="peer sr-only"
                      checked={is_default}
                      onChange={(e) => setIsDefault(e.target.checked)}
                    />

                    {/* Trilha */}
                    <div
                      className="w-11 h-6 bg-gray-300 rounded-full
                       peer-checked:bg-blue-600 transition-colors"
                    />

                    {/* Bolinha */}
                    <div
                      className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full
                       transition-transform
                       peer-checked:translate-x-5"
                    />
                  </label>

                  <span className="text-xs text-green-600">On</span>
                </div>
              </div>
            </div>

            {/* AÇÃO */}
            <div className="flex justify-center space-x-4">
              <button
                onClick={salvar}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
              >
                Salvar
              </button>

              <button
                onClick={() => {
                  limparFormulario();
                  setSubAba("listar");
                }}
                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
