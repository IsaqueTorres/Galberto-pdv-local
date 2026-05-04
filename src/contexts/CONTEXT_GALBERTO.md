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

GPT o problema nao é mais errorHandler e sim "CERTIFICATE_READ_FAILED: Não foi possível validar o certificado digital informado".

Ja validei que o certificado esta funcionando.
    - ele consegue ser validado no cmd pelo openssl
    - no linux ele conecta na SEFAZ e emite nfc-e no ambiente de homologacao.

openssl esta instalado.
    - Ele é chamado com sucesso com o comando openssl version -a no cmd.

o caminho do certificado esta correto
    - sem "" no path
    - existe o certificado no local

No linux tudo funciona porem no windows nao funciona.