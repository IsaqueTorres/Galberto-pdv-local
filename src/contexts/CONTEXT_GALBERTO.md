### 1. CONTEXTO DO SISTEMA
- **Nome:** Galberto PDV
- **Tipo:** PDV Desktop (Electron + React + TypeScript + Vite) Offline-first
- **Banco de Dados:** SQLite (better-sqlite3) - Offline-first.
- **Público:** Pequenos mercados e comércios locais.
- **Arquitetura:** - Existe uma tabela `integrations` para armazenar tokens, credenciais e configurações
- O sistema já consome dados do Bling, que é o sistema mestre de produtos, clientes e outras entidades de retaguarda. Porem no futuro sera integrado a um ERP que nos mesmos vamos desenvolver.



### 2. OBJETIVO DESSA TAREFA

Legal, gostei da sua apresentacao. Porem isso precisa ser um pouco mais facilitado para o usuario.

Na tela fiscal quero que voce deixe as informacoes do ambiente que foi salvo como se fosse em um dashboard, apenas mostrando e um botao  "alterar ambiente fiscal" onde abre o formulario de alteracao do ambiente, do jeito que esta hoje esta confuso e parece que nao esta configurado.

 Quero que essa tela de alteracao das informacoes fiscal apareca, quando abrir, um mock de alerta dizendo que alterar os dados pode causar interrupcao nas vendas e risco fiscal.

 Voce vai criar tambem um painel de status onde vai exibir o tempo de latencia da SEFAZ e informacoes de conexao, a ideia é o operador clicar ali apos configurar todo o ambiente e o PDV fazer os testes passo a passo e mostrar onde deu erro, exatamente igual voce comentou.

 Tipo

 Certificado okay           - Bolinha verde okay ou vermelha error
 SEFAZ respondeu ping
 JOBs criados e por ai vai






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

