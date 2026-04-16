export interface Supplier {
    id: number;
    razao_social: string;
    CNPJ: string;
    IE: string;
    telefone: string;
    email: string;
    CEP: string;
    rua: string;
    numero: number;
    bairro: string;
    cidade: string;
    estado: string;
    observacao: string;
    ativo: number;
}


export interface SupplierFilter {
    id?: number;
    razao_social?: string;
    CNPJ?: string;
    nome_fantasia?: string;
}

export interface SupplierList {
    data: Supplier[];
    page: number;
    limit: number;
    total: number;
}