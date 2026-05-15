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
    
Você é um desenvolvedor sênior especializado em Electron, React, TypeScript, Vite, SQLite e sistemas PDV offline-first.

Estou desenvolvendo o Galberto PDV, um PDV desktop feito com Electron + React + TypeScript + Vite, usando SQLite com better-sqlite3.

Contexto:
- Existe uma tabela products no banco SQLite.
- O sistema é offline-first.
- O sistema hoje sincroniza produtos do Bling, mas também precisa permitir cadastro manual/local de produtos no próprio PDV.
- No futuro, o Bling será substituído por um ERP próprio.
- Já existe um formulário de cadastro/edição de produto, mas ele não captura todos os campos necessários.
- Quero refatorar o formulário atual para um cadastro em etapas, inspirado na organização do Bling, mas usando os campos que já existem na nossa tabela products.

Objetivo:
Ajustar o formulário de cadastro/edição de produtos para ser dividido em etapas/abas, deixando o cadastro mais organizado e completo, sem poluir a tela.

As etapas desejadas são:

1. Dados básicos
2. Preços
3. Estoque
4. Fiscal
5. Fornecedor
6. Avançado

Importante:
- Não reescreva a página inteira sem necessidade.
- Preserve os padrões atuais do projeto.
- Antes de alterar, analise a estrutura atual do formulário, componentes, hooks, services, repository, IPC e acesso ao banco.
- Reutilize componentes existentes sempre que possível.
- Mantenha compatibilidade com produtos vindos de integração externa.
- Produtos cadastrados manualmente devem ser tratados como produtos locais.
- Campos de integração externa e campos automáticos do sistema NÃO devem aparecer como campos editáveis comuns no formulário.

Tabela products possui muitos campos, mas eles devem ser classificados conforme abaixo.

==================================================
ETAPA 1 — DADOS BÁSICOS
==================================================

Campos que devem aparecer nessa etapa:

- name
- barcode
- sku
- category_id
- department
- brand
- unit
- active
- item_type
- product_group

Regras:
- name é obrigatório.
- unit é obrigatório.
- active deve ser um switch ou checkbox.
- barcode deve aceitar código de barras/EAN, mas não deve ser obrigatório.
- sku pode ser opcional. Se o sistema já tiver geração automática de código interno, preservar esse comportamento.
- category_id deve usar o padrão atual do sistema para categoria, se já existir.
- item_type deve ter opções amigáveis, por exemplo:
  - Produto
  - Serviço
  - Insumo
  - Composição
  - Outro

Textos de interface devem estar em português.

==================================================
ETAPA 2 — PREÇOS
==================================================

Campos que devem aparecer nessa etapa:

- sale_price_cents
- cost_price_cents
- purchase_price_cents

Regras:
- sale_price_cents é obrigatório.
- cost_price_cents é opcional, mas recomendado.
- purchase_price_cents é opcional.
- Os campos são armazenados no banco em centavos, mas devem ser exibidos/editados na interface em reais.
- Validar valores monetários para não permitir números negativos.
- Se o projeto já tiver componente utilitário para moeda, reutilizar.

Significado esperado:
- sale_price_cents: preço de venda.
- cost_price_cents: custo usado para margem/relatórios.
- purchase_price_cents: último preço de compra.

==================================================
ETAPA 3 — ESTOQUE
==================================================

Campos que devem aparecer nessa etapa:

- current_stock
- minimum_stock
- maximum_stock
- location
- expiration_date
- items_per_box
- packaging_barcode

Importante:
Esta etapa NÃO deve ser usada para registrar movimentações de entrada e saída de estoque.
Entradas, saídas, ajustes e inventário devem continuar em outra área/módulo de estoque.

Aqui o formulário deve apenas definir parâmetros cadastrais do produto:
- estoque atual inicial, se for produto novo;
- estoque mínimo;
- estoque máximo;
- localização;
- validade;
- itens por caixa;
- código de barras da embalagem.

Regras:
- current_stock deve ser exibido no cadastro, mas tome cuidado ao editar produto existente.
- Se já existir regra no sistema para não alterar estoque diretamente em produto existente, preservar essa regra.
- minimum_stock e maximum_stock não podem ser negativos.
- Se maximum_stock for informado, deve ser maior ou igual a minimum_stock.
- expiration_date é opcional.

==================================================
ETAPA 4 — FISCAL
==================================================

Campos que devem aparecer nessa etapa:

- ncm
- cfop
- origin
- cest
- taxes_json
- complementary_description
- additional_info
- production_type
- ipi_tax_class
- fci_number

Regras:
- ncm deve ser obrigatório se o produto for usado para emissão fiscal.
- cfop deve ser obrigatório se o produto for usado para emissão fiscal.
- origin deve ser obrigatório se o produto for usado para emissão fiscal.
- cest é opcional/condicional.
- taxes_json NÃO deve ser editado diretamente como JSON cru pelo operador comum.
- Se já existir estrutura de perfil tributário no projeto, usar essa estrutura.
- Se não existir, criar uma interface simples e amigável para preencher os principais dados tributários, gerando internamente o taxes_json.
- Não exibir textarea de JSON para usuário comum.
- complementary_description pode ser usado como descrição complementar fiscal.
- additional_info pode ser usado para informações adicionais do produto.
- production_type, ipi_tax_class e fci_number devem ficar em uma seção avançada dentro da etapa Fiscal, não como campos principais.

Sugestão de interface fiscal:
- NCM
- CEST
- CFOP padrão
- Origem
- Perfil tributário / Configuração tributária
- Descrição complementar
- Informações adicionais
- Avançado fiscal

==================================================
ETAPA 5 — FORNECEDOR
==================================================

Campos que devem aparecer nessa etapa:

- supplier_name
- supplier_code
- supplier_product_description
- supplier_warranty_months

Regras:
- Todos são opcionais.
- supplier_name pode ser texto livre por enquanto, se não existir tabela de fornecedores.
- supplier_code representa o código do produto no fornecedor.
- supplier_product_description representa a descrição usada pelo fornecedor.
- supplier_warranty_months deve aceitar apenas números inteiros maiores ou iguais a zero.

==================================================
ETAPA 6 — AVANÇADO
==================================================

Campos que devem aparecer nessa etapa:

- notes
- tags_group
- tags
- net_weight_kg
- gross_weight_kg
- width_cm
- height_cm
- depth_cm
- volumes
- is_variation
- parent_code
- product_condition
- clone_parent_data

Regras:
- Essa etapa deve ficar por último.
- Campos avançados devem ser opcionais.
- Não tornar o cadastro comum mais difícil por causa desses campos.
- notes deve ser usado para observações internas.
- tags pode ser texto livre ou campo de múltiplas tags, conforme padrão do projeto.
- is_variation deve ser booleano.
- parent_code só deve ser relevante se is_variation for verdadeiro.
- Pesos e dimensões não podem aceitar valores negativos.

==================================================
CAMPOS AUTOMÁTICOS / SISTEMA
==================================================

Os campos abaixo NÃO devem aparecer como editáveis comuns no formulário:

- id
- created_at
- updated_at
- deleted_at
- sync_status
- situation

Regras:
- id deve ser gerado pelo sistema.
- created_at e updated_at devem ser controlados automaticamente.
- deleted_at deve ser usado apenas em fluxo de exclusão/soft delete.
- sync_status deve ser controlado pelo sistema.
- situation, se for usado atualmente, deve respeitar o padrão existente do projeto.

==================================================
CAMPOS DE INTEGRAÇÃO EXTERNA
==================================================

Os campos abaixo NÃO devem aparecer no formulário de cadastro manual:

- external_id
- integration_source
- remote_created_at
- remote_updated_at
- last_synced_at
- raw_json
- external_image_urls
- external_link
- integration_code
- product_category_name

Regras para produto cadastrado manualmente:
- integration_source deve ser definido como "local".
- external_id deve ser null.
- raw_json deve ser null.
- external_link deve ser null.
- external_image_urls deve ser null.
- remote_created_at deve ser null.
- remote_updated_at deve ser null.
- last_synced_at deve ser null.
- sync_status deve ser "local_only", ou o valor equivalente já usado no projeto.

Importante:
Esses campos podem continuar existindo no banco para produtos vindos do Bling ou futuras integrações, mas não devem ser preenchidos pelo operador no cadastro manual.

==================================================
FISCAL AVANÇADO / CÁLCULO ESPECÍFICO
==================================================

Os campos abaixo não devem aparecer no formulário comum neste momento, exceto se já existir uma seção fiscal avançada no projeto:

- fixed_ipi_value_cents
- service_list_code
- icms_st_retention_base_cents
- icms_st_retention_value_cents
- icms_substitute_own_value_cents

Regras:
- Não remover esses campos do banco.
- Não quebrar produtos existentes que já possuam esses valores.
- Apenas preservar os valores existentes em edição, se o formulário não for alterá-los.
- Se criar suporte visual, colocar dentro de uma seção "Fiscal avançado", recolhida por padrão.

==================================================
VALIDAÇÕES GERAIS
==================================================

Implementar validações em TypeScript para:

- name obrigatório.
- unit obrigatório.
- sale_price_cents obrigatório e maior ou igual a zero.
- cost_price_cents maior ou igual a zero, se informado.
- purchase_price_cents maior ou igual a zero, se informado.
- current_stock maior ou igual a zero, se aplicável.
- minimum_stock maior ou igual a zero, se informado.
- maximum_stock maior ou igual a zero, se informado.
- maximum_stock deve ser maior ou igual a minimum_stock, se ambos forem informados.
- ncm deve conter formato válido quando informado.
- cfop deve conter formato válido quando informado.
- origin deve possuir valor permitido.
- supplier_warranty_months deve ser inteiro maior ou igual a zero.
- pesos e dimensões devem ser maiores ou iguais a zero.
- parent_code só deve ser exigido se is_variation for verdadeiro e o projeto exigir produto pai.

Mensagens de erro devem ser amigáveis e em português.

==================================================
UX / INTERFACE
==================================================

O formulário deve ser em etapas, usando abas, stepper ou navegação lateral, conforme padrão visual do projeto.

Etapas:

1. Dados básicos
2. Preços
3. Estoque
4. Fiscal
5. Fornecedor
6. Avançado

Requisitos de UX:
- Mostrar claramente em qual etapa o usuário está.
- Permitir avançar e voltar entre etapas.
- Não perder dados ao trocar de etapa.
- Mostrar erros de validação na etapa correspondente.
- Destacar etapas que possuem erro.
- Botões:
  - Voltar
  - Próximo
  - Salvar
  - Cancelar

Se possível:
- Exibir um resumo lateral ou no final antes de salvar.
- Manter o formulário simples para produto básico.
- Campos avançados devem ficar recolhidos ou em seções secundárias.

==================================================
REGRAS DE EDIÇÃO
==================================================

Ao editar produto existente:
- Carregar todos os dados já salvos.
- Não sobrescrever campos de integração externa com null se o produto veio do Bling.
- Não sobrescrever raw_json.
- Não sobrescrever external_id.
- Não sobrescrever remote_created_at/remote_updated_at/last_synced_at, exceto se já existir lógica específica no projeto.
- Preservar valores de campos que não aparecem no formulário.
- Atualizar updated_at.

Ao criar produto local:
- Preencher campos manuais vindos do formulário.
- Definir integration_source como "local".
- Definir sync_status como "local_only" ou valor equivalente do projeto.
- Gerar id.
- Definir created_at e updated_at.
- active deve vir do formulário, default true.

==================================================
CUIDADO COM ESTOQUE
==================================================

Esta refatoração não deve criar fluxo de entrada, saída, ajuste ou inventário.

A etapa Estoque serve apenas para cadastro/parâmetros do produto.

Se o produto já existe e o sistema possui controle de movimentação de estoque, não permitir alterar current_stock diretamente sem respeitar as regras existentes.

==================================================
ENTREGÁVEIS
==================================================

Implemente:

1. Refatoração do formulário de produto em etapas.
2. Inclusão dos campos manuais que ainda não estão sendo capturados.
3. Validações completas.
4. Conversão correta de valores monetários entre reais na interface e centavos no banco.
5. Preservação de campos de integração externa.
6. Preservação de campos automáticos do sistema.
7. Tratamento adequado para criação de produto local.
8. Tratamento adequado para edição de produto existente.
9. Mensagens de erro em português.
10. Tipos TypeScript atualizados, se necessário.
11. Ajustes no repository/service/IPC, se necessário, para salvar e carregar os novos campos.

Ao final, explique:
- Quais arquivos foram alterados.
- Como o formulário ficou organizado.
- Quais campos foram adicionados em cada etapa.
- Como testar o cadastro de produto local.
- Como testar a edição de produto vindo de integração sem perder dados externos.