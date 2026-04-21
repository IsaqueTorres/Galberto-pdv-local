import { FunctionKey } from "../../../components/FunctionKey";

type PdvFooterKeysProps = {
  caixaAberto: boolean;
  onAjuda: (() => void) | undefined;
  onBuscarProduto: (() => void) | undefined;
  onBuscarVendas: (() => void) | undefined;
  onAlterarQuantidade: (() => void) | undefined;
  onPagar: (() => void) | undefined;
  onPausarVenda: (() => void) | undefined;
  onSangria: (() => void) | undefined;
  onExcluirItem: (() => void) | undefined;
  onCancelarVenda: (() => void) | undefined;
  onToggleCaixa: () => void;
  onSair: () => void;
  onConfig: (() => void) | undefined;
  canApplyDiscount: boolean;
};

export function PdvFooterKeys({
  caixaAberto,
  onAjuda,
  onBuscarVendas,
  onBuscarProduto,
  onAlterarQuantidade,
  onPagar,
  onPausarVenda,
  onSangria,
  onExcluirItem,
  onCancelarVenda,
  onToggleCaixa,
  onSair,
  onConfig,
  canApplyDiscount,
}: PdvFooterKeysProps) {
  return (
    <footer className="bg-blue-950 border-t border-blue-900 p-3 grid grid-cols-6 lg:grid-cols-12 gap-2 shadow-[0_-8px_24px_rgba(30,64,175,0.28)]">
      <FunctionKey tecla="F1" label="Ajuda" color="zinc" onClick={onAjuda} />
      <FunctionKey tecla="F2" label="Buscar Vendas" color="zinc" onClick={onBuscarVendas} />
      <FunctionKey tecla="F3" label="Buscar Produtos" color="zinc" onClick={onBuscarProduto}/>
      <FunctionKey tecla="F4" label={canApplyDiscount ? "Qtd / Desc" : "Qtd"} color="zinc" onClick={onAlterarQuantidade}/>
      <FunctionKey tecla="F5" label="Finalizar venda" color="emerald" onClick={onPagar} />
      <FunctionKey tecla="F6" label="Remover Item" color="rose" onClick={onExcluirItem} />
      <FunctionKey tecla="F7" label="Pausar Venda" color="yellow" onClick={onPausarVenda} />
      <FunctionKey tecla="F8" label="Sangria" color="orange" onClick={onSangria} />
      <FunctionKey tecla="F9" label="Cancelar Venda" color="rose" onClick={onCancelarVenda} />
      <FunctionKey
        tecla="F10"
        label={caixaAberto ? "Fechar Caixa" : "Abrir Caixa"}
        color={caixaAberto ? "rose" : "emerald"}
        onClick={onToggleCaixa}
      />
      <FunctionKey tecla="SHIFT + S" label="Configuracoes" color="emerald" onClick={onConfig} />
      <FunctionKey tecla="ESC" label="Sair" color="zinc" onClick={onSair} />
    </footer>
  );
}
