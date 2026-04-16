export type MeioPagamento = 'PIX' | 'CREDITO' | 'DEBITO' | 'DINHEIRO' | 'VOUCHER'


export type Vendas = {
    nome: string;
    marca: string;
    preco_custo?: number;
    preco_venda: number;
    estoque_atual?: number;
    codigo_barras?: string;
    categoria?: string;
    unidade_medida?: string;
    estoque_minimo: number;
    fornecedor_id?: number | null;
    ativo: number;


}