### 1. CONTEXTO DO SISTEMA
- **Nome:** Galberto PDV
- **Tipo:** PDV Desktop (Electron + React + TypeScript + Vite) Offline-first
- **Banco de Dados:** SQLite (better-sqlite3) - Offline-first.
- **Público:** Pequenos mercados e comércios locais.
- **Arquitetura:** - Existe uma tabela `integrations` para armazenar tokens, credenciais e configurações
- O sistema já consome dados do Bling, que é o sistema mestre de produtos, clientes e outras entidades de retaguarda. Porem no futuro sera integrado a um ERP que nos mesmos vamos desenvolver.



### 2. OBJETIVO DESSA TAREFA

Certo GPT, para essa atividade ja temos o seguinte.

1 - Credenciamento no ambiente de homologacao da SEFAZ-SP.
2 - CSC valido.
3 - Certificado digital ICP-Brasil.

Ainda precisamos montar o XML fiscal, quando finalizo a venda somente faco as movimentacoes de baixar estoque no banco e guardar as informacoes, precisamos transformar a venda no XML. 

- **identificação da nota**: UF, ambiente, modelo, série, número, data/hora, tipo de emissão;
    Aqui ja temos armazenados, UF, Ambiente, modelo

- **emitente**: CNPJ, IE, razão social/nome, endereço e regime tributário compatíveis com o cadastro fiscal;


- **itens**: código do produto, descrição, unidade, quantidade, valor unitário, valor total, NCM e demais dados tributários aplicáveis;
- **impostos**: CST/CSOSN e demais tributos conforme o regime da empresa e as regras aplicáveis;
- **totais**: total dos produtos, descontos, frete, acréscimos, total final;
- **pagamento**: a documentação técnica tornou obrigatório o preenchimento do grupo de pagamentos para NF-e/NFC-e;
- **consumidor/destinatário**, quando identificado;
- **informações adicionais**, quando necessárias.







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

