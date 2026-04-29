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


- A SEFAZ retornou rejeição 481:

{
  "status": "REJECTED",
  "provider": "sefaz-direct",
  "statusCode": "481",
  "statusMessage": "Rejeição: Código Regime Tributário do emitente diverge do cadastro na SEFAZ"
}

Problema:
O formulário/configuração fiscal do PDV atualmente não possui a opção "Simples Nacional - MEI".
Por isso, o sistema provavelmente está salvando/enviando `CRT = 1` , mas para MEI deve enviar `CRT = 4`.

Objetivo:
Adicionar suporte completo ao regime tributário MEI no sistema, garantindo que:
- O formulário permita selecionar MEI
- O banco persista corretamente o store
- O XML da NFC-e envie `<CRT>4</CRT>`
- A montagem dos impostos use CSOSN compatível com MEI/Simples Nacional
- A rejeição 481 seja eliminada quando o emitente estiver cadastrado como MEI na SEFAZ

Referência fiscal:
- A Nota Técnica 2024.001 criou/incluiu o CRT 4 para MEI em NF-e/NFC-e.
- Códigos esperados:
  - CRT = 1: Simples Nacional
  - CRT = 2: Simples Nacional - excesso de sublimite de receita bruta
  - CRT = 3: Regime Normal
  - CRT = 4: Simples Nacional - Microempreendedor Individual - MEI

Tarefa:
Revise e altere o código para implementar suporte ao CRT 4.

Passos obrigatórios:

1. Localizar configuração fiscal do emitente
Procure onde o sistema salva/lê dados fiscais da empresa/emitente, especialmente:
- CRT
- regime tributário
- inscrição estadual
- CNPJ
- UF
- ambiente de emissão
- configurações usadas para montar XML NFC-e

Pode estar em:
- tabela SQLite de empresa/configurações
- tabela `integrations`
- store/local config
- formulário React
- services de emissão fiscal
- gerador XML NFC-e

2. Ajustar modelo/tipos TypeScript
Atualize qualquer union, enum, schema ou tipo que hoje aceite apenas `1 | 2 | 3`.

O tipo correto deve aceitar:

type TaxRegimeCode = 1 | 2 | 3 | 4;

ou enum equivalente:

enum TaxRegimeCode {
  SIMPLES_NACIONAL = 1,
  SIMPLES_NACIONAL_EXCESSO_SUBLIMITE = 2,
  REGIME_NORMAL = 3,
  MEI = 4
}

Garanta que nenhum parser, validator, zod schema, formulário ou camada de persistência bloqueie o valor 4.

3. Ajustar formulário fiscal
No formulário de configuração fiscal da empresa, adicionar a opção:

Label: Simples Nacional - MEI
Valor: 4

A lista final deve ter, no mínimo:
- Simples Nacional — valor 1
- Simples Nacional - excesso de sublimite — valor 2
- Regime Normal — valor 3
- Simples Nacional - MEI — valor 4

Se o sistema tiver uma opção simplificada para pequenos comércios, a opção MEI deve aparecer claramente.

4. Ajustar persistência SQLite
Verifique se o campo de CRT/regime tributário:
- aceita o valor 4
- não tem constraint antiga limitada a 1, 2, 3
- não converte valor desconhecido para 1 ou 3
- não salva string inválida

Se houver migration necessária, crie uma migration segura.

Exemplo desejado:
- `tax_regime_code INTEGER NOT NULL`
- valores aceitos: 1, 2, 3, 4

Se houver CHECK constraint, atualizar para:
CHECK (tax_regime_code IN (1, 2, 3, 4))

5. Ajustar geração do XML
Na montagem do XML da NFC-e, garantir que para emitente MEI:

---

### 3. O QUE EU PRECISO QUE VOCÊ FAÇA

Quero que você faça uma **análise técnica do sistema atual** para identificar:

1. **quais informações já existem armazenadas** e podem ser reaproveitadas para emissão de NFC-e;
2. **quais informações obrigatórias para montar o XML ainda não existem**;
3. **onde cada informação está armazenada hoje**;
4. **qual tabela atual pode ser reaproveitada** e **qual tabela nova deve ser criada**, se necessário.

---

### 4. TABELAS FISCAIS JÁ EXISTENTES

Hoje o PDV já possui estas tabelas relacionadas a fiscal:

* `fiscal_documents`
* `fiscal_events`
* `fiscal_queue`

Minha leitura inicial é:

* `fiscal_documents`: possivelmente para armazenar documentos fiscais emitidos ou em emissão;
* `fiscal_events`: para armazenar eventos fiscais como emissão, autorização, rejeição, cancelamento, inutilização etc.;
* `fiscal_queue`: para controlar a fila de processamento/reprocessamento dos eventos/documentos fiscais.

**Importante:**
Não assuma que alguma dessas tabelas serve para armazenar configuração fiscal da empresa.
Quero que você analise tecnicamente se alguma delas pode ser reaproveitada ou se o correto é criar uma nova tabela específica para configuração fiscal.

---

### 5. DADOS NECESSÁRIOS PARA MONTAR O XML DA NFC-e

Precisamos garantir armazenamento adequado para os grupos de dados abaixo:

#### identificação da nota

* UF
* ambiente
* modelo
* série
* número
* data/hora
* tipo de emissão

#### emitente

* CNPJ
* IE
* razão social / nome
* endereço completo
* regime tributário compatível com o cadastro fiscal

#### itens

* código do produto
* descrição
* unidade
* quantidade
* valor unitário
* valor total
* NCM
* demais dados tributários aplicáveis

#### impostos

* CST / CSOSN
* demais tributos conforme regime tributário e regras fiscais aplicáveis

#### totais

* total dos produtos
* descontos
* frete
* acréscimos
* total final

#### pagamento

* grupo de pagamento obrigatório para NFC-e

#### consumidor / destinatário

* quando identificado

#### informações adicionais

* quando necessárias

---

### 6. O QUE EU ESPERO DA ANÁLISE

Quero que você faça um levantamento completo e me entregue uma resposta estruturada com:

#### A. Inventário do que já existe

Para cada informação necessária à emissão, diga:

* se já existe no sistema;
* em qual tabela/campo está;
* se o dado parece confiável para uso fiscal;
* se precisa de ajuste.

#### B. O que está faltando

Liste tudo o que ainda não existe e precisa ser:

* armazenado;
* solicitado ao cliente;
* derivado/calculado;
* ou definido por configuração.

#### C. Separação por responsabilidade

Quero que você classifique as informações em grupos:

1. **configuração fiscal da empresa**
   Ex.: ambiente, CSC, série padrão, regime tributário, dados do emitente, certificado etc.

2. **dados transacionais da venda**
   Ex.: itens vendidos, quantidades, total, descontos, pagamentos etc.

3. **documento fiscal gerado**
   Ex.: XML, chave, número, protocolo, status, retorno da SEFAZ etc.

4. **eventos e fila fiscal**
   Ex.: autorização, rejeição, cancelamento, retry, processamento etc.

#### D. Proposta de modelagem

Quero que você diga objetivamente:

* se alguma tabela existente pode ser reaproveitada para cada responsabilidade;
* se precisa criar uma nova tabela;
* qual seria o melhor nome da nova tabela;
* quais campos ela deveria ter.

---

### 7. REGRAS IMPORTANTES

* não implemente nada ainda sem antes analisar o schema atual;
* não assuma que `integrations` é o local correto para configuração fiscal;
* não assuma que `fiscal_documents`, `fiscal_events` ou `fiscal_queue` servem para configuração;
* primeiro identifique o que já existe no banco e no código;
* considere também tipos/interfaces TypeScript e formulários já existentes;
* preserve compatibilidade com a arquitetura offline-first;
* o objetivo agora **não é montar o XML ainda**, e sim garantir que teremos todos os dados organizados corretamente antes dessa etapa.

---

### 8. FORMATO DA RESPOSTA

Quero que você me devolva:

1. análise das tabelas atuais relevantes;
2. análise dos campos já disponíveis;
3. lista do que falta;
4. proposta de onde armazenar cada grupo de informação;
5. recomendação final sobre:

   * reutilizar tabela existente
   * ou criar nova tabela específica para configuração fiscal.

Se possível, organize a resposta em forma de matriz:

* **informação**
* **já existe?**
* **onde está hoje?**
* **serve para uso fiscal?**
* **falta complementar algo?**
* **onde deve ficar no modelo final?**




  - Descrição: CANETA ESFEROGRAFICA AZUL TESTE
  - Código/SKU: TESTE-CANETA-001
  - GTIN/EAN: deixar vazio ou SEM GTIN, se o Bling permitir
  - Unidade: UN
  - Preço: 1,00
  - NCM: 96081000
  - CEST: 1902700
  - Origem: 0 - Nacional
  - CFOP: 5102
  - CST/CSOSN ICMS: 102
  - PIS CST: 49
  - COFINS CST: 49
  - Situação: Ativo


  NCM: 96081000
  CEST: 1902700
  Origem: 0
  CFOP: 5102
  CSOSN: 102
  PIS CST: 49
  COFINS CST: 49


{
    "id": 16639418987,
    "nome": "CANETA ESFEROGRAFICA AZUL",
    "codigo": "TESTE-CANETA-001",
    "preco": 0.9,
    "estoque": {
        "minimo": 0,
        "maximo": 0,
        "crossdocking": 0,
        "localizacao": "",
        "saldoVirtualTotal": 50
    },
    "tipo": "P",
    "situacao": "A",
    "formato": "S",
    "descricaoCurta": "",
    "dataValidade": "0000-00-00",
    "unidade": "Un",
    "pesoLiquido": 0,
    "pesoBruto": 0,
    "volumes": 0,
    "itensPorCaixa": 0,
    "gtin": "",
    "gtinEmbalagem": "",
    "tipoProducao": "P",
    "condicao": 1,
    "freteGratis": false,
    "marca": "",
    "descricaoComplementar": "",
    "linkExterno": "",
    "observacoes": "",
    "descricaoEmbalagemDiscreta": "",
    "categoria": {
        "id": 13410739
    },
    "fornecedor": {
        "id": 0,
        "contato": {
            "id": 0,
            "nome": ""
        },
        "codigo": "",
        "precoCusto": 0,
        "precoCompra": 0
    },
    "actionEstoque": "",
    "dimensoes": {
        "largura": 0,
        "altura": 0,
        "profundidade": 0,
        "unidadeMedida": 1
    },
    "tributacao": {
        "origem": 0,
        "nFCI": "",
        "ncm": "9608.10.00",
        "cest": "19.027.00",
        "codigoListaServicos": "",
        "spedTipoItem": "00",
        "codigoItem": "",
        "percentualTributos": 0,
        "valorBaseStRetencao": 0,
        "valorStRetencao": 0,
        "valorICMSSubstituto": 0,
        "codigoExcecaoTipi": "0",
        "classeEnquadramentoIpi": "",
        "valorIpiFixo": 0,
        "codigoSeloIpi": "",
        "valorPisFixo": 0,
        "valorCofinsFixo": 0,
        "codigoANP": "",
        "descricaoANP": "",
        "percentualGLP": 0,
        "percentualGasNacional": 0,
        "percentualGasImportado": 0,
        "valorPartida": 0,
        "tipoArmamento": 0,
        "descricaoCompletaArmamento": "",
        "dadosAdicionais": "Produto cadastrado para teste de emissão NFC-e em homologação.",
        "grupoProduto": {
            "id": 0
        }
    },
    "midia": {
        "video": {
            "url": ""
        },
        "imagens": {
            "externas": [],
            "internas": [],
            "imagensURL": []
        }
    },
    "linhaProduto": {
        "id": 0
    },
    "estrutura": {
        "tipoEstoque": "",
        "lancamentoEstoque": "",
        "componentes": []
    },
    "camposCustomizados": [],
    "variacoes": [],
    "artigoPerigoso": false
}


