export interface UsuarioFiltro {
  id?: number;
  name?: string;
  role?: string;
  login?: string;
  ativo?: number;
}

export interface Usuario {
  id: number;
  nome: string;
  role: string;
  email: string;
  login: string;
  foto:string;
  ativo: number;
}

export interface UsuarioListagem {
  data: Usuario[];
  page: number;
  limit: number;
  total: number;
}

export interface FotoPerfil{
  nomeArquivo: string;
  tipo: string;
  buffer: number[];
}