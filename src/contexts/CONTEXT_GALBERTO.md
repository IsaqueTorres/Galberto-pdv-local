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

Corrija o bugs que voce encontrou, Importante: não resolva ainda o problema de sessão com SQLite/Zustand/AuthContext. Nesta tarefa, corrija exclusivamente o bug de roteamento das janelas no build causado por `loadFile` com `hash` mal aplicado ou ausente.

Contexto:
- Projeto Electron + React + TypeScript + Vite.
- Em desenvolvimento, as janelas abrem corretamente usando loadURL com hash, por exemplo `#/pdv`.
- No app instalado/build Windows, algumas janelas estão abrindo na rota inicial `/`, que é a tela de login, fazendo parecer que o sistema perdeu a autenticação.
- A investigação anterior mostrou que há chamadas incorretas de `loadFile`, onde o objeto `{ hash: "..." }` ficou fora da chamada por causa de vírgula/parênteses.



