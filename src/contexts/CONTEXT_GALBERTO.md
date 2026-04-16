### 1. CONTEXTO DO SISTEMA
- **Nome:** Galberto PDV
- **Tipo:** PDV Desktop (Electron + React + TypeScript + Vite) Offline-first
- **Banco de Dados:** SQLite (better-sqlite3) - Offline-first.
- **Público:** Pequenos mercados e comércios locais.
- **Arquitetura:** - Existe uma tabela `integrations` para armazenar tokens, credenciais e configurações
- O sistema já consome dados do Bling, que é o sistema mestre de produtos, clientes e outras entidades de retaguarda
- O PDV é a frente de caixa e precisa ganhar a parte fiscal de emissão NFC-e

### 2. OBJETIVO DESSA TAREFA

Contexto:
- Já existe uma tabela `integrations`
- O sistema precisa ganhar persistência fiscal robusta
- O Bling é a origem de produtos/clientes; o PDV só consome esses dados
- Agora queremos a modelagem local necessária para emissão NFC-e e reprocessamento

Objetivo:
Criar a modelagem SQLite, migrations e repositórios TypeScript para suportar a camada fiscal do PDV.

Crie as tabelas necessárias para o MVP fiscal:
- `stores`
- `sales`
- `sale_items`
- `payments`
- `fiscal_documents`
- `fiscal_events`
- `sync_queue`
- `printers` (se necessário para impressão)
- reutilizar `integrations` apenas para credenciais/config

Se algumas dessas tabelas já puderem existir no sistema, escreva a solução de forma incremental, com migrations seguras e idempotentes.

Requisitos de modelagem:
1. `fiscal_documents` deve armazenar pelo menos:
   - id
   - sale_id
   - store_id
   - model (65)
   - series
   - number
   - access_key
   - environment (homologation/production)
   - status
   - xml
   - xml_signed
   - protocol
   - receipt_number
   - qr_code_url
   - authorization_datetime
   - cancel_datetime
   - contingency_type
   - rejection_code
   - rejection_reason
   - created_at
   - updated_at

2. `fiscal_events` deve armazenar:
   - id
   - fiscal_document_id
   - event_type
   - payload_json
   - response_json
   - status
   - created_at

3. `sync_queue` deve suportar:
   - id
   - entity_type
   - entity_id
   - operation
   - payload_json
   - status
   - attempts
   - next_attempt_at
   - last_error
   - created_at
   - updated_at

4. Criar índices úteis
5. Garantir integridade referencial possível dentro do SQLite
6. Implementar repositories com better-sqlite3
7. Implementar métodos de transação
8. Implementar idempotência para evitar duas emissões para a mesma venda

O que você deve entregar:
- migrations SQL ou em TypeScript
- tipos/interfaces de domínio
- repositories completos
- exemplos de uso
- helpers utilitários
- comentários objetivos no código

Também quero que você defina os enums/status para:
- `FiscalDocumentStatus`
- `QueueStatus`
- `FiscalEventType`

No final, explique brevemente como essa modelagem suporta:
- emissão
- cancelamento
- reimpressão
- contingência
- reprocessamento

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

