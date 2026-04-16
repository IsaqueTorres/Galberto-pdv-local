import { useEffect, useState } from "react";
import { Printer, Star, Trash2, CheckCircle } from "lucide-react";
import { listarPrintersCadastradas, removerPrinter, definirPrinterPadrao } from "../../services/printers";

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
};

export default function PrintersList() {
  const [printers, setPrinters] = useState<PrinterCadastrada[]>([]);
  const [loading, setLoading] = useState(true);

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
    carregarPrinters();
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Carregando impressoras...</span>
      </div>
    );
  }

  if (printers.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow p-8 text-center">
        <Printer className="mx-auto h-16 w-16 text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-700 mb-2">Nenhuma impressora cadastrada</h3>
        <p className="text-sm text-gray-500">
          Cadastre uma impressora na aba "Cadastrar" para começar.
        </p>
      </div>
    );
  }

  const printerPadrao = printers.find((p) => p.is_default === 1);
  const outrasPrinters = printers.filter((p) => p.is_default !== 1);

  return (
    <div className="space-y-6">
      {/* Impressora Padrão */}
      {printerPadrao && (
        <div className="bg-linear-to-r from-blue-50 to-blue-100 border-2 border-blue-300 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
            <h2 className="text-lg font-semibold text-blue-800">Impressora Padrão</h2>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 rounded-lg p-3">
                  <Printer className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {printerPadrao.display_name || printerPadrao.name}
                  </h3>
                  <p className="text-sm text-gray-500">{printerPadrao.name}</p>
                  {printerPadrao.brand && printerPadrao.model && (
                    <p className="text-xs text-gray-400 mt-1">
                      {printerPadrao.brand} - {printerPadrao.model}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                  <CheckCircle className="h-3 w-3" />
                  Ativa
                </span>
              </div>
            </div>

            {(printerPadrao.connection_type || printerPadrao.driver_name) && (
              <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-4 text-sm">
                {printerPadrao.connection_type && (
                  <div>
                    <span className="text-gray-400">Conexão:</span>
                    <span className="ml-2 text-gray-700">{printerPadrao.connection_type}</span>
                  </div>
                )}
                {printerPadrao.driver_name && (
                  <div>
                    <span className="text-gray-400">Driver:</span>
                    <span className="ml-2 text-gray-700">{printerPadrao.driver_name}</span>
                  </div>
                )}
              </div>
            )}

            {printerPadrao.notes && (
              <div className="mt-3 text-sm text-gray-500">
                <span className="text-gray-400">Obs:</span> {printerPadrao.notes}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Outras Impressoras */}
      {outrasPrinters.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Outras Impressoras ({outrasPrinters.length})
          </h2>

          <div className="space-y-3">
            {outrasPrinters.map((printer) => (
              <div
                key={printer.id}
                className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-gray-100 rounded-lg p-3">
                      <Printer className="h-6 w-6 text-gray-500" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {printer.display_name || printer.name}
                      </h3>
                      <p className="text-sm text-gray-500">{printer.name}</p>
                      {printer.brand && printer.model && (
                        <p className="text-xs text-gray-400">
                          {printer.brand} - {printer.model}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDefinirPadrao(printer.id)}
                      className="px-3 py-1.5 text-sm bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-1"
                      title="Definir como padrão"
                    >
                      <Star className="h-4 w-4" />
                      Usar
                    </button>

                    <button
                      onClick={() => handleRemover(printer.id, printer.display_name || printer.name)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remover impressora"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
