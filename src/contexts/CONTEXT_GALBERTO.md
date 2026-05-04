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

O nosso PDV é um SaaS ou seja, o cliente usa e paga por mes. Porem nao temos ainda 