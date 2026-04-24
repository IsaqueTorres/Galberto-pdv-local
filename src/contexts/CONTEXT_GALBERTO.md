### 1. CONTEXTO DO SISTEMA
- **Nome:** Galberto PDV
- **Tipo:** PDV Desktop (Electron + React + TypeScript + Vite) Offline-first
- **Banco de Dados:** SQLite (better-sqlite3) - Offline-first.
- **Público:** Pequenos mercados e comércios locais.
- **Arquitetura:** - Existe uma tabela `integrations` para armazenar tokens, credenciais e configurações
- O sistema já consome dados do Bling, que é o sistema mestre de produtos, clientes e outras entidades de retaguarda. Porem no futuro sera integrado a um ERP que nos mesmos vamos desenvolver.



### 2. OBJETIVO DESSA TAREFA

Seguinte, os dados vem do Bling de acordo com os campos que estao preenchidos la, por exemplo se o cliente cadastrou o produto com ID, codigo, Descricao e Preco o Json vem somente com esses dados, ja se o cliente cadastrou mais o json tras os outros tambem, ou seja o json retorna via API oque tem informacao e omite os vazios.

Porem acho melhor manter a tabela local como se fosse um espelho da tabela do bling e pega tudo que o cliente preencheu e armazena localmente, vai que um cliente especifico preencheu tudo.

Dessa maneira eu consigo tambem usar mais dados, extrair relatorios posteriores, e ate cadastrar os produtos localmente sem precisar alterar a tabela produtos, melhor sobrar do que faltar.


preciso de sua ajuda para ajustar a tabela produtos bem como o tipo de dados que o PDV trata, segue todos os dados que a Bling armazena 


ID
Código
Descrição
Unidade
NCM	Origem
Preço
Valor IPI fixo
Observações
Situação
Estoque
Preço de custo
Cód. no fornecedor
Fornecedor
Localização
Estoque máximo
Estoque mínimo
Peso líquido (Kg)
Peso bruto (Kg)
GTIN/EAN
GTIN/EAN da Embalagem
Largura do produto
Altura do Produto
Profundidade do produto
Data Validade
Descrição do Produto no Fornecedor
Descrição Complementar
Itens p/ caixa
Produto Variação
Tipo Produção
Classe de enquadramento do IPI
Código na Lista de Serviços
Tipo do item
Grupo de Tags/Tags
Tributos
Código Pai
Código Integração
Grupo de produtos
Marca
CEST
Volumes	Descrição Curta	Cross-Docking
URL Imagens Externas
Link Externo
Meses Garantia no Fornecedor
Clonar dados do pai
Condição do Produto	Frete Grátis
Número FCI
Departamento
Unidade de Medida
Preço de Compra
Valor base ICMS ST para retenção
Valor ICMS ST para retenção
Valor ICMS próprio do substituto
Categoria do produto
Informações Adicionais

Essa e nossa tabela local repare que temos 2 um products e outra produtos, a products busca do bling e salva na espelho produtos, pode ver que ja armazenamos algumas coisas porem outras coisas nao armazenamos, preciso que voce ADICIONE os dados que faltam para termos uma tabela correspondente a tabela do bling, nao altere os nomes das colunas ja existentes para que nao tenha problema com as funcoes que ja manipulam a tabela products

function createTableProducts() {
  const sqlComand = `
    CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    external_id TEXT,
    integration_source TEXT,
    sku TEXT,
    barcode TEXT,
    category_id TEXT,
    name TEXT NOT NULL,
    unit TEXT,
    sale_price_cents INTEGER NOT NULL DEFAULT 0,
    cost_price_cents INTEGER NOT NULL DEFAULT 0,
    current_stock REAL NOT NULL DEFAULT 0,
    minimum_stock REAL NOT NULL DEFAULT 0,
    active INTEGER NOT NULL DEFAULT 1,
    remote_created_at TEXT,
    remote_updated_at TEXT,
    last_synced_at TEXT,
    sync_status TEXT NOT NULL DEFAULT 'synced',
    raw_json TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    deleted_at TEXT,
    FOREIGN KEY (category_id) REFERENCES categories(id)
  );

    CREATE UNIQUE INDEX IF NOT EXISTS ux_products_integration_external
    ON products (integration_source, external_id);

  CREATE INDEX IF NOT EXISTS idx_products_name
    ON products (name);

  CREATE INDEX IF NOT EXISTS idx_products_sku
    ON products (sku);

  CREATE INDEX IF NOT EXISTS idx_products_barcode
    ON products (barcode);

  CREATE INDEX IF NOT EXISTS idx_products_category_id
    ON products (category_id);

  CREATE TABLE IF NOT EXISTS produtos (
    id TEXT PRIMARY KEY,
    internal_code TEXT,
    gtin TEXT,
    nome TEXT NOT NULL,
    marca TEXT,
    preco_custo REAL NOT NULL DEFAULT 0,
    preco_venda REAL NOT NULL DEFAULT 0,
    estoque_atual REAL NOT NULL DEFAULT 0,
    estoque_minimo REAL NOT NULL DEFAULT 0,
    unidade_medida TEXT,
    ncm TEXT,
    cfop TEXT,
    ativo INTEGER NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_produtos_nome
    ON produtos (nome);

  CREATE INDEX IF NOT EXISTS idx_produtos_gtin
    ON produtos (gtin);
  `;
  db.exec(sqlComand);
  logger.info("-> Tabela 'products' checada/criada");
}











Mude o estilo para ficar parecido com o estilo do PDV (azul)

- **Segurança:** Nunca exponha chaves de API no Frontend. Use o IPC Main do Electron para chamadas sensíveis.
- **Tipagem:** Use TypeScript rigoroso. Crie Interfaces para as respostas do ERP e converta-as para o Schema do Galberto.
- **Resiliência:** Implemente tratamento de erros para quando o cliente estiver sem internet (Queue de sincronização).
- **Estilo:** Tailwind CSS para UI, seguindo o padrão de cores Zinc/Emerald que já utilizamos.



### 4. FORMATO DE SAÍDA ESPERADO
- Código Typescript para o `Main Process` (Electron) lidando com a API.
- Componente React (Tailwind) para a UI de configuração.
- Query SQL (SQLite) caso seja necessário alterar ou buscar dados na tabela `integrations`.

### 5. INPUTS DE REFERÊNCIA
[COLE AQUI O JSON DA API DO ERP OU O ERRO DO TERMINAL FEDORA]

