    ### 1. CONTEXTO DO SISTEMA

    * **Nome:** Galberto PDV
    * **Tipo:** PDV Desktop (**Electron + React + TypeScript + Vite**) offline-first
    * **Banco de dados:** SQLite (`better-sqlite3`)
    * **Público:** pequenos mercados e comércios locais
    * **Arquitetura atual:** existe uma tabela `integrations` para armazenar tokens, credenciais e configurações de integrações externas
    * O sistema já consome dados do **Bling**, que hoje é o sistema mestre de produtos, clientes e outras entidades de retaguarda
    * No futuro, o Bling será substituído por um ERP próprio

    ---

    ### 2. OBJETIVO DESTA TAREFA

Esses dados de conexao com o bling nunca mudam eles identificam o APP Galberto, e nao o cliente, entao nao deveriam estar embutidos no codigo?

client_id
client_secret
api_key

Oque vai ser diferete vai ser apenas o login e sennha do cliente, mas isso de qualquer forma ele vai fazer no navegador dele e nao no Galberto.