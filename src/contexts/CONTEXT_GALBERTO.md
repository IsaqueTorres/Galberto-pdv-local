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
    
Da uma olhada nessa telas de cadastro da Bling, eu quero que voce faca o nosso formulario de cadastro em etapas, igual o bling, porem com os dados que nos armazenamos no banco.

Veja na tabela products no banco que temos varios campos la que nao estao sendo capturados no formularios da cadastro

Acredito que as etapas do cadastro que nosso formulario precisa sao:

Dados básicos
Preços
Estoque -> Aqui nao tera alteracao, apenas definir estoque minimo e maximo, entradas e saidas sera no outra aba estoque
Fiscal
Fornecedor
Avançado

