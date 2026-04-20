import { useEffect, useMemo, useRef } from "react";
import { AlertCircle, CheckCircle2, IdCard, UserRound } from "lucide-react";
import { ModalShell } from "../../../components/ui/ModalShell";
import { SummaryBox } from "../../../components/ui/SummaryBox";
import { formatMoney } from "../utils/formatMoney";
import { formatCPF } from "../utils/cpf";
import type { ProdutoPDV } from "../../products/types/products.types";

type CustomerCpfModalProps = {
  open: boolean;
  operatorName?: string;
  pdvId: string;
  produtoPendente: ProdutoPDV | null;
  cpfCliente: string;
  erroCliente: string;
  setCpfCliente: (value: string) => void;
  setErroCliente: (value: string) => void;
  onConfirm: () => void;
  onContinueWithoutCpf: () => void;
};

export function CustomerCpfModal({
  open,
  operatorName,
  pdvId,
  produtoPendente,
  cpfCliente,
  erroCliente,
  setCpfCliente,
  setErroCliente,
  onConfirm,
  onContinueWithoutCpf,
}: CustomerCpfModalProps) {
  const cpfInputRef = useRef<HTMLInputElement>(null);
  const noInfoButtonRef = useRef<HTMLButtonElement>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  const focusables = useMemo(
    () => [cpfInputRef, noInfoButtonRef, confirmButtonRef],
    []
  );

  useEffect(() => {
    if (!open) return;

    requestAnimationFrame(() => {
      cpfInputRef.current?.focus();
      cpfInputRef.current?.select();
    });
  }, [open]);

  if (!open) return null;

  function moveFocus(direction: 1 | -1) {
    const elements = focusables
      .map((ref) => ref.current)
      .filter(Boolean) as HTMLElement[];

    if (elements.length === 0) return;

    const activeElement = document.activeElement as HTMLElement | null;
    const currentIndex = elements.findIndex((element) => element === activeElement);
    const safeIndex = currentIndex >= 0 ? currentIndex : 0;
    const nextIndex = (safeIndex + direction + elements.length) % elements.length;

    elements[nextIndex]?.focus();
  }

  function handleModalNavigation(event: React.KeyboardEvent<HTMLElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      onContinueWithoutCpf();
      return;
    }

    if (event.key === "ArrowDown" || event.key === "ArrowRight") {
      event.preventDefault();
      moveFocus(1);
      return;
    }

    if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
      event.preventDefault();
      moveFocus(-1);
      return;
    }

    if (event.key === "Tab") {
      event.preventDefault();
      moveFocus(event.shiftKey ? -1 : 1);
    }
  }

  return (
    <ModalShell
      title="Identificação do Cliente"
      subtitle="Informe o CPF antes de iniciar a venda. Use Enter, Tab ou setas para avançar."
      icon={UserRound}
      onClose={undefined}
    >
      <div onKeyDownCapture={handleModalNavigation}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <SummaryBox label="Operador" value={operatorName || "Não informado"} />
          <SummaryBox label="PDV" value={pdvId} />
          <SummaryBox label="Status" value="Nova venda" highlight />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 mb-6">
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
            Primeiro produto da venda
          </div>
          <div className="text-lg font-black text-slate-900">
            {produtoPendente?.nome || "Produto não identificado"}
          </div>
          <div className="text-sm text-slate-500 mt-1">
            {produtoPendente
              ? `Valor unitário: ${formatMoney(produtoPendente.preco_venda)}`
              : "Aguardando produto"}
          </div>
        </div>

        <div>
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-1 block">
            CPF do cliente
          </label>

          <div className="relative">
            <IdCard
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
            />
            <input
              ref={cpfInputRef}
              autoFocus
              type="text"
              inputMode="numeric"
              maxLength={14}
              value={cpfCliente}
              onChange={(e) => {
                setCpfCliente(formatCPF(e.target.value));
                setErroCliente("");
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  onConfirm();
                }
              }}
              className="w-full bg-white border border-blue-200 rounded-2xl pl-12 pr-4 py-4 text-2xl font-black text-blue-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              placeholder="000.000.000-00"
            />
          </div>

          {erroCliente && (
            <div className="mt-2 text-rose-600 text-sm font-semibold flex items-center gap-2">
              <AlertCircle size={14} />
              {erroCliente}
            </div>
          )}

          <p className="text-xs text-slate-500 mt-3">
            Enter confirma o CPF. Escape segue sem identificação.
          </p>
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <button
            ref={noInfoButtonRef}
            type="button"
            onClick={onContinueWithoutCpf}
            className="px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-black uppercase tracking-widest text-xs"
          >
            NÃO INFORMAR
          </button>

          <button
            ref={confirmButtonRef}
            type="button"
            onClick={onConfirm}
            className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-xs shadow-lg shadow-blue-200 flex items-center gap-2"
          >
            <CheckCircle2 size={16} />
            Confirmar Cliente
          </button>
        </div>
      </div>
    </ModalShell>
  );
}
