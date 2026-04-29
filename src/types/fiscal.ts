export type TaxRegimeCode = '1' | '2' | '3' | '4';

export interface CompanyFiscalFormData {
  nome_fantasia: string;
  razao_social: string;
  cnpj: string;
  inscricao_estadual: string;
  inscricao_municipal: string;

  rua: string;
  numero: string;
  complemento: string | null;
  bairro: string;
  cidade: string;
  uf: string;
  cep: string;

  cod_municipio_ibge: string;
  pais_codigo: string;
  pais_nome: string;
  telefone: string;

  crt: TaxRegimeCode | string;
  indicador_ie: string;
  cnae_principal: string;

  cert_path: string;
  cert_password: string;
  cert_validade: string;


  ambiente_emissao: string;
  criado_em: string;
};

export interface Cnae {
  id: number
  codigo: string
  denominacao: string
}
